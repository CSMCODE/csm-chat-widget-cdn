export declare const COUNTDOWN_CLOSING_LABEL = "FERMETURE DES COMMANDES DANS :";
export declare const COUNTDOWN_OPENING_LABEL = "PROCHAINE OUVERTURE LE :";
export declare const AVAILABILITY_LABEL = "disponibles";
/** Initial countdown duration: 14:07:28 */
export declare const COUNTDOWN_INITIAL_SECONDS: number;
export type CountdownParts = {
    readonly hours: string;
    readonly minutes: string;
    readonly seconds: string;
};
/** Splits total seconds into zero-padded H / MIN / S parts. */
export declare function splitCountdownSeconds(totalSeconds: number): CountdownParts;
/** Compact display string: `14H 06MIN 28S`. */
export declare function formatCountdownDisplay(totalSeconds: number): string;
/** @deprecated Prefer formatCountdownDisplay — kept for callers expecting HH:mm:ss. */
export declare function formatCountdownSeconds(totalSeconds: number): string;
/** Rebuilds segmented countdown DOM under `el` (14H 06MIN 28S). */
export declare function renderCountdownValue(el: HTMLElement, totalSeconds: number): void;
/**
 * Next opening date: day 5 of previous month (with Jan→Dec wrap),
 * bumped to the next year when that date has already passed.
 */
export declare function formatNextOpeningDate(now?: Date): string;
export type OrderCountdownBanner = {
    readonly element: HTMLElement;
    start(): void;
    stop(): void;
    isRunning(): boolean;
};
/** Creates the countdown banner DOM and timer controls. */
export declare function createOrderCountdownBanner(): OrderCountdownBanner;
