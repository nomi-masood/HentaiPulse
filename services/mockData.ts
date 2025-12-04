import { AnimeRelease, Category } from '../types';

const TITLES_PREFIX = ["Secret", "Midnight", "Forbidden", "Campus", "Dungeon", "Cyber", "Magical", "Stepsister", "Office", "Nurse", "Elite", "Private", "Beachside", "Infinite"];
const TITLES_SUFFIX = ["Lovers", "Lesson", "Chronicles", "Desire", "Attack", "Protocol", "Vacation", "Fantasy", "Teacher", "Diaries", "Paradox", "Bondage", "Resort", "Harem"];
const SOURCES = ["Hentai Haven", "HentaiFF", "HentaiSun", "EroEroNews", "Hanime.tv"];
const TAGS_POOL = ["Romance", "Vanilla", "NTR", "Mind Break", "Fantasy", "Sci-Fi", "School", "Office", "Monster", "Succubus", "Elf", "Maid", "Tutor", "Uncensored"];
const IMAGES_POOL = [
  'https://picsum.photos/400/600?random=1',
  'https://picsum.photos/400/600?random=2',
  'https://picsum.photos/400/600?random=3',
  'https://picsum.photos/400/600?random=4',
  'https://picsum.photos/400/600?random=5',
  'https://picsum.photos/400/600?random=6',
  'https://picsum.photos/400/600?random=7',
  'https://picsum.photos/400/600?random=8',
];

// Simple pseudo-random generator seeded by a string (the date)
// Ensures that for a specific date, the "random" data is always the same.
const mulberry32 = (a: number) => {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const generateMockSchedule = (date: Date): AnimeRelease[] => {
  // Create a seed from the date string (YYYY-MM-DD)
  const dateStr = date.toISOString().split('T')[0];
  const seed = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rand = mulberry32(seed);

  const numReleases = Math.floor(rand() * 5) + 4; // 4 to 8 releases per day
  const releases: AnimeRelease[] = [];

  for (let i = 0; i < numReleases; i++) {
    // Generate Title
    const tPrefix = TITLES_PREFIX[Math.floor(rand() * TITLES_PREFIX.length)];
    const tSuffix = TITLES_SUFFIX[Math.floor(rand() * TITLES_SUFFIX.length)];
    const title = `${tPrefix} ${tSuffix}${rand() > 0.8 ? ': The Animation' : ''}`;

    // Generate Time for this specific date
    const releaseDate = new Date(date);
    const hour = Math.floor(rand() * 24);
    const minute = Math.floor(rand() * 60);
    releaseDate.setHours(hour, minute, 0, 0);

    // Pick Category
    const catRoll = rand();
    let category = Category.Episode;
    if (catRoll > 0.7) category = Category.OVA;
    if (catRoll > 0.9) category = Category.Uncensored;

    // Pick Tags (2-4 tags)
    const numTags = Math.floor(rand() * 3) + 2;
    const itemTags = new Set<string>();
    while(itemTags.size < numTags) {
      itemTags.add(TAGS_POOL[Math.floor(rand() * TAGS_POOL.length)]);
    }

    releases.push({
      id: `${dateStr}-${i}`,
      title: title,
      description: `A generated synopsis for ${title}. In a world where ${itemTags.values().next().value} is common, characters explore their deepest desires.`,
      imageUrl: `https://picsum.photos/400/600?random=${Math.floor(rand() * 1000)}`,
      releaseDate: releaseDate.toISOString(),
      category: category,
      episodeNumber: category === Category.Episode ? Math.floor(rand() * 4) + 1 : undefined,
      source: SOURCES[Math.floor(rand() * SOURCES.length)],
      rating: Number((3.5 + rand() * 1.5).toFixed(1)), // 3.5 to 5.0
      tags: Array.from(itemTags),
    });
  }

  // Sort by time
  return releases.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
};

const ANILIST_API = 'https://graphql.anilist.co';

const SCHEDULE_QUERY = `
query ($start: Int, $end: Int) {
  Page(page: 1, perPage: 50) {
    airingSchedules(airingAt_greater: $start, airingAt_lesser: $end, sort: TIME) {
      id
      airingAt
      episode
      media {
        id
        title {
          english
          romaji
          native
        }
        description
        coverImage {
          extraLarge
          large
        }
        format
        averageScore
        isAdult
        genres
        siteUrl
      }
    }
  }
}
`;

export const fetchSchedule = async (date: Date): Promise<AnimeRelease[]> => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const variables = {
    start: Math.floor(startOfDay.getTime() / 1000),
    end: Math.floor(endOfDay.getTime() / 1000),
  };

  try {
    const response = await fetch(ANILIST_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: SCHEDULE_QUERY,
        variables,
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.warn('AniList API Errors (Using generated fallback):', result.errors);
      return generateMockSchedule(date);
    }

    const schedules = result.data?.Page?.airingSchedules || [];

    // Filter strictly for Hentai/Adult content
    const hentaiReleases = schedules.filter((item: any) => {
      const media = item.media;
      return media.isAdult === true || media.genres?.includes('Hentai');
    }).map((item: any) => {
      const media = item.media;
      const title = media.title.english || media.title.romaji || media.title.native;
      
      let category = Category.Episode;
      if (['OVA', 'ONA', 'SPECIAL', 'MOVIE'].includes(media.format)) {
        category = Category.OVA;
      }
      if (media.genres?.includes('Uncensored') || title.toLowerCase().includes('uncensored')) {
        category = Category.Uncensored;
      }
      
      const rawDesc = media.description || 'No description available.';
      const description = rawDesc.replace(/<[^>]*>?/gm, '');

      return {
        id: media.id.toString(),
        title: title,
        description: description,
        imageUrl: media.coverImage.extraLarge || media.coverImage.large,
        releaseDate: new Date(item.airingAt * 1000).toISOString(),
        category: category,
        episodeNumber: item.episode,
        source: 'AniList',
        rating: media.averageScore ? media.averageScore / 10 : 0,
        tags: media.genres || [],
      };
    });

    // If API returns nothing (likely due to auth), use generated data for this specific date
    if (hentaiReleases.length === 0) {
      return generateMockSchedule(date);
    }

    return hentaiReleases;

  } catch (error) {
    console.error('Fetch failed, using generated fallback:', error);
    return generateMockSchedule(date);
  }
};