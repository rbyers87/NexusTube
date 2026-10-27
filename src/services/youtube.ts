import type { YouTubeVideo } from '../types';

export const MOCK_VIDEOS: YouTubeVideo[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up - Rick Astley (Official Music Video)',
    description: 'The official music video for Rick Astley - Never Gonna Give You Up. Remastered in HD!',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=640&q=80',
    channelTitle: 'Rick Astley Official',
    channelId: 'UCuAXFkgsw1L7xaCfnd5JJOw',
    publishedAt: '2009-10-25T06:57:33Z',
    duration: '3:33',
    viewCount: '1,420,500,100',
  },
  {
    id: 'jfKfPfyJRdk',
    title: 'loni radio - lofi hip hop radio - beats to study/relax to 📚',
    description: 'Welcome to the live stream! Relaxing lofi hip hop beats to study, work, and chill to.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=640&q=80',
    channelTitle: 'Lofi Girl',
    channelId: 'UCSJ4jwVC6NWSIIHCgOq0l4w',
    publishedAt: '2020-02-22T00:00:00Z',
    duration: 'LIVE',
    viewCount: '850,000,000',
  },
  {
    id: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE(강남스타일) M/V',
    description: 'Official Music Video of PSY Gangnam Style. Global sensation!',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=640&q=80',
    channelTitle: 'officialpsy',
    channelId: 'UC3IZKseVpdzPSBaWxBxundA',
    publishedAt: '2012-07-15T07:30:00Z',
    duration: '4:13',
    viewCount: '5,020,100,200',
  },
  {
    id: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
    description: 'Despacito by Luis Fonsi featuring Daddy Yankee. Hit Latin pop song of the decade.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=640&q=80',
    channelTitle: 'Luis Fonsi',
    channelId: 'UCxoq-PAvskaZXikKAan0AQA',
    publishedAt: '2017-01-12T00:00:00Z',
    duration: '4:41',
    viewCount: '8,340,000,000',
  },
  {
    id: '5qap5aO4i9A',
    title: 'lofi hip hop radio - beats to sleep/chill to',
    description: 'Calm lofi beats designed to help you fall asleep and calm your mind.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=640&q=80',
    channelTitle: 'Lofi Girl',
    channelId: 'UCSJ4jwVC6NWSIIHCgOq0l4w',
    publishedAt: '2021-01-01T00:00:00Z',
    duration: 'LIVE',
    viewCount: '120,400,000',
  },
  {
    id: 'jNQXAC9IVRw',
    title: 'Me at the zoo',
    description: 'The first ever video uploaded to YouTube on April 23, 2005.',
    thumbnailUrl: 'https://images.unsplash.com/photo-153456715357ef-2b2139bac393?w=640&q=80',
    channelTitle: 'jawed',
    channelId: 'UC4QoIsoWhNuL390z491BvVA',
    publishedAt: '2005-04-23T20:31:52Z',
    duration: '0:19',
    viewCount: '310,000,000',
  },
  {
    id: 'L_LUpnjgPso',
    title: 'Relaxing Jazz Piano Music - Chill Out Coffee Shop Jazz for Work & Study',
    description: 'Smooth jazz piano music to create a cozy and relaxing atmosphere.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=640&q=80',
    channelTitle: 'Cafe Music BGM channel',
    channelId: 'UCEPyAh0PjFbipB-0b_XG47Q',
    publishedAt: '2023-05-18T09:00:00Z',
    duration: '3:00:00',
    viewCount: '14,800,200',
  },
  {
    id: '9bZkp7q19f0',
    title: 'Top 10 Advanced TypeScript Patterns Every Senior Dev Should Know',
    description: 'Master conditional types, template literal types, branded types, and module augmentation.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=640&q=80',
    channelTitle: 'TypeScript Expert',
    channelId: 'UCsT0YIqwnpJCM-mx7-gSA4Q',
    publishedAt: '2026-01-15T11:20:00Z',
    duration: '18:42',
    viewCount: '92,400',
  }
];

export async function searchYouTubeVideos(query: string, apiKey?: string): Promise<{ videos: YouTubeVideo[]; isMock: boolean }> {
  if (!apiKey || apiKey.trim() === '') {
    const q = query.toLowerCase();
    const filtered = q ? MOCK_VIDEOS.filter(v => v.title.toLowerCase().includes(q) || v.channelTitle.toLowerCase().includes(q) || v.description.toLowerCase().includes(q)) : MOCK_VIDEOS;
    return { videos: filtered, isMock: true };
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${encodeURIComponent(query || 'popular')}&type=video&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`YouTube API error: ${res.statusText}`);
    }
    const data = await res.json();
    const videos: YouTubeVideo[] = (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
      channelTitle: item.snippet.channelTitle,
      channelId: item.snippet.channelId,
      publishedAt: item.snippet.publishedAt,
    }));
    return { videos, isMock: false };
  } catch (err) {
    console.warn('YouTube API fetch failed, falling back to mock data:', err);
    const q = query.toLowerCase();
    const filtered = q ? MOCK_VIDEOS.filter(v => v.title.toLowerCase().includes(q) || v.channelTitle.toLowerCase().includes(q)) : MOCK_VIDEOS;
    return { videos: filtered, isMock: true };
  }
}
