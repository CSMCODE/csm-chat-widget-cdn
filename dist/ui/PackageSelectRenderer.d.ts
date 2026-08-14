import { FlowNode } from '../types';
import { EventBus } from '../infra/EventBus';
export declare const OUT_OF_STOCK_BANNER_LABEL = "RUPTURE DE STOCK";
export declare const UNAVAILABLE_LABEL = "INDISPONIBLE";
/**
 * Full-width package cards (single-choice). Selecting an in-stock card mirrors option clicks
 * (user echo + `__optionClick`). Items with `outOfStock: true` stay visible but do not commit.
 */
export declare class PackageSelectRenderer {
    static render(node: FlowNode, container: HTMLElement, context: Record<string, unknown>, userInput: string | undefined, debug: boolean, bus: EventBus): void;
}
