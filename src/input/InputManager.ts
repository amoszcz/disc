
import type { GameStateManager } from '../game/GameState.js';
import type { Renderer } from '../rendering/Renderer.js';

export class InputManager {
    private gameStateManager: GameStateManager;
    private renderer: Renderer;
    private canvas: HTMLCanvasElement;
    private attackMessage: string = '';
    private attackMessageTime: number = 0;

    constructor(canvas: HTMLCanvasElement, gameStateManager: GameStateManager, renderer: Renderer) {
        this.canvas = canvas;
        this.gameStateManager = gameStateManager;
        this.renderer = renderer;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.canvas.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });

        this.canvas.addEventListener('click', (event) => {
            this.handleMouseClick(event);
        });

        window.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });

        window.addEventListener('startGame', () => {
            this.gameStateManager.startGame();
        });
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

        if (!buttonClicked && this.gameStateManager.gameState.gameStatus === 'playing') {
            this.handleUnitSelection(mouseX, mouseY);
        }
    }

    private handleUnitSelection(mouseX: number, mouseY: number): void {
        const boardPos = this.gameStateManager.getBoardPositionFromPixels(mouseX, mouseY);

        if (boardPos) {
            const unit = this.gameStateManager.getUnitAt(boardPos.row, boardPos.col);

            if (unit) {
                // If we have a selected unit and clicked on a different unit
                if (this.gameStateManager.gameState.selectedUnit &&
                    this.gameStateManager.gameState.selectedUnit !== unit) {

                    // Check if clicked unit is from the same team (friendly unit)
                    if (unit.team === this.gameStateManager.gameState.currentTurn) {
                        // Try to select the friendly unit instead
                        const wasSelected = this.gameStateManager.selectUnit(boardPos.row, boardPos.col);
                        if (!wasSelected) {
                            // If we can't select it (inactive unit), deselect all
                            this.gameStateManager.deselectAllUnits();
                        }
                    } else {
                        // Different team - try to attack
                        const attackResult = this.gameStateManager.attemptAttack(boardPos.row, boardPos.col);
                        if (attackResult && attackResult.success) {
                            this.showAttackMessage(attackResult.message);
                        } else if (attackResult && !attackResult.success) {
                            this.showAttackMessage(attackResult.message);
                        }
                    }
                } else {
                    // No unit selected or clicked on the same unit - try to select the clicked unit
                    const wasSelected = this.gameStateManager.selectUnit(boardPos.row, boardPos.col);
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
        switch (event.key.toLowerCase()) {
            case 'r':
                if (this.gameStateManager.gameState.gameStatus === 'game_over') {
                    this.gameStateManager.returnToMenu();
                }
                break;
            case 'escape':
                if (this.gameStateManager.gameState.gameStatus === 'playing') {
                    this.gameStateManager.pauseGame();
                } else if (this.gameStateManager.gameState.gameStatus === 'paused') {
                    this.gameStateManager.resumeGame();
                }
                break;
            case ' ':
                if (this.gameStateManager.gameState.gameStatus === 'playing') {
                    this.gameStateManager.switchTurn();
                }
                break;
        }
    }

    public showAttackMessage(message: string): void {
        this.attackMessage = message;
        this.attackMessageTime = Date.now();
    }

    public drawAttackMessage(ctx: CanvasRenderingContext2D, canvasWidth: number): void {
        if (this.attackMessage && Date.now() - this.attackMessageTime < 3000) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.attackMessage, canvasWidth / 2, 150);
        }
    }
}