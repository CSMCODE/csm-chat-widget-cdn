async function attachHlsToVideo(video, src) {
  const { default: HlsCtor } = await import("./hls-DbDSMEmK.mjs");
  if (!HlsCtor.isSupported()) {
    video.src = src;
    return;
  }
  const hls = new HlsCtor({
    enableWorker: false,
    lowLatencyMode: false,
    maxBufferLength: 25
  });
  hls.on(HlsCtor.Events.ERROR, (_event, data) => {
    if (!data.fatal) return;
    hls.destroy();
    if (!video.src) {
      video.src = src;
    }
  });
  hls.loadSource(src);
  hls.attachMedia(video);
}
export {
  attachHlsToVideo
};
