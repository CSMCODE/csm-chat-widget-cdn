import { EventBus } from './EventBus';
import { StateManager } from './StateManager';
export declare class TranscriptRecorder {
    private readonly bus;
    private readonly state;
    private readonly unsubs;
    private isReplaying;
    constructor(bus: EventBus, state: StateManager);
    destroy(): void;
    clear(): void;
    private append;
    private normalizeText;
}
