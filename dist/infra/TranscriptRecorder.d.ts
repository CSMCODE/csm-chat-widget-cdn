import { EventBus } from './EventBus';
import { StateManager } from './StateManager';
import { TranscriptEntry } from '../types';
/** Form submit emits both `messageSent` (user_text) and `__formSubmitted` (user_form); keep one row. */
export declare function dedupeFormTranscriptEntries(transcript: readonly TranscriptEntry[]): TranscriptEntry[];
export declare class TranscriptRecorder {
    private readonly bus;
    private readonly state;
    private readonly unsubs;
    private isReplaying;
    constructor(bus: EventBus, state: StateManager);
    destroy(): void;
    clear(): void;
    private append;
    private saveTranscript;
    private normalizeText;
}
