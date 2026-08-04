/** Hardcoded single-client Meta Pixel ID. */
export declare const META_PIXEL_ID = "1508854851243972";
type FbqFn = {
    (...args: unknown[]): void;
    callMethod?: (...args: unknown[]) => void;
    queue?: unknown[];
    loaded?: boolean;
    version?: string;
    push?: (...args: unknown[]) => void;
};
declare global {
    interface Window {
        fbq?: FbqFn;
        _fbq?: FbqFn;
    }
}
/**
 * Injects Meta's official fbevents.js once and calls `fbq('init', PIXEL_ID)`.
 * Failures are swallowed so the widget flow is never blocked.
 */
export declare function ensureMetaPixelInitialized(): void;
/**
 * Fires a Meta Pixel AddToCart event. When `amount` is a finite positive number,
 * includes `{ value, currency: 'EUR' }`; otherwise sends a bare AddToCart.
 * Never throws.
 */
export declare function trackAddToCart(amount?: number): void;
export {};
