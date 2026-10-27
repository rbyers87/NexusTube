export interface SponsorSegment {
  category: string;
  segment: [number, number]; // [startTime, endTime]
  UUID: string;
  videoDuration?: number;
}

export async function fetchSponsorSegments(
  videoId: string,
  categories: string[] = ['sponsor', 'selfpromo', 'interaction', 'intro', 'outro']
): Promise<SponsorSegment[]> {
  try {
    const catsParam = encodeURIComponent(JSON.stringify(categories));
    const url = `https://sponsor.ajay.app/api/skipSegments?videoID=${videoId}&categories=${catsParam}`;
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return (data || []).map((item: any) => ({
      category: item.category,
      segment: item.segment,
      UUID: item.UUID,
      videoDuration: item.videoDuration,
    }));
  } catch {
    return [];
  }
}
