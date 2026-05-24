import { FlowNode, MediaItem } from '../types';
export declare class CarouselRenderer {
    static render(node: FlowNode, container: HTMLElement, context?: Record<string, unknown>, userInput?: string, debug?: boolean): void;
    /**
     * Renders the horizontal scroll-snap carousel track (used by top-level carousel media and FAQ answers).
     */
    static renderCarouselItems(items: readonly MediaItem[], container: HTMLElement, context?: Record<string, unknown>, userInput?: string, debug?: boolean, options?: {
        ariaLabel?: string;
        rootClass?: string;
    }): void;
}
