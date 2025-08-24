export type MapSquare = { id: string; row: number; col: number };
export type MapSnapshot = {
  playerRow: number;
  playerCol: number;
  playerSelected: boolean;
  squares: MapSquare[];
};

export type MapModuleOptions = {
  gridSize?: number; // default 20
  paddingRatio?: number; // default 0.1 of min(canvas)
  initialState?: MapSnapshot;
};

export class MapModule {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rafId: number | null = null;
  private running = false;

  private gridSize: number;
  private paddingRatio: number;

  private offsetX = 0;
  private offsetY = 0;
  private cellSize = 0;

  // Player state (grid coords)
  private playerRow = 10;
  private playerCol = 10;
  private playerSelected = false;

  // Player state (pixel coords and movement)
  private playerX = 0;
  private playerY = 0;
  private targetRow: number | null = null;
  private targetCol: number | null = null;
  private targetX: number | null = null;
  private targetY: number | null = null;
  private isMoving = false;
  private moveSpeedPxPerSec = 300; // movement speed
  private lastTime: number | null = null;

  // Squares (collectibles)
  private squares: MapSquare[] = [];
  private squaresInitialized = false;

  public onExit?: () => void;
  public onSquareReached?: (squareId: string, snapshot: MapSnapshot) => void;

  constructor(canvasId: string = "game", opts: MapModuleOptions = {}) {
    const canvas = document.getElementById(
      canvasId,
    ) as HTMLCanvasElement | null;
    if (!canvas) throw new Error(`Canvas '${canvasId}' not found`);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context not available");

    this.canvas = canvas;
    this.ctx = ctx;

    this.gridSize = opts.gridSize ?? 20;
    this.paddingRatio = opts.paddingRatio ?? 0.1;

    // Initialize from snapshot or defer square creation until start()
    if (opts.initialState) {
      this.playerRow = opts.initialState.playerRow;
      this.playerCol = opts.initialState.playerCol;
      this.playerSelected = opts.initialState.playerSelected;
      this.squares = opts.initialState.squares.map((s) => ({ ...s }));
      this.squaresInitialized = true;
    } else {
      this.playerRow = 10;
      this.playerCol = 10;
      this.playerSelected = false;
      // squares will be generated once in start()
    }

    this.handleResize = this.handleResize.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  private generateInitialSquares(count: number): MapSquare[] {
    console.log("generateInitialSquares");
    const squares: MapSquare[] = [];
    const used = new Set<string>();
    const key = (r: number, c: number) => `${r}:${c}`;
    used.add(key(this.playerRow, this.playerCol));
    while (squares.length < count) {
      const r = Math.floor(Math.random() * this.gridSize);
      const c = Math.floor(Math.random() * this.gridSize);
      const k = key(r, c);
      if (used.has(k)) continue;
      used.add(k);
      squares.push({
        id: `sq-${Date.now()}-${squares.length}-${Math.random()}`,
        row: r,
        col: c,
      });
    }
    return squares;
  }

  public getSnapshot(): MapSnapshot {
    return {
      playerRow: this.playerRow,
      playerCol: this.playerCol,
      playerSelected: this.playerSelected,
      squares: this.squares.map((s) => ({ ...s })),
    };
  }

  public start(): void {
    if (this.running) return;
    this.running = true;

    // Lazily initialize squares once per MapModule lifetime
    if (!this.squaresInitialized) {
      this.squares = this.generateInitialSquares(2);
      this.squaresInitialized = true;
    }

    window.addEventListener("resize", this.handleResize);
    this.canvas.addEventListener("click", this.onClick);
    window.addEventListener("keydown", this.onKeyDown);

    this.handleResize();
    // Initialize player pixel position at current cell center
    const c = this.cellCenter(this.playerRow, this.playerCol);
    this.playerX = c.x;
    this.playerY = c.y;
    this.lastTime = null;
    this.loop();
  }

  public stop(): void {
    if (!this.running) return;
    this.running = false;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.rafId = null;

    window.removeEventListener("resize", this.handleResize);
    this.canvas.removeEventListener("click", this.onClick);
    window.removeEventListener("keydown", this.onKeyDown);
  }

  private handleResize(): void {
    // Assume canvas already sized by host; compute square area
    const w = this.canvas.width;
    const h = this.canvas.height;
    const side = Math.min(w, h) * (1 - this.paddingRatio * 2);
    this.cellSize = Math.floor(side / this.gridSize);

    const gridPixelSize = this.cellSize * this.gridSize;
    this.offsetX = Math.floor((w - gridPixelSize) / 2);
    this.offsetY = Math.floor((h - gridPixelSize) / 2);

    // Recompute pixel centers for current logical position and target
    const currentCenter = this.cellCenter(this.playerRow, this.playerCol);
    if (!this.isMoving) {
      this.playerX = currentCenter.x;
      this.playerY = currentCenter.y;
    }
    if (this.targetRow !== null && this.targetCol !== null) {
      const t = this.cellCenter(this.targetRow, this.targetCol);
      this.targetX = t.x;
      this.targetY = t.y;
    }
  }

  private loop = (time?: number): void => {
    if (!this.running) return;

    // Time step
    if (this.lastTime === null && typeof time === "number")
      this.lastTime = time;
    const dt =
      typeof time === "number" && this.lastTime !== null
        ? (time - this.lastTime) / 1000
        : 0;
    if (typeof time === "number") this.lastTime = time ?? this.lastTime;

    // Update movement
    if (dt > 0) this.updateMovement(dt);

    // Clear
    this.ctx.fillStyle = "#fafafa";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw
    this.drawGrid();
    this.drawCoordinates();
    this.drawSquares();
    this.drawPlayer();

    // Footer hint
    this.ctx.fillStyle = "#555";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Click triangle to select, then click a cell to move. Press R to return to menu.",
      this.canvas.width / 2,
      this.offsetY + this.cellSize * this.gridSize + 30,
    );

    this.rafId = requestAnimationFrame(this.loop);
  };

  private drawGrid(): void {
    const g = this.gridSize;
    const size = this.cellSize * g;

    // Outer square
    this.ctx.strokeStyle = "#333";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.offsetX, this.offsetY, size, size);

    // Grid lines
    this.ctx.strokeStyle = "#ddd";
    this.ctx.lineWidth = 1;

    for (let i = 1; i < g; i++) {
      const x = this.offsetX + i * this.cellSize;
      const y = this.offsetY + i * this.cellSize;
      // vertical
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.offsetY);
      this.ctx.lineTo(x, this.offsetY + size);
      this.ctx.stroke();
      // horizontal
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX, y);
      this.ctx.lineTo(this.offsetX + size, y);
      this.ctx.stroke();
    }
  }

  private drawCoordinates(): void {
    this.ctx.fillStyle = "#666";
    this.ctx.font = `${Math.max(10, Math.floor(this.cellSize * 0.4))}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // Column indices on top
    for (let c = 0; c < this.gridSize; c++) {
      const x = this.offsetX + c * this.cellSize + this.cellSize / 2;
      const y = this.offsetY - Math.min(16, Math.floor(this.cellSize * 0.6));
      this.ctx.fillText(String(c), x, y);
    }

    // Row indices on left
    for (let r = 0; r < this.gridSize; r++) {
      const x = this.offsetX - Math.min(16, Math.floor(this.cellSize * 0.6));
      const y = this.offsetY + r * this.cellSize + this.cellSize / 2;
      this.ctx.fillText(String(r), x, y);
    }
  }

  private drawSquares(): void {
    const pad = Math.max(2, Math.floor(this.cellSize * 0.1));
    this.ctx.lineWidth = 2;
    for (const sq of this.squares) {
      const x = this.offsetX + sq.col * this.cellSize + pad;
      const y = this.offsetY + sq.row * this.cellSize + pad;
      const size = this.cellSize - pad * 2;
      this.ctx.fillStyle = "#d84315"; // deep orange
      this.ctx.strokeStyle = "#bf360c";
      this.ctx.fillRect(x, y, size, size);
      this.ctx.strokeRect(x, y, size, size);
    }
  }

  private drawPlayer(): void {
    const cx = this.playerX;
    const cy = this.playerY;
    const s = Math.max(6, Math.floor(this.cellSize * 0.4)); // triangle size

    // Triangle points (upright)
    const p1 = { x: cx, y: cy - s };
    const p2 = { x: cx - s, y: cy + s };
    const p3 = { x: cx + s, y: cy + s };

    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.lineTo(p3.x, p3.y);
    this.ctx.closePath();

    this.ctx.fillStyle = this.playerSelected ? "#2e7d32" : "#1976d2";
    this.ctx.fill();

    this.ctx.lineWidth = this.playerSelected ? 3 : 2;
    this.ctx.strokeStyle = this.playerSelected ? "#ffd54f" : "#0d47a1";
    this.ctx.stroke();

    // Coordinates text near the player
    this.ctx.fillStyle = "rgba(0,0,0,0.7)";
    this.ctx.font = `${Math.max(10, Math.floor(this.cellSize * 0.35))}px Arial`;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "top";
    this.ctx.fillText(`(${this.playerRow},${this.playerCol})`, cx, cy + s + 4);

    // If moving, draw a subtle target marker
    if (this.isMoving && this.targetX !== null && this.targetY !== null) {
      this.ctx.strokeStyle = "#8e24aa";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(
        this.targetX,
        this.targetY,
        Math.max(6, s * 0.7),
        0,
        Math.PI * 2,
      );
      this.ctx.stroke();
    }
  }

  private onClick(ev: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    const pos = this.pixelToCell(x, y);
    if (!pos) return;

    // If clicking player's current cell: toggle selection
    if (pos.row === this.playerRow && pos.col === this.playerCol) {
      this.playerSelected = !this.playerSelected;
      return;
    }

    // If player is selected and clicked somewhere else on the map: set destination
    if (this.playerSelected) {
      // Clamp inside map
      const destRow = Math.max(0, Math.min(this.gridSize - 1, pos.row));
      const destCol = Math.max(0, Math.min(this.gridSize - 1, pos.col));
      this.setDestination(destRow, destCol);
      return;
    }

    // Otherwise, clicking elsewhere deselects
    this.playerSelected = false;
  }

  private onKeyDown(ev: KeyboardEvent): void {
    if (ev.key.toLowerCase() === "r") {
      this.stop();
      if (this.onExit) this.onExit();
    }
  }

  private pixelToCell(
    px: number,
    py: number,
  ): { row: number; col: number } | null {
    const size = this.cellSize * this.gridSize;
    if (
      px < this.offsetX ||
      py < this.offsetY ||
      px > this.offsetX + size ||
      py > this.offsetY + size
    ) {
      return null;
    }
    const col = Math.floor((px - this.offsetX) / this.cellSize);
    const row = Math.floor((py - this.offsetY) / this.cellSize);
    return { row, col };
  }

  private cellCenter(row: number, col: number): { x: number; y: number } {
    const x = this.offsetX + col * this.cellSize + this.cellSize / 2;
    const y = this.offsetY + row * this.cellSize + this.cellSize / 2;
    return { x, y };
  }

  private setDestination(row: number, col: number): void {
    this.targetRow = row;
    this.targetCol = col;
    const t = this.cellCenter(row, col);
    this.targetX = t.x;
    this.targetY = t.y;
    this.isMoving = true;
  }

  private updateMovement(dt: number): void {
    if (!this.isMoving || this.targetX === null || this.targetY === null)
      return;

    const dx = this.targetX - this.playerX;
    const dy = this.targetY - this.playerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const step = this.moveSpeedPxPerSec * dt;

    if (dist <= step || dist === 0) {
      // Snap to target
      this.playerX = this.targetX;
      this.playerY = this.targetY;
      this.playerRow = this.targetRow ?? this.playerRow;
      this.playerCol = this.targetCol ?? this.playerCol;
      this.isMoving = false;
      // Check square collision upon arrival
      const hit = this.squares.find(
        (s) => s.row === this.playerRow && s.col === this.playerCol,
      );
      if (hit && this.onSquareReached) {
        // Emit with current snapshot
        this.onSquareReached(hit.id, this.getSnapshot());
      }
      return;
    }

    const nx = dx / dist;
    const ny = dy / dist;
    this.playerX += nx * step;
    this.playerY += ny * step;
  }
}
