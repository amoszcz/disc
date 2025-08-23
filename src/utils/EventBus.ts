// A tiny typed EventBus for app-wide events without relying on window events

export type AppEvents = {
  startGame: void;
};

export interface EventBus<E> {
  on<K extends keyof E>(type: K, handler: (payload: E[K]) => void): void;
  off<K extends keyof E>(type: K, handler: (payload: E[K]) => void): void;
  emit<K extends keyof E>(type: K, payload: E[K]): void;
}

class SimpleEventBus<E> implements EventBus<E> {
  private handlers: { [K in keyof E]?: Array<(payload: E[K]) => void> } = {};

  on<K extends keyof E>(type: K, handler: (payload: E[K]) => void): void {
    const list = (this.handlers[type] ||= [] as any);
    list.push(handler as any);
  }

  off<K extends keyof E>(type: K, handler: (payload: E[K]) => void): void {
    const list = this.handlers[type];
    if (!list) return;
    const idx = (list as Array<any>).indexOf(handler as any);
    if (idx >= 0) (list as Array<any>).splice(idx, 1);
  }

  emit<K extends keyof E>(type: K, payload: E[K]): void {
    const list = this.handlers[type];
    if (!list) return;
    (list as Array<any>).forEach((h) => {
      try {
        h(payload);
      } catch (e) {
        console.error("EventBus handler error for", String(type), e);
      }
    });
  }
}

export const appEventBus: EventBus<AppEvents> = new SimpleEventBus<AppEvents>();
