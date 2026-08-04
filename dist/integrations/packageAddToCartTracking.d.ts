import { EventBus } from '../infra/EventBus';
/** Best-effort EUR amount from context; undefined when missing/invalid. */
export declare function resolveAddToCartAmount(ctx: Record<string, unknown>): number | undefined;
/**
 * Subscribes to package selection and fires Meta Pixel AddToCart once per event.
 * Returns an unsubscribe function.
 */
export declare function attachPackageAddToCartTracking(bus: EventBus, getContext: () => Record<string, unknown>): () => void;
