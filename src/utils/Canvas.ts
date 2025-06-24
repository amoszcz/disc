
export class CanvasManager {
    public canvas: HTMLCanvasElement | null;
    public ctx: CanvasRenderingContext2D | null;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
        this.ctx = this.canvas?.getContext('2d') || null;
    }

    public isValid(): boolean {
        return this.canvas !== null && this.ctx !== null;
    }

    public resizeCanvas(): void {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    public clearCanvas(): void {
        if (!this.canvas || !this.ctx) return;
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}