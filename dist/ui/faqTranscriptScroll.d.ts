/** Attribute on `.cw-messages` while an FAQ row is expanding — blocks follow-to-bottom scroll. */
export declare const CW_FAQ_PIN_LOCK_ATTR = "data-cw-faq-pin-lock";
/** Must match `#chat-widget-root .cw-faq-item { scroll-margin-top }` in styles. */
export declare const FAQ_PIN_MARGIN_PX = 8;
export declare function isInsideFaqSubtree(node: Node | null | undefined): boolean;
export declare function setFaqPinLock(messagesArea: HTMLElement | null, locked: boolean): void;
export declare function isFaqPinLocked(messagesArea: HTMLElement | null | undefined): boolean;
/**
 * Pin the FAQ row to the top of the transcript without `scrollIntoView`, which can scroll the
 * host page or an outer scroll container and hide the question (especially on mobile Safari).
 */
export declare function pinFaqItemToTranscriptTop(itemWrap: HTMLElement, behavior: ScrollBehavior): void;
/**
 * Keep the opened question visible while the panel max-height transition and lazy carousel finish.
 */
export declare function scheduleFaqExpandPin(itemWrap: HTMLElement, panel: HTMLElement, hasLazyCarousel: boolean): void;
