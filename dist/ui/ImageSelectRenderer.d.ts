import { FlowNode } from '../types';
import { EventBus } from '../infra/EventBus';
/**
 * Horizontally scrollable image cards with a radio under each label; committing a choice
 * mirrors option clicks (user echo + `__optionClick`).
 */
export declare class ImageSelectRenderer {
    static render(node: FlowNode, container: HTMLElement, context: Record<string, unknown>, userInput: string | undefined, debug: boolean, bus: EventBus): void;
}
