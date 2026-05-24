import { Flow, FlowNode } from '../types';
export declare class FlowRouter {
    private readonly nodeIndex;
    private readonly flowEntries;
    constructor(flows: readonly Flow[]);
    private indexFlows;
    getEntryNode(flowId: string): FlowNode | undefined;
    getNode(flowId: string, nodeId: string): FlowNode | undefined;
    hasFlow(flowId: string): boolean;
    getAllFlowIds(): string[];
}
