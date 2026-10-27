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
    return (data || [])
      .filter((item: any) => {
        if (!item.segment || !Array.isArray(item.segment) || item.segment.length !== 2) return false;
        const [start, end] = item.segment;
        if (typeof start !== 'number' || typeof end !== 'number') return false;
        if (start < 0 || end <= start || end > 14400) return false;
        return true;
      })
      .slice(0, 8) // Limit to top 8 valid segments to prevent UI clutter
      .map((item: any) => ({
        category: item.category,
        segment: item.segment,
        UUID: item.UUID,
        videoDuration: item.videoDuration,
      }));
  } catch {
    return [];
  }
}
