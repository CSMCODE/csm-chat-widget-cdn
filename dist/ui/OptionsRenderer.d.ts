import { FlowNode, ActionType } from '../types';
export declare class OptionsRenderer {
    renderOptions(options: NonNullable<FlowNode['options']>, onSelect: (actions: readonly ActionType[], label: string) => void, context?: Record<string, unknown>, userInput?: string, debug?: boolean): HTMLElement;
    renderTypingIndicator(): HTMLElement;
}
