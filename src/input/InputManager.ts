import type { GameStateManager } from "../game/GameState.js";
import type { Renderer } from "../rendering/Renderer.js";
import { mapKeyToAction } from "./InputLogic.js";

export class InputManager {
  private gameStateManager: GameStateManager;
  private renderer: Renderer;
  private canvas: HTMLCanvasElement;
  private attackMessage: string = "";
  private attackMessageTime: number = 0;

  private onMouseMove = (event: MouseEvent) => this.handleMouseMove(event);
  private onClick = (event: MouseEvent) => this.handleMouseClick(event);
  private onKeyDown = (event: KeyboardEvent) => this.handleKeyDown(event);
  private attached: boolean = false;

  constructor(
    canvas: HTMLCanvasElement,
    gameStateManager: GameStateManager,
    renderer: Renderer,
  ) {
    this.canvas = canvas;
    this.gameStateManager = gameStateManager;
    this.renderer = renderer;
    this.attachEventListeners();
  }

  public attachEventListeners(): void {
    if (this.attached) return;
    this.canvas.addEventListener("mousemove", this.onMouseMove);
    this.canvas.addEventListener("click", this.onClick);
    window.addEventListener("keydown", this.onKeyDown);
    this.attached = true;
  }

  public detachEventListeners(): void {
    if (!this.attached) return;
    this.canvas.removeEventListener("mousemove", this.onMouseMove);
    this.canvas.removeEventListener("click", this.onClick);
    window.removeEventListener("keydown", this.onKeyDown);
    this.attached = false;
  }

  private handleMouseMove(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const buttonManager = this.renderer.getUIRenderer().getButtonManager();
    buttonManager.handleMouseMove(mouseX, mouseY);
  }

  private handleMouseClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const buttonManager = this.renderer.getUIRenderer().getButtonManager();
    const buttonClicked = buttonManager.handleMouseClick(mouseX, mouseY);

    if (!buttonClicked && this.gameStateManager.gameStatus === "playing") {
      this.handleUnitSelection(mouseX, mouseY);
    }
  }

  private handleUnitSelection(mouseX: number, mouseY: number): void {
    const boardPos = this.gameStateManager.getBoardPositionFromPixels(
      mouseX,
      mouseY,
    );

    if (boardPos) {
      const unit = this.gameStateManager.getUnitAt(boardPos.row, boardPos.col);

      if (unit) {
        // If we have a selected unit and clicked on a different unit
        if (
          this.gameStateManager.gameState.selectedUnit &&
          this.gameStateManager.gameState.selectedUnit !== unit
        ) {
          // First check if the selected unit can attack/heal the target
          const unitManager = this.gameStateManager
            .getBoardManager()
            .getUnitManager();
          const canAttackTarget = unitManager.canAttackTarget(
            this.gameStateManager.gameState.selectedUnit,
            boardPos.row,
            boardPos.col,
            this.gameStateManager.gameState.board,
          );

          if (canAttackTarget) {
            // Can attack/heal this target - perform the action
            const attackResult = this.gameStateManager.attemptAttack(
              boardPos.row,
              boardPos.col,
            );
            if (attackResult && attackResult.success) {
              this.showAttackMessage(attackResult.message);
            } else if (attackResult && !attackResult.success) {
              this.showAttackMessage(attackResult.message);
            }
          } else {
            // Cannot attack/heal target, check if it's a friendly unit we can select instead
            if (unit.team === this.gameStateManager.gameState.currentTurn) {
              // Try to select the friendly unit instead
              const wasSelected = this.gameStateManager.selectUnit(
                boardPos.row,
                boardPos.col,
              );
              if (!wasSelected) {
                // If we can't select it (inactive unit), deselect all
                this.gameStateManager.deselectAllUnits();
              }
            } else {
              // Different team but can't attack - show message or deselect
              this.gameStateManager.deselectAllUnits();
            }
          }
        } else {
          // No unit selected or clicked on the same unit - try to select the clicked unit
          const wasSelected = this.gameStateManager.selectUnit(
            boardPos.row,
            boardPos.col,
          );
          if (!wasSelected) {
            this.gameStateManager.deselectAllUnits();
          }
        }
      } else {
        // Clicked on empty cell
        this.gameStateManager.deselectAllUnits();
      }
    } else {
      // Click outside board
      this.gameStateManager.deselectAllUnits();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const action = mapKeyToAction(this.gameStateManager.gameStatus, event.key);
    switch (action) {
      case "returnToMenu":
        this.gameStateManager.returnToMenu();
        break;
      case "pause":
        this.gameStateManager.pauseGame();
        break;
      case "resume":
        this.gameStateManager.resumeGame();
        break;
      case "switchTurn":
        this.gameStateManager.switchTurn();
        break;
      default:
        // no-op
        break;
    }
  }

  public showAttackMessage(message: string): void {
    this.attackMessage = message;
    this.attackMessageTime = Date.now();
  }

  public drawAttackMessage(
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
  ): void {
    if (this.attackMessage && Date.now() - this.attackMessageTime < 3000) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(this.attackMessage, canvasWidth / 2, 150);
    }
  }
}
