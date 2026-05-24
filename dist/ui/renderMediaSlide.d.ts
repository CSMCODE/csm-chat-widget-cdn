import { MediaItem } from '../types';
/**
 * Appends image or native video + optional caption inside a figure (carousel slides).
 */
export declare function appendCarouselSlideContent(item: MediaItem, fig: HTMLElement, context: Record<string, unknown>, userInput: string | undefined, debug: boolean): void;
/**
 * Appends a single inline video (top-level media or FAQ nested video).
 */
export declare function createInlineVideoElement(item: MediaItem, className: string): HTMLVideoElement;
