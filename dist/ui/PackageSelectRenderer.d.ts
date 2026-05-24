import { FlowNode } from '../types';
import { EventBus } from '../infra/EventBus';
/**
 * Full-width package cards (single-choice). Selecting one mirrors option clicks
 * (user echo + `__optionClick`).
 */
export declare class PackageSelectRenderer {
    static render(node: FlowNode, container: HTMLElement, context: Record<string, unknown>, userInput: string | undefined, debug: boolean, bus: EventBus): void;
}
