/**
 * Internal coordination uses `__`-prefixed events; host-facing names have no prefix.
 * Keeps engine/UI channels distinct from documented `.on()` subscriptions.
 */
export declare class EventBus {
    private listeners;
    on(event: string, callback: Function): () => void;
    emit(event: string, payload?: unknown): void;
    clear(): void;
}
