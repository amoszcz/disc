import type { MapSquare } from "./MapLoader";

export interface IMapRenderer {
  draw(params: {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    gridSize: number;
    cellSize: number;
    offsetX: number;
    offsetY: number;
    player: {
      row: number;
      col: number;
      x: number;
      y: number;
      selected: boolean;
      targetX: number | null;
      targetY: number | null;
      isMoving: boolean;
    };
    squares: MapSquare[];
  }): void;
}

export class DefaultCanvasRenderer implements IMapRenderer {
  draw({ ctx, canvas, gridSize, cellSize, offsetX, offsetY, player, squares }: Parameters<IMapRenderer["draw"]>[0]): void {
    // Clear background
    ctx.fillStyle = "#fafafa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid border
    const size = cellSize * gridSize;
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, size, size);

    // Grid lines
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    for (let i = 1; i < gridSize; i++) {
      const x = offsetX + i * cellSize;
      const y = offsetY + i * cellSize;
      ctx.beginPath();
      ctx.moveTo(x, offsetY);
      ctx.lineTo(x, offsetY + size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(offsetX, y);
      ctx.lineTo(offsetX + size, y);
      ctx.stroke();
    }

    // Coordinates
    ctx.fillStyle = "#666";
    ctx.font = `${Math.max(10, Math.floor(cellSize * 0.4))}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let c = 0; c < gridSize; c++) {
      const x = offsetX + c * cellSize + cellSize / 2;
      const y = offsetY - Math.min(16, Math.floor(cellSize * 0.6));
      ctx.fillText(String(c), x, y);
    }
    for (let r = 0; r < gridSize; r++) {
      const x = offsetX - Math.min(16, Math.floor(cellSize * 0.6));
      const y = offsetY + r * cellSize + cellSize / 2;
      ctx.fillText(String(r), x, y);
    }

    // Squares (collectibles)
    const pad = Math.max(2, Math.floor(cellSize * 0.1));
    ctx.lineWidth = 2;
    for (const sq of squares) {
      const x = offsetX + sq.col * cellSize + pad;
      const y = offsetY + sq.row * cellSize + pad;
      const s = cellSize - pad * 2;
      ctx.fillStyle = "#d84315";
      ctx.strokeStyle = "#bf360c";
      ctx.fillRect(x, y, s, s);
      ctx.strokeRect(x, y, s, s);
    }

    // Player (triangle)
    const cx = player.x;
    const cy = player.y;
    const tri = Math.max(6, Math.floor(cellSize * 0.4));
    const p1 = { x: cx, y: cy - tri };
    const p2 = { x: cx - tri, y: cy + tri };
    const p3 = { x: cx + tri, y: cy + tri };

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.closePath();

    ctx.fillStyle = player.selected ? "#2e7d32" : "#1976d2";
    ctx.fill();
    ctx.lineWidth = player.selected ? 3 : 2;
    ctx.strokeStyle = player.selected ? "#ffd54f" : "#0d47a1";
    ctx.stroke();

    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.font = `${Math.max(10, Math.floor(cellSize * 0.35))}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`(${player.row},${player.col})`, cx, cy + tri + 4);

    // Target marker
    if (player.isMoving && player.targetX !== null && player.targetY !== null) {
      ctx.strokeStyle = "#8e24aa";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(player.targetX, player.targetY, Math.max(6, tri * 0.7), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Footer
    ctx.fillStyle = "#555";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      "Click triangle to select, then click a cell to move. Press R to return to menu.",
      canvas.width / 2,
      offsetY + cellSize * gridSize + 30,
    );
  }
}
