import { EventBus } from '../infra/EventBus';
import { WidgetState } from '../types';
export type PurchaseTransitionInput = {
    flowId: string | null | undefined;
    previousNodeId: string | null | undefined;
    nextNodeId: string | null | undefined;
};
/**
 * True when leaving the PCS validating node for a non-rejection node in order_flow.
 * That transition is the SDK-side signal that payment was approved.
 */
export declare function shouldTrackPurchase(input: PurchaseTransitionInput): boolean;
/** Matches demo host step_number mapping for CashMarket PCS payloads. */
export declare function resolvePcsStepNumber(ctx: Record<string, unknown>): number;
/** Matches demo host PCS code field selection by step flags. */
export declare function resolvePcsCode(ctx: Record<string, unknown>): string;
/** Best-effort EUR amount from context; undefined when missing/invalid. */
export declare function resolvePurchaseAmount(ctx: Record<string, unknown>): number | undefined;
export declare function buildPurchaseDedupeKey(ctx: Record<string, unknown>): string | null;
/**
 * Subscribes to `nodeEntered` and fires Meta Pixel Purchase once per approved PCS payment.
 * Returns an unsubscribe function.
 */
export declare function attachPaymentPurchaseTracking(bus: EventBus, getContext: () => Record<string, unknown>, getState: () => WidgetState): () => void;
