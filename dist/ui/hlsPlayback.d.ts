/**
 * Lazy hls.js attach for `.m3u8` in browsers without native HLS (Chrome, Firefox, Edge).
 */
export declare function attachHlsToVideo(video: HTMLVideoElement, src: string): Promise<void>;
