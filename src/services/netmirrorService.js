// NetMirror Provider Service for Multi-OTT Streaming & NetMirror Center Integration
// Connects to NetMirror NewTV OTT Provider (CloudStream NetMirror Extension architecture)
// and NetMirror Center (https://netmirror.center/)
import catalogImdbMap from '../data/catalogImdbMap.json';

export const NETMIRROR_PLATFORMS = [
  {
    id: 'nf',
    name: 'Netflix',
    value: 'Net-flix',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY_ohMOpngGmj3k4EyiojNn-59iRtourrrs2LvVwH7MGldtXir7b5toJlYtrtsOYHl-_E&usqp=CAU',
    brandColor: '#E50914',
    bgDark: '#490a0c',
    bgLight: '#270e10',
    tagline: 'Watch TV Shows Online, Watch Movies Online',
    bannerText: 'N E T F L I X   O R I G I N A L'
  },
  {
    id: 'pv',
    name: 'Prime Video',
    value: 'primeVideo',
    logo: 'https://h5-static.aoneroom.com/oneroomStatic/public/_nuxt/PrimeVideoLogo.d3BPTiOQ.png',
    brandColor: '#00A8E1',
    bgDark: '#093265',
    bgLight: '#0e1927',
    tagline: 'Amazon Originals, Hit Movies, TV Series',
    bannerText: 'A M A Z O N   O R I G I N A L'
  },
  {
    id: 'hs',
    name: 'Disney+ Hotstar',
    value: 'disney',
    logo: 'https://h5-static.aoneroom.com/oneroomStatic/public/_nuxt/DisneyLogo.tCn0kn6m.png',
    brandColor: '#113CCF',
    bgDark: '#0d545d',
    bgLight: '#0f2a2f',
    tagline: 'Marvel, Star Wars, Pixar, Disney+ Originals',
    bannerText: 'D I S N E Y +   O R I G I N A L'
  },
  {
    id: 'appleTV',
    name: 'Apple TV+',
    value: 'appleTV',
    logo: 'https://h5-static.aoneroom.com/oneroomStatic/public/_nuxt/AppleTVLogo.Z5pj4az9.png',
    brandColor: '#FFFFFF',
    bgDark: '#484a4d',
    bgLight: '#101114',
    tagline: 'Apple Original Stories & Premieres',
    bannerText: 'A P P L E   O R I G I N A L'
  },
  {
    id: 'zee5',
    name: 'Zee5',
    value: 'zee5',
    logo: 'https://h5-static.aoneroom.com/oneroomStatic/public/_nuxt/Zee5Logo.CoMEAfHG.png',
    brandColor: '#A12B88',
    bgDark: '#093366',
    bgLight: '#0d1f36',
    tagline: 'Blockbuster Indian Movies & Shows',
    bannerText: 'Z E E 5   E X C L U S I V E'
  },
  {
    id: 'viu',
    name: 'Viu',
    value: 'viu',
    logo: 'https://h5-static.aoneroom.com/oneroomStatic/public/_nuxt/ViuLogo.f55Gm9dZ.png',
    brandColor: '#FACB12',
    bgDark: '#7c642a',
    bgLight: '#3c331d',
    tagline: 'Korean Dramas, Asian Variety, Anime',
    bannerText: 'V I U   O R I G I N A L'
  },
  {
    id: 'hulu',
    name: 'Hulu',
    value: 'hulu',
    logo: 'https://h5-static.aoneroom.com/oneroomStatic/public/_nuxt/HuluLogo.U0-hiEPk.png',
    brandColor: '#1CE783',
    bgDark: '#0d535d',
    bgLight: '#0e3339',
    tagline: 'Stream Full TV Seasons & Hit Originals',
    bannerText: 'H U L U   O R I G I N A L'
  },
  {
    id: 'vivamax',
    name: 'Vivamax',
    value: 'vivamax',
    logo: 'https://h5-static.aoneroom.com/oneroomStatic/public/_nuxt/VivamaxLogo.Dz1TgblZ.png',
    brandColor: '#FF5722',
    bgDark: '#663b0a',
    bgLight: '#342310',
    tagline: 'Pinoy Movies & Series',
    bannerText: 'V I V A M A X   P R E M I E R E'
  },
  {
    id: 'hoichoi',
    name: 'Hoichoi',
    value: 'hoichoi',
    logo: 'https://h5-static.aoneroom.com/oneroomStatic/public/_nuxt/HoichoiLogo.BUXMKSvi.png',
    brandColor: '#FF1744',
    bgDark: '#500914',
    bgLight: '#24080c',
    tagline: 'Best Bengali Movies & Web Series',
    bannerText: 'H O I C H O I   O R I G I N A L'
  }
];

export const NETMIRROR_CATALOG_MAP = {
  'stranger-things': {
    netmirrorId: '80057281',
    firstEpisodeId: '81599029',
    type: 'series',
    ott: 'nf'
  },
  'wednesday': {
    netmirrorId: '81231974',
    firstEpisodeId: '81231975',
    type: 'series',
    ott: 'nf'
  },
  'squid-game': {
    netmirrorId: '81040344',
    firstEpisodeId: '81040345',
    type: 'series',
    ott: 'nf'
  },
  'the-witcher': {
    netmirrorId: '80189685',
    firstEpisodeId: '80244996',
    type: 'series',
    ott: 'nf'
  },
  'cyberpunk-edgerunners': {
    netmirrorId: '81054853',
    firstEpisodeId: '81054854',
    type: 'series',
    ott: 'nf'
  },
  'the-boys': {
    netmirrorId: '103240',
    firstEpisodeId: '103240',
    type: 'series',
    ott: 'pv'
  },
  'fallout': {
    netmirrorId: '103237',
    firstEpisodeId: '103237',
    type: 'series',
    ott: 'pv'
  },
  'reacher': {
    netmirrorId: '98412',
    firstEpisodeId: '98412',
    type: 'series',
    ott: 'pv'
  },
  'loki': {
    netmirrorId: '93972',
    firstEpisodeId: '93972',
    type: 'series',
    ott: 'hs'
  },
  'the-mandalorian': {
    netmirrorId: '82856',
    firstEpisodeId: '82856',
    type: 'series',
    ott: 'hs'
  },
  'deadpool-wolverine': {
    netmirrorId: '92624',
    firstEpisodeId: '92624',
    type: 'movie',
    ott: 'hs'
  },
  'inception': {
    netmirrorId: '70131314',
    firstEpisodeId: '70131314',
    type: 'movie',
    ott: 'nf'
  },
  'interstellar': {
    netmirrorId: '70305903',
    firstEpisodeId: '70305903',
    type: 'movie',
    ott: 'nf'
  },
  'breaking-bad': {
    netmirrorId: '70143836',
    firstEpisodeId: '70143837',
    type: 'series',
    ott: 'nf'
  },
  'dark': {
    netmirrorId: '80100172',
    firstEpisodeId: '80100173',
    type: 'series',
    ott: 'nf'
  },
  'matrix': {
    netmirrorId: '20557937',
    firstEpisodeId: '20557937',
    type: 'movie',
    ott: 'nf'
  },
  'gladiator': {
    netmirrorId: '60000929',
    firstEpisodeId: '60000929',
    type: 'movie',
    ott: 'nf'
  }
};

export async function fetchNetMirrorStream(playbackId, ott = 'nf') {
  return {
    streamUrl: '/api/stream/master/' + ott + '/' + playbackId + '.m3u8',
    directCdnUrl: 'https://tv.imgcdn.kim/newtv/hls/' + ott + '/' + playbackId + '.m3u8',
    referer: 'https://net52.cc',
    status: 'ok'
  };
}

export async function fetchNetMirrorFeed(ott = 'nf') {
  try {
    const res = await fetch('/api/netmirror/main.php', {
      headers: {
        'Ott': ott,
        'Cache-Control': 'no-cache'
      }
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[NetMirror] Failed to fetch feed:', err);
  }
  return null;
}

export async function fetchNetMirrorPost(netmirrorId, ott = 'nf') {
  try {
    const res = await fetch('/api/netmirror/post.php?id=' + netmirrorId, {
      headers: {
        'Ott': ott,
        'Cache-Control': 'no-cache'
      }
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[NetMirror] Failed to fetch post details:', err);
  }
  return null;
}

export async function searchNetMirrorCenter(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const formatted = encodeURIComponent(query.trim()).replace(/%20/g, '+');
    const res = await fetch('/api/imdb/search2/' + formatted + '?page=0');
    if (res.ok) {
      const data = await res.json();
      return data.results || [];
    }
  } catch (err) {
    console.warn('[NetMirror Center] Search error:', err);
  }
  return [];
}

export async function searchNetMirrorCombined(query, ott = 'nf') {
  if (!query || query.trim().length < 2) return [];
  const cleanQ = query.trim();

  const [newtvRes, imdbRes] = await Promise.allSettled([
    fetch('/api/netmirror/search.php?s=' + encodeURIComponent(cleanQ), {
      headers: { 'Ott': ott }
    }).then(r => r.json()),
    fetch('/api/imdb/search2/' + encodeURIComponent(cleanQ).replace(/%20/g, '+') + '?page=0')
      .then(r => r.json())
  ]);

  const results = [];
  const seenIds = new Set();

  if (newtvRes.status === 'fulfilled' && newtvRes.value?.searchResult) {
    newtvRes.value.searchResult.forEach(item => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        results.push({
          id: item.id,
          title: item.t,
          poster: 'https://imgcdn.kim/poster/v/' + item.id + '.jpg',
          backdrop: 'https://imgcdn.kim/poster/h/' + item.id + '.jpg',
          netmirrorId: item.id,
          playbackId: item.id,
          source: 'NetMirror Live NewTV',
          releaseYear: 2024,
          quality: '4K Ultra HD',
          ott: ott
        });
      }
    });
  }

  if (imdbRes.status === 'fulfilled' && imdbRes.value?.results) {
    imdbRes.value.results.forEach(item => {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        results.push({
          id: item.id,
          title: item.title,
          poster: item.backdrop_path || ('https://imgcdn.kim/poster/v/' + item.id + '.jpg'),
          backdrop: item.backdrop_path || ('https://imgcdn.kim/poster/h/' + item.id + '.jpg'),
          netmirrorId: item.id,
          playbackId: item.id,
          releaseYear: item.release_date || 2024,
          isSeries: item.media_type === 'tv' || item.title?.includes('S1') || item.title?.includes('Season'),
          duration: item.media_type === 'tv' ? 'Series' : 'Feature Film',
          quality: '4K Ultra HD',
          source: 'NetMirror Center Hub',
          ott: ott
        });
      }
    });
  }

  return results;
}

export async function fetchNetMirrorSeasonEpisodes(seasonId, ott = 'nf') {
  if (!seasonId) return null;
  try {
    const res = await fetch(`/api/netmirror/episodes.php?id=${seasonId}`, {
      headers: {
        'Ott': ott,
        'Cache-Control': 'no-cache'
      }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[NetMirror] Failed to fetch season episodes:', err);
  }
  return null;
}

export const POPULAR_IMDB_MAP = {
  ...catalogImdbMap,
  'stranger-things': 'tt4574334',
  '80057281': 'tt4574334',
  '81599029': 'tt4574334',
  'wednesday': 'tt13443470',
  '81231974': 'tt13443470',
  '81231975': 'tt13443470',
  'squid-game': 'tt10919420',
  '81040344': 'tt10919420',
  '81040345': 'tt10919420',
  'the-witcher': 'tt5180504',
  '80189685': 'tt5180504',
  '80244996': 'tt5180504',
  'cyberpunk-edgerunners': 'tt12590266',
  '81054853': 'tt12590266',
  '81054854': 'tt12590266',
  'the-boys': 'tt1190634',
  '103240': 'tt1190634',
  'fallout': 'tt12637874',
  '103237': 'tt12637874',
  'reacher': 'tt9288030',
  '98412': 'tt9288030',
  'loki': 'tt9140554',
  '93972': 'tt9140554',
  'the-mandalorian': 'tt8111088',
  '82856': 'tt8111088',
  'deadpool-wolverine': 'tt6263850',
  '92624': 'tt6263850',
  'breaking-bad': 'tt0903747',
  '70143836': 'tt0903747',
  '70143837': 'tt0903747',
  'dark': 'tt5753856',
  '80100172': 'tt5753856',
  '80100173': 'tt5753856',
  'money-heist': 'tt6468322',
  '80192098': 'tt6468322',
  'peaky-blinders': 'tt2442560',
  '80002479': 'tt2442560',
  'black-mirror': 'tt2085059',
  '70264888': 'tt2085059',
  'narcos': 'tt2707408',
  '80025172': 'tt2707408',
  'shogun': 'tt2788316',
  'the-bear': 'tt14452776',
  'severance': 'tt11280740',
  'ted-lasso': 'tt10986410',
  'mirzapur': 'tt6473300',
  'panchayat': 'tt12004706',
  'sacred-games': 'tt6077448',
  'scam-1992': 'tt12392890',
  'kota-factory': 'tt9432978',
  'family-man': 'tt9544034',
  'interstellar': 'tt0816692',
  '70305903': 'tt0816692',
  'inception': 'tt1375666',
  '70131314': 'tt1375666',
  'the-dark-knight': 'tt0468569',
  'oppenheimer': 'tt15398776',
  'dune-2': 'tt15239678',
  'avatar-2': 'tt1630029',
  'rrr': 'tt8178634',
  'hanu-man': 'tt15433956',
  'kalki-2898-ad': 'tt12735488',
  'stree-2': 'tt27510174',
  'animal': 'tt13751694',
  'fighter': 'tt13818368',
  'maharaja': 'tt26548265',
  'shaitaan': 'tt27744786',
  'kill': 'tt28259207',
  'bhool-bhulaiyaa-3': 'tt26932223',
  'singham-again': 'tt11976134',
  'dunki': 'tt15428134',
  'salaar': 'tt13927994',
  'chhaava': 'tt27922706',
  'asur': 'tt11912196',
  'jawan': 'tt15354916',
  'pathaan': 'tt12844910',
  '12th-fail': 'tt23849204',
  'dangal': 'tt5074352',
  '3-idiots': 'tt1187043',
  'agneepath': 'tt1849718',
  '235527': 'tt1849718',
  'the-mummy': 'tt0120616',
  '20559714': 'tt0120616',
  'the-godfather': 'tt0068646',
  '60011152': 'tt0068646',
  'the-mummy-returns': 'tt0209163',
  '60020549': 'tt0209163',
  'dil-chahta-hai': 'tt0292490',
  '60021525': 'tt0292490',
  'final-destination-2': 'tt0309593',
  '60026114': 'tt0309593',
  'how-to-lose-a-guy-in-10-days': 'tt0251127',
  '60026122': 'tt0251127',
  'scarface': 'tt0086250',
  '60029681': 'tt0086250',
  'the-last-samurai': 'tt0325710',
  '60031274': 'tt0325710',
  'dawn-of-the-dead': 'tt0363547',
  '60033340': 'tt0363547',
  'cellular': 'tt0337921',
  '60034577': 'tt0337921',
  'final-destination-3': 'tt0414982',
  '70042687': 'tt0414982',
  '300': 'tt0416449',
  '70056440': 'tt0416449',
  'no-reservations': 'tt0481141',
  '70058017': 'tt0481141',
  'ta-ra-rum-pum': 'tt0833553',
  '70069019': 'tt0833553',
  'the-matrix': 'tt0133093',
  '20557937': 'tt0133093',
  'gladiator': 'tt0172495',
  '60000929': 'tt0172495',
  'queen-gambit': 'tt10048342',
  '80230833': 'tt10048342',
  'alice-in-borderland': 'tt10795658',
  '80200575': 'tt10795658',
  'all-of-us-are-dead': 'tt14169960',
  '81237994': 'tt14169960',
  '81616273': 'tt36643714',
  '81671215': 'tt14564000',
  '81713690': 'tt8436608',
  '81728596': 'tt27118357',
  '81752435': 'tt37093539',
  '1260141610': 'tt27588320',
  '0HNZIYOI76383DKI61QMTROL4K': 'tt15501640',
  '0QXK16A045FAMGI21LGHGK0X9U': 'tt8960382',
  '0G5EHVLC83CC57Z5DG60LLI69L': 'tt28286955',
  '81704205': 'tt27852049'
};

export const POPULAR_TITLE_IMDB_MAP = {
  ...catalogImdbMap,
  'stranger things': 'tt4574334',
  'wednesday': 'tt13443470',
  'squid game': 'tt10919420',
  'the witcher': 'tt5180504',
  'the boys': 'tt1190634',
  'fallout': 'tt12637874',
  'reacher': 'tt9288030',
  'loki': 'tt9140554',
  'the mandalorian': 'tt8111088',
  'breaking bad': 'tt0903747',
  'dark': 'tt5753856',
  'money heist': 'tt6468322',
  'peaky blinders': 'tt2442560',
  'black mirror': 'tt2085059',
  'narcos': 'tt2707408',
  'cyberpunk: edgerunners': 'tt12590266',
  'cyberpunk edgerunners': 'tt12590266',
  'interstellar': 'tt0816692',
  'inception': 'tt1375666',
  'the dark knight': 'tt0468569',
  'oppenheimer': 'tt15398776',
  'agneepath': 'tt1849718',
  'the mummy': 'tt0120616',
  'the matrix': 'tt0133093',
  'gladiator': 'tt0172495',
  'deadpool & wolverine': 'tt6263850',
  'deadpool and wolverine': 'tt6263850',
  'shogun': 'tt2788316',
  'the bear': 'tt14452776',
  'severance': 'tt11280740',
  'mirzapur': 'tt6473300',
  'panchayat': 'tt12004706',
  'sacred games': 'tt6077448',
  'scam 1992': 'tt12392890',
  'dune: part two': 'tt15239678',
  'dune 2': 'tt15239678',
  'hanu man': 'tt15433956',
  'hanu-man': 'tt15433956',
  'hanuman': 'tt15433956',
  'kalki 2898 ad': 'tt12735488',
  'kalki': 'tt12735488',
  'stree 2': 'tt27510174',
  'animal': 'tt13751694',
  'fighter': 'tt13818368',
  'maharaja': 'tt26548265',
  'shaitaan': 'tt27744786',
  'kill': 'tt28259207',
  'bhool bhulaiyaa 3': 'tt26932223',
  'singham again': 'tt11976134',
  'dunki': 'tt15428134',
  'salaar': 'tt13927994',
  'chhaava': 'tt27922706',
  'asur': 'tt11912196',
  'asur: welcome to your dark side': 'tt11912196',
  '12th fail': 'tt23849204'
};

export const POPULAR_TMDB_MAP = {
  'the-boys': '76479',
  '103240': '76479',
  'stranger-things': '66732',
  '80057281': '66732',
  'wednesday': '119051',
  '81231974': '119051',
  'squid-game': '93405',
  '81040344': '93405',
  'the-witcher': '71912',
  '80189685': '71912',
  'cyberpunk-edgerunners': '105248',
  '81054853': '105248',
  'fallout': '106379',
  '103237': '106379',
  'reacher': '108978',
  '98412': '108978',
  'loki': '84958',
  '93972': '84958',
  'the-mandalorian': '82856',
  '82856': '82856',
  'breaking-bad': '1396',
  '70143836': '1396',
  'dark': '70523',
  '80100172': '70523',
  'money-heist': '71446',
  '80192098': '71446',
  'peaky-blinders': '60574',
  '80002479': '60574',
  'black-mirror': '42009',
  '70264888': '42009',
  'narcos': '63351',
  '80025172': '63351',
  'shogun': '126308',
  'the-bear': '139828',
  'severance': '95557',
  'ted-lasso': '97546',
  'mirzapur': '83742',
  '123295': '83742',
  'panchayat': '101601',
  '21102': '101601',
  'sacred-games': '79352',
  'scam-1992': '111116',
  'kota-factory': '88989',
  'family-man': '93390',
  'alice-in-borderland': '110316',
  '80200575': '110316',
  'all-of-us-are-dead': '99966',
  '81237994': '99966',
  'interstellar': '157336',
  '70305903': '157336',
  'inception': '27205',
  '70131314': '27205',
  'the-dark-knight': '155',
  'oppenheimer': '872585',
  'dune-2': '693134',
  'avatar-2': '76600',
  'rrr': '579974',
  'hanu-man': '1011985',
  'kalki-2898-ad': '792307',
  'stree-2': '1159311',
  'animal': '781732',
  'fighter': '850165',
  'maharaja': '1114704',
  'shaitaan': '1196470',
  'kill': '1160018',
  'bhool-bhulaiyaa-3': '1094556',
  'singham-again': '1186947',
  'dunki': '955531',
  'salaar': '897087',
  'chhaava': '1219800',
  'asur': '99966',
  'jawan': '872906',
  'pathaan': '864692',
  '12th-fail': '1058694',
  'dangal': '360814',
  '3-idiots': '20453',
  'agneepath': '84329',
  '235527': '84329',
  'the-mummy': '564',
  '20559714': '564',
  'the-godfather': '238',
  '60011152': '238',
  'the-mummy-returns': '4584',
  '60020549': '4584',
  'the-matrix': '603',
  '20557937': '603',
  'gladiator': '98',
  '60000929': '98',
  'deadpool-wolverine': '533535',
  '92624': '533535'
};

export const POPULAR_TITLE_TMDB_MAP = {
  'the boys': '76479',
  'stranger things': '66732',
  'wednesday': '119051',
  'squid game': '93405',
  'the witcher': '71912',
  'cyberpunk: edgerunners': '105248',
  'cyberpunk edgerunners': '105248',
  'fallout': '106379',
  'reacher': '108978',
  'loki': '84958',
  'the mandalorian': '82856',
  'breaking bad': '1396',
  'dark': '70523',
  'money heist': '71446',
  'peaky blinders': '60574',
  'black mirror': '42009',
  'narcos': '63351',
  'shogun': '126308',
  'the bear': '139828',
  'severance': '95557',
  'ted lasso': '97546',
  'mirzapur': '83742',
  'panchayat': '101601',
  'sacred games': '79352',
  'scam 1992': '111116',
  'interstellar': '157336',
  'inception': '27205',
  'oppenheimer': '872585',
  'dune: part two': '693134',
  'dune 2': '693134',
  'the matrix': '603',
  'gladiator': '98',
  'agneepath': '84329',
  'hanu man': '1011985',
  'hanu-man': '1011985',
  'hanuman': '1011985',
  'kalki 2898 ad': '792307',
  'kalki': '792307',
  'stree 2': '1159311',
  'animal': '781732',
  'fighter': '850165',
  'maharaja': '1114704',
  'shaitaan': '1196470',
  'kill': '1160018',
  'bhool bhulaiyaa 3': '1094556',
  'singham again': '1186947',
  'dunki': '955531',
  'salaar': '897087',
  'chhaava': '1219800',
  'asur': '99966',
  '12th fail': '1058694'
};

export function getNetMirrorServerUrls(movie, episode = null, ott = 'nf', customImdbId = null, customTmdbId = null) {
  const netmirrorEntry = NETMIRROR_CATALOG_MAP[movie?.id];
  const playbackId = episode?.id
    || (episode?.episodeNumber && (netmirrorEntry?.firstEpisodeId || netmirrorEntry?.netmirrorId || movie?.playbackId || movie?.netmirrorId))
    || movie?.playbackId
    || netmirrorEntry?.netmirrorId
    || movie?.netmirrorId
    || movie?.id
    || '80057281';

  const isSeries = Boolean(
    movie?.isSeries === true ||
    (movie?.isSeries !== false && (
      movie?.type === 't' ||
      movie?.type === 'series' ||
      movie?.seasons > 1 ||
      (movie?.duration && /season/i.test(movie.duration)) ||
      (movie?.episodes && movie.episodes.length > 1) ||
      (episode && episode?.seasonNumber !== undefined && (movie?.isSeries || movie?.seasons > 0))
    ))
  );

  // Extract season number accurately from multiple formats
  let season = 1;
  if (episode?.seasonNumber !== undefined && episode?.seasonNumber !== null) {
    season = parseInt(episode.seasonNumber, 10) || 1;
  } else if (episode?.season !== undefined && episode?.season !== null) {
    season = parseInt(episode.season, 10) || 1;
  } else if (episode?.info?.[1]) {
    const match = String(episode.info[1]).match(/S?(\d+)/i);
    if (match) season = parseInt(match[1], 10) || 1;
  }

  // Extract episode number accurately
  let ep = 1;
  if (episode?.episodeNumber !== undefined && episode?.episodeNumber !== null) {
    ep = parseInt(episode.episodeNumber, 10) || 1;
  } else if (episode?.ep !== undefined && episode?.ep !== null) {
    ep = parseInt(episode.ep, 10) || 1;
  } else if (episode?.info?.[0]) {
    const match = String(episode.info[0]).match(/E?(\d+)/i);
    if (match) ep = parseInt(match[1], 10) || 1;
  }

  // Resolve IMDB ID synchronously where possible
  const cleanTitle = movie?.title ? movie.title.toLowerCase().trim() : '';
  const imdbId = customImdbId
    || movie?.imdbId
    || POPULAR_IMDB_MAP[movie?.id]
    || POPULAR_IMDB_MAP[movie?.netmirrorId]
    || POPULAR_IMDB_MAP[playbackId]
    || (cleanTitle ? POPULAR_TITLE_IMDB_MAP[cleanTitle] : null)
    || (isSeries ? 'tt4574334' : 'tt1849718');

  // Resolve TMDB ID for VidLink which requires numeric TMDB ID for TV shows
  const tmdbId = customTmdbId
    || movie?.tmdbId
    || POPULAR_TMDB_MAP[movie?.id]
    || POPULAR_TMDB_MAP[movie?.netmirrorId]
    || POPULAR_TMDB_MAP[playbackId]
    || (cleanTitle ? POPULAR_TITLE_TMDB_MAP[cleanTitle] : null)
    || null;

  // Embed links ordered by verified uptime, no-block iframes & high-speed latency
  // Server 1: VidSrc Live 4K (Ultra-fast startup, no X-Frame restrictions, supports Movies & TV)
  const vidsrcMeUrl = isSeries
    ? `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${ep}`
    : `https://vidsrc.me/embed/movie?imdb=${imdbId}`;

  // Server 2: 2Embed Cinema HD (Global & Regional coverage, verified 200 OK for Hollywood, Bollywood & Anime)
  const twoEmbedUrl = isSeries
    ? `https://www.2embed.cc/embedtv/${imdbId}&s=${season}&e=${ep}`
    : `https://www.2embed.cc/embed/${imdbId}`;

  // Server 3: VidSrc To Stream (Alternative mirror with global cloud edge)
  const vidsrcToUrl = isSeries
    ? `https://vidsrc.to/embed/tv/${imdbId}/${season}/${ep}`
    : `https://vidsrc.to/embed/movie/${imdbId}`;

  // Server 4: VidLink Fast HD (VidLink player with fallback to VidSrc Live)
  const vidlinkUrl = isSeries
    ? (tmdbId
        ? `https://vidlink.pro/tv/${tmdbId}/${season}/${ep}?autoplay=true&primaryColor=e50914`
        : `https://vidsrc.me/embed/tv?imdb=${imdbId}&season=${season}&episode=${ep}`)
    : (tmdbId
        ? `https://vidlink.pro/movie/${tmdbId}?autoplay=true&primaryColor=e50914`
        : `https://vidlink.pro/movie/${imdbId}?autoplay=true&primaryColor=e50914`);

  const vidsrcMeServer = {
    id: 1,
    name: 'Server 1 (VidSrc Live - Fast 4K Ultra HD)',
    type: 'embed',
    url: vidsrcMeUrl,
    badge: 'Fast 4K • Multi-Audio',
    description: 'Instant load geo-distributed cloud streaming with multiple audio and subtitle options.'
  };

  const twoEmbedServer = {
    id: 2,
    name: 'Server 2 (2Embed Cinema - Multi-Server Mirror)',
    type: 'embed',
    url: twoEmbedUrl,
    badge: 'Full Movie • Cinema HD',
    description: 'High-reliability global streaming network with full movies and all seasons/episodes.'
  };

  const vidsrcToServer = {
    id: 3,
    name: 'Server 3 (VidSrc To - Ultra Stream)',
    type: 'embed',
    url: vidsrcToUrl,
    badge: 'Full Movie • 4K Mirror',
    description: 'High-bandwidth streaming cluster with adaptive 4K bitrate.'
  };

  const vidlinkServer = {
    id: 4,
    name: 'Server 4 (VidLink Fast HD)',
    type: 'embed',
    url: vidlinkUrl,
    badge: 'Full Movie • 1080p',
    description: 'VidLink edge player with custom theme and adaptive buffering.'
  };

  const directVideoServer = {
    id: 6,
    name: 'Server 5 (Cinema Direct Stream)',
    type: 'video',
    url: movie?.videoUrl || 'https://vjs.zencdn.net/v/oceans.mp4',
    badge: 'Direct Stream',
    description: 'Direct MP4 high-bandwidth stream with native Netflix controls.'
  };

  const trailerServer = {
    id: 7,
    name: 'Server 6 (Official 4K Trailer & Preview)',
    type: 'youtube',
    url: movie?.youtubeId || '3x77q40hATw',
    badge: 'Official Promo',
    description: 'Ultra HD 4K official trailer on YouTube.'
  };

  return [
    vidsrcMeServer,
    twoEmbedServer,
    vidsrcToServer,
    vidlinkServer,
    directVideoServer,
    trailerServer
  ];
}

export const NETMIRROR_EXTENSION_INFO = {
  version: '2.4.0',
  title: 'NetMirror Browser Extension',
  description: 'Fast Stream and Download NetMirror videos with built-in multi-OTT proxy headers and direct download support.',
  chromeStoreUrl: 'https://chromewebstore.google.com/detail/netmirror-extension/imeeoinlogcehkhfjcopabijecfobcod',
  firefoxAddonUrl: 'https://addons.mozilla.org/en-US/firefox/addon/netmirror-web-extension/',
  githubUrl: 'https://github.com/appli55/netmirror_extension',
  downloadZipUrl: 'https://raw.githubusercontent.com/appli55/netmirror_extension/main/file/NetMirror_extension.zip',
  telegramUrl: 'https://t.me/netmirror_web',
  centerWebsiteUrl: 'https://netmirror.center/'
};
