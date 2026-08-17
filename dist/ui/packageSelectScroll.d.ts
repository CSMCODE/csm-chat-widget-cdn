/** Margin when pinning the package card grid to the top of the transcript. */
export declare const PACKAGE_SELECT_INTRO_PIN_MARGIN_PX = 8;
/** Pause after the intro message, with a typing row, before the card grid mounts. */
export declare const PACKAGE_SELECT_CARD_STAGING_MS = 650;
export declare function isPackageSelectOnlyRow(el: Element | null | undefined): boolean;
export type PackageSelectFrame = {
    readonly intro: HTMLElement;
    readonly cards: HTMLElement;
};
/**
 * When the transcript's latest step is still package-select (cards without a message),
 * return that row plus the preceding intro message row so scroll can keep both framed.
 * Typing indicators after the cards are ignored; any other later row (form, next bot/user
 * message) means the user has moved on — do not keep framing package select (that would
 * yank the viewport back when form inputs mutate and trigger the MutationObserver).
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
 * Pin the package card grid to the top of `.cw-messages` so the intro prompt
 * scrolls out of view and the 2×2 cards can fill a single viewport.
 */
export declare function framePackageSelectInTranscript(messagesArea: HTMLElement | null | undefined, behavior?: ScrollBehavior): boolean;
