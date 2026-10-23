import netmirrorCatalog from './netmirrorCatalog.json';

export const OTT_PLATFORMS = [
  {
    id: 'nf',
    name: 'Netflix',
    slug: 'netflix',
    logo: 'NETFLIX',
    tagline: 'Watch TV Shows Online, Watch Movies Online',
    brandColor: '#E50914',
    hoverColor: '#f40612',
    accentBg: 'rgba(229, 9, 20, 0.15)',
    bannerText: 'N E T F L I X   O R I G I N A L'
  },
  {
    id: 'pv',
    name: 'Prime Video',
    slug: 'prime',
    logo: 'prime video',
    tagline: 'Amazon Originals, Hit Movies, TV Series',
    brandColor: '#00A8E1',
    hoverColor: '#0ea5e9',
    accentBg: 'rgba(0, 168, 225, 0.15)',
    bannerText: 'A M A Z O N   O R I G I N A L'
  },
  {
    id: 'hs',
    name: 'Disney+ Hotstar',
    slug: 'disney',
    logo: 'Disney+',
    tagline: 'Marvel, Star Wars, Pixar, Disney+ Originals',
    brandColor: '#2563eb',
    hoverColor: '#3b82f6',
    accentBg: 'rgba(37, 99, 235, 0.18)',
    bannerText: 'D I S N E Y +   O R I G I N A L'
  },
  {
    id: 'appleTV',
    name: 'Apple TV+',
    slug: 'apple',
    logo: 'Apple TV+',
    tagline: 'Apple Original Stories & Premieres',
    brandColor: '#FFFFFF',
    hoverColor: '#e5e5e5',
    accentBg: 'rgba(255, 255, 255, 0.15)',
    bannerText: 'A P P L E   O R I G I N A L'
  },
  {
    id: 'zee5',
    name: 'Zee5',
    slug: 'zee5',
    logo: 'Zee5',
    tagline: 'Blockbuster Indian Movies & Shows',
    brandColor: '#A12B88',
    hoverColor: '#c026d3',
    accentBg: 'rgba(161, 43, 136, 0.18)',
    bannerText: 'Z E E 5   E X C L U S I V E'
  },
  {
    id: 'hulu',
    name: 'Hulu',
    slug: 'hulu',
    logo: 'Hulu',
    tagline: 'Stream Full TV Seasons & Hit Originals',
    brandColor: '#1CE783',
    hoverColor: '#22c55e',
    accentBg: 'rgba(28, 231, 131, 0.15)',
    bannerText: 'H U L U   O R I G I N A L'
  }
];

// Highlight titles to feature in hero carousel or top rows
const CURATED_HIGHLIGHTS = [
  {
    id: 'stranger-things',
    ott: 'nf',
    title: 'Stranger Things',
    backdrop: 'https://imgcdn.kim/poster/h/80057281.jpg',
    poster: 'https://imgcdn.kim/poster/v/80057281.jpg',
    themeColor: '#e50914',
    imdbId: 'tt4574334',
    tmdbId: '66732',
    netmirrorId: '80057281',
    playbackId: '81599029',
    youtubeId: 'b9EkMc79ZSU',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    synopsis: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.',
    rating: 'TV-14',
    matchScore: 99,
    duration: '5 Seasons',
    isSeries: true,
    seasons: 5,
    releaseYear: 2016,
    quality: '4K Ultra HD',
    audio: 'Spatial Audio • Dolby Atmos',
    isOriginal: true,
    top10Rank: 1,
    categories: ['all', 'trending', 'top10', 'originals', 'scifi', 'tv', 'hollywood'],
    genres: ['Sci-Fi TV', 'Teen TV Shows', 'US TV Shows', 'Horror TV Serials'],
    tags: ['Ominous', 'Scary', 'Nostalgic', 'Suspenseful'],
    cast: ['Winona Ryder', 'David Harbour', 'Millie Bobby Brown', 'Finn Wolfhard', 'Gaten Matarazzo'],
    creator: 'The Duffer Brothers',
    episodes: [
      {
        episodeNumber: 1,
        title: 'Chapter One: The Crawl',
        duration: '71m',
        id: '81599029',
        synopsis: 'November, 1987. The gang evades the military to scour the Upside Down for Vecna — but fails to notice a threat lurking closer to home.',
        progress: 65
      }
    ]
  },
  {
    id: 'wednesday',
    ott: 'nf',
    title: 'Wednesday',
    backdrop: 'https://imgcdn.kim/poster/h/81231974.jpg',
    poster: 'https://imgcdn.kim/poster/v/81231974.jpg',
    themeColor: '#7c3aed',
    imdbId: 'tt13443470',
    tmdbId: '119051',
    netmirrorId: '81231974',
    playbackId: '81231975',
    youtubeId: 'Di310BC8zMg',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    synopsis: 'Smart, sarcastic and a little dead inside, Wednesday Addams investigates a monstrous murder spree while making new friends — and foes — at Nevermore Academy.',
    rating: 'TV-14',
    matchScore: 98,
    duration: '1 Season',
    isSeries: true,
    seasons: 1,
    releaseYear: 2023,
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos',
    isOriginal: true,
    top10Rank: 2,
    categories: ['all', 'trending', 'top10', 'originals', 'tv', 'hollywood'],
    genres: ['Dark Comedy', 'Mystery', 'Fantasy', 'Teen'],
    tags: ['Deadpan', 'Quirky', 'Gothic', 'Whodunit'],
    cast: ['Jenna Ortega', 'Gwendoline Christie', 'Christina Ricci', 'Emma Myers', 'Catherine Zeta-Jones'],
    creator: 'Alfred Gough, Miles Millar, Tim Burton',
    episodes: [
      {
        episodeNumber: 1,
        title: 'Chapter I: Wednesday\'s Child is Full of Woe',
        duration: '59m',
        id: '81231975',
        synopsis: 'Wednesday arrives at Nevermore Academy and stumbles into a lethal monster mystery.',
        progress: 0
      }
    ]
  },
  {
    id: 'the-boys',
    ott: 'pv',
    title: 'The Boys',
    backdrop: 'https://pbcdnw.aoneroom.com/image/2026/04/07/062822fb56d52c2bcfbbceb24e9254ac.jpg',
    poster: 'https://image.tmdb.org/t/p/w500/in1R2dDc421JxsoRWaIIAqVI2KE.jpg',
    themeColor: '#00A8E1',
    imdbId: 'tt1190634',
    tmdbId: '76479',
    netmirrorId: '103240',
    playbackId: '103240',
    youtubeId: 'tcrNsIaQkb4',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    synopsis: 'A fun and irreverent take on what happens when superheroes abuse their superpowers rather than use them for good.',
    rating: 'TV-MA',
    matchScore: 97,
    duration: '4 Seasons',
    isSeries: true,
    seasons: 4,
    releaseYear: 2024,
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos',
    isOriginal: true,
    top10Rank: 1,
    categories: ['all', 'trending', 'top10', 'originals', 'action', 'tv', 'hollywood'],
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    tags: ['Gritty', 'Violent', 'Satirical'],
    cast: ['Karl Urban', 'Jack Quaid', 'Antony Starr', 'Erin Moriarty'],
    creator: 'Eric Kripke'
  },
  {
    id: 'fallout',
    ott: 'pv',
    title: 'Fallout',
    backdrop: 'https://pbcdnw.aoneroom.com/image/2025/12/16/bf1aed7b1b8057772e8f6e739a7cd5ae.jpg',
    poster: 'https://pbcdnw.aoneroom.com/image/2025/12/16/bf1aed7b1b8057772e8f6e739a7cd5ae.jpg',
    themeColor: '#00A8E1',
    imdbId: 'tt12637874',
    tmdbId: '106379',
    netmirrorId: '103237',
    playbackId: '103237',
    youtubeId: 'V-mugKDQDlg',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    synopsis: 'In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves from radiation, mutants and bandits.',
    rating: 'TV-MA',
    matchScore: 98,
    duration: '1 Season',
    isSeries: true,
    seasons: 1,
    releaseYear: 2024,
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos',
    isOriginal: true,
    top10Rank: 2,
    categories: ['all', 'trending', 'top10', 'originals', 'scifi', 'tv', 'hollywood', 'action'],
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    tags: ['Post-Apocalyptic', 'Dark Comedy', 'Vault'],
    cast: ['Ella Purnell', 'Aaron Moten', 'Walton Goggins'],
    creator: 'Graham Wagner, Geneva Robertson-Dworet'
  },
  {
    id: 'mirzapur',
    ott: 'pv',
    title: 'Mirzapur',
    backdrop: 'https://pbcdnw.aoneroom.com/image/2026/08/12/0e797569d01944f388aefcc5888e3995.jpg',
    poster: 'https://pbcdnw.aoneroom.com/image/2026/08/12/0e797569d01944f388aefcc5888e3995.jpg',
    themeColor: '#00A8E1',
    imdbId: 'tt6473300',
    tmdbId: '83742',
    netmirrorId: '123295',
    playbackId: '123295',
    youtubeId: 'ZNeGF-PvVHY',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    synopsis: 'The iron-fisted Akhandanand Tripathi is a millionaire carpet exporter and the mafia don of Mirzapur. His son, Munna, is an unworthy, power-hungry heir who will stop at nothing to inherit his father\'s legacy.',
    rating: 'A 18+',
    matchScore: 99,
    duration: '3 Seasons',
    isSeries: true,
    seasons: 3,
    releaseYear: 2024,
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos · 5.1 Hindi',
    isOriginal: true,
    top10Rank: 3,
    categories: ['all', 'trending', 'top10', 'originals', 'action', 'tv', 'bollywood', 'drama'],
    genres: ['Crime', 'Action', 'Thriller', 'Drama'],
    tags: ['Gangs', 'Gritty', 'Power Struggle'],
    cast: ['Pankaj Tripathi', 'Ali Fazal', 'Divyendu Sharma', 'Shweta Tripathi'],
    creator: 'Karan Anshuman, Puneet Krishna'
  },
  {
    id: 'panchayat',
    ott: 'pv',
    title: 'Panchayat',
    backdrop: 'https://pacdn.aoneroom.com/image/2024/12/26/653b06217c2bec6c0f273a59e39de3b4.jpg',
    poster: 'https://pacdn.aoneroom.com/image/2024/12/26/653b06217c2bec6c0f273a59e39de3b4.jpg',
    themeColor: '#00A8E1',
    imdbId: 'tt12004706',
    tmdbId: '101601',
    netmirrorId: '21102',
    playbackId: '21102',
    youtubeId: 'mojZJ7oeD_g',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    synopsis: 'A comedy-drama, which captures the journey of an engineering graduate Abhishek, who for lack of a better job option joins as secretary of a panchayat office in a remote village of Uttar Pradesh.',
    rating: 'U/A 16+',
    matchScore: 99,
    duration: '3 Seasons',
    isSeries: true,
    seasons: 3,
    releaseYear: 2024,
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos · Hindi',
    isOriginal: true,
    top10Rank: 4,
    categories: ['all', 'trending', 'top10', 'originals', 'tv', 'bollywood', 'comedy'],
    genres: ['Comedy', 'Drama'],
    tags: ['Heartwarming', 'Village Life', 'Charming'],
    cast: ['Jitendra Kumar', 'Neena Gupta', 'Raghubir Yadav', 'Chandan Roy'],
    creator: 'Chandan Kumar'
  },
  {
    id: 'loki',
    ott: 'hs',
    title: 'Loki',
    backdrop: 'https://pacdn.aoneroom.com/image/2024/03/19/42ea55af5f7d98b1f912279c844f1c13.jpg',
    poster: 'https://pacdn.aoneroom.com/image/2024/03/19/42ea55af5f7d98b1f912279c844f1c13.jpg',
    themeColor: '#2563eb',
    imdbId: 'tt9140554',
    tmdbId: '84958',
    netmirrorId: '93972',
    playbackId: '93972',
    youtubeId: 'nW948Va-l10',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    synopsis: 'The mercurial villain Loki resumes his role as the God of Mischief in a new series that takes place after the events of Avengers: Endgame.',
    rating: 'TV-14',
    matchScore: 96,
    duration: '2 Seasons',
    isSeries: true,
    seasons: 2,
    releaseYear: 2023,
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos',
    isOriginal: true,
    top10Rank: 1,
    categories: ['all', 'trending', 'top10', 'originals', 'scifi', 'tv', 'hollywood'],
    genres: ['Marvel MCU', 'Sci-Fi', 'Fantasy'],
    tags: ['Mind-Bending', 'Epic', 'Timeline'],
    cast: ['Tom Hiddleston', 'Owen Wilson', 'Sophia Di Martino'],
    creator: 'Michael Waldron'
  },
  {
    id: '81704205',
    ott: 'nf',
    title: 'Deva',
    backdrop: 'https://imgcdn.kim/poster/h/81704205.jpg',
    poster: 'https://imgcdn.kim/poster/v/81704205.jpg',
    themeColor: '#e50914',
    imdbId: 'tt27852049',
    tmdbId: '1190226',
    netmirrorId: '81704205',
    playbackId: '81704205',
    youtubeId: '3x77q40hATw',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    synopsis: 'Working on a complicated case, a fierce young police officer goes rogue to dismantle a lethal web of corruption and deceit — one epic battle at a time.',
    rating: 'U/A 16+',
    matchScore: 98,
    duration: '2h 34m',
    isSeries: false,
    seasons: null,
    releaseYear: 2025,
    quality: '4K Ultra HD',
    audio: 'Spatial Audio • Dolby Atmos',
    isOriginal: false,
    top10Rank: 3,
    categories: ['all', 'movies', 'bollywood', 'trending', 'action', 'drama'],
    genres: ['Hindi-Language Movies', 'Bollywood Movies', 'Crime Movies', 'Drama Movies', 'Thriller Movies'],
    tags: ['Suspenseful', 'Police Action', 'Gritty'],
    cast: ['Shahid Kapoor', 'Pooja Hegde', 'Pavail Gulati', 'Pravessh Rana', 'Kubbra Sait'],
    creator: 'Rosshan Andrrews'
  }
];

// Merge catalog: NetMirror catalog titles + curated items (deduplicated by id)
const rawCatalogMovies = Array.isArray(netmirrorCatalog?.movies) ? netmirrorCatalog.movies : [];
const seenIds = new Set();
const mergedMovies = [];

// Add curated first
CURATED_HIGHLIGHTS.forEach(m => {
  seenIds.add(m.id);
  if (m.netmirrorId) seenIds.add(m.netmirrorId);
  mergedMovies.push(m);
});

// Add all NetMirror catalog items
rawCatalogMovies.forEach(m => {
  if (!seenIds.has(m.id) && !seenIds.has(m.netmirrorId)) {
    seenIds.add(m.id);
    if (m.netmirrorId) seenIds.add(m.netmirrorId);
    
    // Ensure all has 'all' category
    const cats = m.categories || [];
    if (!cats.includes('all')) cats.unshift('all');
    
    mergedMovies.push({
      ...m,
      categories: cats,
      audio: m.audio || 'Dolby Atmos · 5.1 Multi-Audio',
      quality: m.quality || '4K Ultra HD',
      matchScore: m.matchScore || (94 + (((String(m.id).charCodeAt(0) || 7) + (String(m.title).charCodeAt(0) || 5)) % 6))
    });
  }
});

export const MOVIES = mergedMovies;

export const CATEGORIES = [
  { id: 'all', title: 'Home' },
  { id: 'tv', title: 'TV Shows' },
  { id: 'movies', title: 'Movies' },
  { id: 'bollywood', title: 'Bollywood & Hindi' },
  { id: 'hollywood', title: 'Hollywood' },
  { id: 'anime', title: 'Anime & Asian' },
  { id: 'trending', title: 'New & Popular' },
  { id: 'my-list', title: 'My List' }
];

export const ROW_SECTIONS = [
  { id: 'top10', title: 'Top 10 in Your Country Today', filter: 'top10', isTop10: true },
  { id: 'trending', title: 'Trending Now on NetMirror', filter: 'trending' },
  { id: 'bollywood', title: 'Bollywood Blockbusters & Indian Cinema', filter: 'bollywood' },
  { id: 'hollywood', title: 'Hollywood Global Blockbusters', filter: 'hollywood' },
  { id: 'tv', title: 'Binge-Worthy TV Series', filter: 'tv' },
  { id: 'anime', title: 'Anime & Japanese Animation', filter: 'anime' },
  { id: 'action', title: 'Action & High-Adrenaline Thrillers', filter: 'action' },
  { id: 'scifi', title: 'Sci-Fi & Mind-Bending', filter: 'scifi' },
  { id: 'drama', title: 'Critically Acclaimed Dramas', filter: 'drama' }
];
