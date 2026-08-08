/** Margin when framing the package intro + cards in the transcript. */
export declare const PACKAGE_SELECT_INTRO_PIN_MARGIN_PX = 8;
export declare function isPackageSelectOnlyRow(el: Element | null | undefined): boolean;
export type PackageSelectFrame = {
    readonly intro: HTMLElement;
    readonly cards: HTMLElement;
};
/**
 * When the transcript contains a package-select-only row (cards without a message),
 * return that row plus the preceding intro message row so scroll can keep both framed.
 * Walks from the end so typing indicators or later siblings do not hide the frame.
 */
export declare function findPackageSelectFrame(messagesArea: HTMLElement | null | undefined): PackageSelectFrame | null;
/**
 * @deprecated Prefer findPackageSelectFrame — kept for callers that only need the intro pin target.
 */
export declare function findPackageSelectIntroPinTarget(messagesArea: HTMLElement | null | undefined): HTMLElement | null;
/**
 * Pin a single element toward the top of `.cw-messages` without scrollIntoView
 * (avoids scrolling outer host containers on mobile Safari).
 */
export declare function pinPackageSelectIntroToTranscriptTop(pinTarget: HTMLElement, behavior?: ScrollBehavior): void;
/**
 * Frame intro message + package cards as one scroll unit:
 * - Keep intro near the top of the transcript.
 * - When intro + cards fit in the viewport, both stay fully visible.
 * - When taller, still keep intro at top and as much of the card grid as fits.
 */
export declare function framePackageSelectInTranscript(messagesArea: HTMLElement | null | undefined, behavior?: ScrollBehavior): boolean;
