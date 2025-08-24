import { describe, it, expect } from 'vitest';
import { mapKeyToAction } from '../InputLogic.js';

describe('InputLogic.mapKeyToAction', () => {
  it('returns returnToMenu when R pressed in game_over', () => {
    expect(mapKeyToAction('game_over', 'r')).toBe('returnToMenu');
    expect(mapKeyToAction('game_over', 'R')).toBe('returnToMenu');
  });
  it('handles escape to pause/resume', () => {
    expect(mapKeyToAction('playing', 'Escape')).toBe('pause');
    expect(mapKeyToAction('paused', 'Escape')).toBe('resume');
    expect(mapKeyToAction('menu', 'Escape')).toBeNull();
  });
  it('space switches turn only in playing', () => {
    expect(mapKeyToAction('playing', ' ')).toBe('switchTurn');
    expect(mapKeyToAction('paused', ' ')).toBeNull();
  });
  it('non-mapped keys return null', () => {
    expect(mapKeyToAction('playing', 'x')).toBeNull();
  });
});
