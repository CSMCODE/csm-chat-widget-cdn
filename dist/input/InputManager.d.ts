import { EventBus } from '../infra/EventBus';
import { FlowNode } from '../types';
import { ExecutionContext } from '../engine/ActionProcessor';
export declare class InputManager {
    private readonly bus;
    private readonly defaultConfig;
    private state;
    private previousState;
    private flowContext;
    private interpolateDebug;
    constructor(bus: EventBus, defaultConfig: {
        enabled: boolean;
        placeholder: string;
    });
    enable(placeholder?: string): void;
    disable(): void;
    setPlaceholder(text: string): void;
    isEnabled(): boolean;
    getPlaceholder(): string;
    applyNodeConfig(nodeInputConfig?: FlowNode["input"], context?: Record<string, unknown>): void;
    handleSubmit(text: string, context: ExecutionContext): void;
}
