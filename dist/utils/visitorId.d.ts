/** Result of resolving a first-party visitor id from browser storage. */
export interface VisitorIdentity {
    /** Stable anonymous id for this browser profile on this origin. */
    readonly visitorId: string;
    /** True when an id was already stored before this call. */
    readonly isReturning: boolean;
}
/**
 * Read a stored visitor id without creating one. Returns null when storage is empty or unavailable.
 */
export declare function peekVisitorId(storageKey: string): VisitorIdentity | null;
/**
 * Return a stable visitor id for this browser on the current origin.
 * Creates and persists a new UUID on first visit; reuses the stored id on return visits.
 */
export declare function getOrCreateVisitorId(storageKey: string): VisitorIdentity;
