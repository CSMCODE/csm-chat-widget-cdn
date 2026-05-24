export declare function isHlsUrl(src: string): boolean;
/**
 * Binds `src` to `video`: direct assignment for progressive MP4/WebM; native HLS where supported;
 * otherwise lazy-loads hls.js for `.m3u8`.
 */
export declare function bindVideoPlayback(video: HTMLVideoElement, src: string): void;
/** Stronger buffering hint for MSE/HLS paths (native HLS still uses metadata). */
export declare function videoPreloadForSrc(video: HTMLVideoElement, src: string): 'auto' | 'metadata';
