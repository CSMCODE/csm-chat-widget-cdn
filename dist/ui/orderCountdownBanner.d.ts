export declare const COUNTDOWN_CLOSING_LABEL = "FERMETURE DES COMMANDES DANS :";
export declare const COUNTDOWN_OPENING_LABEL = "PROCHAINE OUVERTURE LE :";
export declare const AVAILABILITY_LABEL = "disponibles";
/** Initial countdown duration: 14:07:28 */
export declare const COUNTDOWN_INITIAL_SECONDS: number;
/** Formats seconds as HH:mm:ss with zero padding. */
export declare function formatCountdownSeconds(totalSeconds: number): string;
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
