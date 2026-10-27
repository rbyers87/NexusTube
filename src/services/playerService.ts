export interface VideoStreamResult {
  videoUrl?: string;
  audioUrl?: string;
  error?: string;
}

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://pipedapi.yt.privacy.coffee',
  'https://pipedapi.projectsegfau.lt',
  'https://api.piped.privacyredirect.com'
];

export async function fetchPipedStream(videoId: string): Promise<VideoStreamResult> {
  for (const instance of PIPED_INSTANCES) {
    try {
      const res = await fetch(`${instance}/streams/${videoId}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) continue;
      const data = await res.json();

      // Find a suitable video stream with audio (or highest quality mp4)
      const videoStreams = data.videoStreams || [];
      const combinedStream = videoStreams.find((s: any) => s.videoOnly === false && s.url);
      const bestVideo = combinedStream || videoStreams.find((s: any) => s.url) || videoStreams[0];

      if (bestVideo && bestVideo.url) {
        return {
          videoUrl: bestVideo.url,
          audioUrl: data.audioStreams?.[0]?.url
        };
      }
    } catch (err) {
      // Try next instance
      continue;
    }
  }
  return { error: 'Could not fetch direct stream from Piped instances.' };
}
