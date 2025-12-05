import { AnimeRelease, Category } from '../types';

const ANILIST_API = 'https://graphql.anilist.co';

const SCHEDULE_QUERY = `
query ($start: Int, $end: Int, $page: Int) {
  Page(page: $page, perPage: 50) {
    pageInfo {
      hasNextPage
    }
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
        trailer {
          id
          site
        }
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
    page: 1,
  };

  try {
    let allSchedules: any[] = [];
    let hasNextPage = true;

    // Fetch up to 5 pages to capture all releases for the day
    while (hasNextPage && variables.page <= 5) {
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
        console.warn('AniList API Error:', result.errors);
        if (variables.page === 1) return []; // Return empty if first page fails
        break;
      }

      const pageData = result.data?.Page;
      if (pageData?.airingSchedules) {
        allSchedules = [...allSchedules, ...pageData.airingSchedules];
      }

      hasNextPage = pageData?.pageInfo?.hasNextPage;
      variables.page++;
    }

    // Filter strictly for Hentai/Adult content
    const hentaiReleases = allSchedules.filter((item: any) => {
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

      let trailerUrl = undefined;
      if (media.trailer?.site === 'youtube' && media.trailer?.id) {
        trailerUrl = `https://www.youtube.com/watch?v=${media.trailer.id}`;
      }

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
        trailerUrl,
      };
    });

    return hentaiReleases;

  } catch (error) {
    console.error('Fetch failed:', error);
    return [];
  }
};