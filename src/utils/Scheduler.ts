export interface Scheduler {
  delay(ms: number, fn: () => void): void;
}

export class DefaultScheduler implements Scheduler {
  delay(ms: number, fn: () => void): void {
    setTimeout(fn, ms);
  }
}
