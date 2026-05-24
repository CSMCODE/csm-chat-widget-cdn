import { ActionType } from '../types';
import { FlowRouter } from './FlowRouter';
import { EventBus } from '../infra/EventBus';
import { StateManager } from '../infra/StateManager';
export interface ExecutionContext {
    activeFlowId: string;
    activeNodeId: string;
    userInput?: string;
    flowContext?: Record<string, unknown>;
}
export declare class ActionProcessor {
    private readonly router;
    private readonly bus;
    private readonly state;
    private readonly debug;
    constructor(router: FlowRouter, bus: EventBus, state: StateManager, debug?: boolean);
    process(action: ActionType, context: ExecutionContext): void;
}
