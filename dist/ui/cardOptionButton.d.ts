import { FlowOptionIcon } from '../types';
/** Chevron appended to card-style option buttons (options + footer CTA). */
export declare function appendCardChevron(btn: HTMLElement): void;
/**
 * Fills a `.cw-option-btn--card` (or footer CTA) with icon, title, subtitle, and chevron.
 * Interpolated strings should be passed in (already processed by `interpolateAll`).
 */
export declare function fillCardOptionButton(btn: HTMLButtonElement, display: {
    label: string;
    subtitle?: string;
    icon?: FlowOptionIcon;
}): void;
