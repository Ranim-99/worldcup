/* National-team flags for World Cup 2026.
 *
 * The 2026 feed gives teams as plain country-name strings (e.g. "Mexico",
 * "South Korea", "England"), and processInitialPredictorState sets
 * code = team name. So codeConverter receives a country NAME, not a code.
 *
 * Returns { title, url } — the same shape FlagIcon already consumes, so
 * FlagIcon.js needs no changes. Flags come from flagcdn.com, which also
 * serves the UK home nations (gb-eng / gb-sct / gb-wls / gb-nir) that plain
 * ISO 3166-1 alpha-2 codes can't represent. */

const FLAG_BASE = 'https://flagcdn.com/w80'; // e.g. https://flagcdn.com/w80/mx.png

// Neutral placeholder for playoff slots that don't yet have a real team
// ("UEFA Path A winner", "IC Path 1 winner", etc.) and anything unmapped.
const PLACEHOLDER =
  'https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png';

// Country name -> flagcdn code. Includes the confirmed 2026 teams plus the
// realistic UEFA / intercontinental playoff contenders, and common name
// variants (so "USA"/"United States", "Ivory Coast"/"Côte d'Ivoire", etc.
// all resolve).
const NAME_TO_CODE = {
  // --- Confirmed 2026 group teams ---
  Mexico: 'mx',
  'South Africa': 'za',
  'South Korea': 'kr',
  'Korea Republic': 'kr',
  Canada: 'ca',
  Qatar: 'qa',
  Switzerland: 'ch',
  Brazil: 'br',
  Morocco: 'ma',
  Haiti: 'ht',
  Scotland: 'gb-sct',
  USA: 'us',
  'United States': 'us',
  Paraguay: 'py',
  Australia: 'au',
  Germany: 'de',
  'Curaçao': 'cw',
  Curacao: 'cw',
  'Ivory Coast': 'ci',
  "Côte d'Ivoire": 'ci',
  'Cote d\'Ivoire': 'ci',
  Ecuador: 'ec',
  Netherlands: 'nl',
  Japan: 'jp',
  Tunisia: 'tn',
  Belgium: 'be',
  Egypt: 'eg',
  Iran: 'ir',
  'IR Iran': 'ir',
  'New Zealand': 'nz',
  Spain: 'es',
  'Cape Verde': 'cv',
  'Cabo Verde': 'cv',
  'Saudi Arabia': 'sa',
  Uruguay: 'uy',
  France: 'fr',
  Senegal: 'sn',
  Norway: 'no',
  Argentina: 'ar',
  Algeria: 'dz',
  Austria: 'at',
  Jordan: 'jo',
  Portugal: 'pt',
  Uzbekistan: 'uz',
  Colombia: 'co',
  England: 'gb-eng',
  Croatia: 'hr',
  Ghana: 'gh',
  Panama: 'pa',

  // --- UEFA playoff contenders (fill the "UEFA Path" slots once decided) ---
  Italy: 'it',
  Denmark: 'dk',
  Turkey: 'tr',
  'Türkiye': 'tr',
  Poland: 'pl',
  Ukraine: 'ua',
  Sweden: 'se',
  Wales: 'gb-wls',
  Albania: 'al',
  'Bosnia and Herzegovina': 'ba',
  'Czech Republic': 'cz',
  Czechia: 'cz',
  Slovakia: 'sk',
  Ireland: 'ie',
  'Republic of Ireland': 'ie',
  'North Macedonia': 'mk',
  Kosovo: 'xk',
  Romania: 'ro',
  'Northern Ireland': 'gb-nir',

  // --- Intercontinental playoff contenders (fill the "IC Path" slots) ---
  Bolivia: 'bo',
  Suriname: 'sr',
  Jamaica: 'jm',
  'New Caledonia': 'nc',
  'DR Congo': 'cd',
  'Congo DR': 'cd',
  Iraq: 'iq',
};

// Converter: team name -> { title, url } for FlagIcon.
// Falls back to a neutral placeholder for playoff slots and unknown names.
const codeConverter = (name) => {
  if (!name) return { title: '', url: PLACEHOLDER };

  // Knockout slot labels ("2A", "W74") or playoff placeholders never resolve
  // to a country — show the placeholder.
  if (/winner|path|^\d|^[WL]\d/i.test(name)) {
    return { title: name, url: PLACEHOLDER };
  }

  const key = String(name).trim();
  let code = NAME_TO_CODE[key];
  if (!code) code = NAME_TO_CODE[key.replace(' & ', ' and ')];
  if (!code) {
    if (typeof console !== 'undefined') console.warn('No flag mapping for team:', name);
    return { title: key, url: PLACEHOLDER };
  }

  return { title: key, url: `${FLAG_BASE}/${code}.png` };
};

export default codeConverter;