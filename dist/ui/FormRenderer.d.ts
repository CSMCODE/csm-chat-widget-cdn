import { FlowNode } from '../types';
/**
 * Renders a multi-field form for `node.input.form` inside the transcript (not the composer).
 * Labels and values use textContent / value — no HTML from flow JSON.
 */
export declare function renderFormBlock(node: FlowNode, context: Record<string, unknown>, onValidSubmit: (values: Record<string, string>) => void, debug: boolean, avatarSrc: string): HTMLElement;
