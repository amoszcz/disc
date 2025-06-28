// src/rendering/effects/DamageEffectManager.ts

/**
 * Manages visual effects for different types of damage/healing in the game.
 * Provides unique visual feedback based on the attacking unit's type.
 * Used by the UnitRenderer to display combat effects.
 */

import type { Unit, UnitType } from "../../types/GameTypes.js";

export class DamageEffectManager {
  private readonly particles: Map<string, DamageParticle[]> = new Map();
  public static readonly EFFECT_DURATION = 1000; // milliseconds

  public addEffect(
    targetUnit: Unit,
    attackType: string,
    centerX: number,
    centerY: number,
  ): void {
    const key = `${targetUnit.row}-${targetUnit.col}`;
    const particles = this.createParticlesForAttackType(
      attackType,
      centerX,
      centerY,
    );
    this.particles.set(key, particles);

    // Clear particles after duration
    setTimeout(() => {
      this.particles.delete(key);
    }, DamageEffectManager.EFFECT_DURATION);
  }

  public drawEffects(ctx: CanvasRenderingContext2D): void {
    const currentTime = Date.now();

    this.particles.forEach((particles, key) => {
      particles.forEach((particle) => {
        particle.update(currentTime);
        particle.draw(ctx);
      });
    });
  }

  private createParticlesForAttackType(
    attackType: string,
    x: number,
    y: number,
  ): DamageParticle[] {
    const particles: DamageParticle[] = [];
    const startTime = Date.now();

    switch (attackType) {
      case "archer":
        // Arrow impact particles
        for (let i = 0; i < 8; i++) {
          particles.push(new ArrowParticle(x, y, startTime));
        }
        break;

      case "mage":
        // Magic explosion particles
        for (let i = 0; i < 12; i++) {
          particles.push(new MagicParticle(x, y, startTime));
        }
        break;

      case "priest":
        // Healing sparkles
        for (let i = 0; i < 10; i++) {
          particles.push(new HealParticle(x, y, startTime));
        }
        break;

      case "knight":
        // Slash marks
        for (let i = 0; i < 4; i++) {
          particles.push(new SlashParticle(x, y, startTime));
        }
        break;
    }

    return particles;
  }
}

abstract class DamageParticle {
  protected x: number;
  protected y: number;
  protected startTime: number;
  protected alpha: number = 1;

  constructor(x: number, y: number, startTime: number) {
    this.x = x;
    this.y = y;
    this.startTime = startTime;
  }

  abstract update(currentTime: number): void;
  abstract draw(ctx: CanvasRenderingContext2D): void;
}

class ArrowParticle extends DamageParticle {
  private angle: number;
  private speed: number;

  constructor(x: number, y: number, startTime: number) {
    super(x, y, startTime);
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 2 + 1;
  }

  update(currentTime: number): void {
    const elapsed = currentTime - this.startTime;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.alpha = 1 - elapsed / DamageEffectManager.EFFECT_DURATION;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = "#8B4513";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x + Math.cos(this.angle) * 8,
      this.y + Math.sin(this.angle) * 8,
    );
    ctx.stroke();
    ctx.restore();
  }
}

class MagicParticle extends DamageParticle {
  private radius: number;
  private hue: number;

  constructor(x: number, y: number, startTime: number) {
    super(x, y, startTime);
    this.radius = Math.random() * 10 + 5;
    this.hue = Math.random() * 60 + 240; // Blue to purple range
  }

  update(currentTime: number): void {
    const elapsed = currentTime - this.startTime;
    this.radius += 0.5;
    this.alpha = 1 - elapsed / DamageEffectManager.EFFECT_DURATION;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `hsla(${this.hue}, 100%, 50%, ${this.alpha})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class HealParticle extends DamageParticle {
  private size: number;

  constructor(x: number, y: number, startTime: number) {
    super(x, y, startTime);
    this.size = Math.random() * 4 + 2;
  }

  update(currentTime: number): void {
    const elapsed = currentTime - this.startTime;
    this.y -= 1;
    this.alpha = 1 - elapsed / DamageEffectManager.EFFECT_DURATION;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    const halfSize = this.size / 2;
    ctx.moveTo(this.x, this.y - halfSize);
    ctx.lineTo(this.x + halfSize, this.y);
    ctx.lineTo(this.x, this.y + halfSize);
    ctx.lineTo(this.x - halfSize, this.y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

class SlashParticle extends DamageParticle {
  private angle: number;
  private length: number;

  constructor(x: number, y: number, startTime: number) {
    super(x, y, startTime);
    this.angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
    this.length = Math.random() * 20 + 20;
  }

  update(currentTime: number): void {
    const elapsed = currentTime - this.startTime;
    this.alpha = 1 - elapsed / DamageEffectManager.EFFECT_DURATION;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = "#ff4444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(
      this.x - (Math.cos(this.angle) * this.length) / 2,
      this.y - (Math.sin(this.angle) * this.length) / 2,
    );
    ctx.lineTo(
      this.x + (Math.cos(this.angle) * this.length) / 2,
      this.y + (Math.sin(this.angle) * this.length) / 2,
    );
    ctx.stroke();
    ctx.restore();
  }
}
