import type { Button } from '../types/GameTypes.js';

export class ButtonManager {
    private buttons: Button[] = [];

    public createButton(x: number, y: number, width: number, height: number, text: string, onClick: () => void): Button {
        const button: Button = {
            x,
            y,
            width,
            height,
            text,
            isHovered: false,
            onClick
        };

        this.buttons.push(button);
        return button;
    }

    public handleMouseMove(mouseX: number, mouseY: number): void {
        this.buttons.forEach(button => {
            button.isHovered = this.isPointInButton(mouseX, mouseY, button);
        });
    }

    public handleMouseClick(mouseX: number, mouseY: number): boolean {
        for (const button of this.buttons) {
            if (this.isPointInButton(mouseX, mouseY, button)) {
                button.onClick();
                return true; // Button was clicked
            }
        }
        return false; // No button was clicked
    }

    private isPointInButton(x: number, y: number, button: Button): boolean {
        return x >= button.x &&
            x <= button.x + button.width &&
            y >= button.y &&
            y <= button.y + button.height;
    }

    public clearButtons(): void {
        this.buttons = [];
    }

    public getButtons(): Button[] {
        return this.buttons; 
    }

    public drawButton(ctx: CanvasRenderingContext2D, button: Button): void {
        // Button background
        ctx.fillStyle = button.isHovered ? '#4a90e2' : '#6b7280';
        ctx.fillRect(button.x, button.y, button.width, button.height);

        // Button border
        ctx.strokeStyle = button.isHovered ? '#2c5282' : '#374151';
        ctx.lineWidth = 2;
        ctx.strokeRect(button.x, button.y, button.width, button.height);

        // Button text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
            button.text,
            button.x + button.width / 2,
            button.y + button.height / 2
        );
    }
}