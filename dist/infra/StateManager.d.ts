import { WidgetPersistedState } from '../types';
/** Bump when persisted shape changes; older stored `version` values load as empty state (no upgrade path). */
export declare const SCHEMA_VERSION = 2;
export declare class StateManager {
    private readonly debug;
    /** Consumer `storageKey` option (same on every page); used for debug logs. */
    private readonly consumerStorageKey;
    private storageKey;
    private inMemoryStore;
    private readonly SIZE_LIMIT;
    constructor(consumerStorageKey: string, debug?: boolean);
    private getItem;
    private setItem;
    private removeItem;
    private getDefaultState;
    save(data: WidgetPersistedState): void;
    restore(): WidgetPersistedState;
    clear(): void;
}
