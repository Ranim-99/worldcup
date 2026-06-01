const FIFA_BASE = 'https://play.fifa.com/media/image/bracket_predictor/flags/world_cup_2026';

const NAME_TO_FIFA = {
  Brazil: 'BRA', Argentina: 'ARG', Mexico: 'MEX', USA: 'USA', 'United States': 'USA',
  Canada: 'CAN', 'South Africa': 'RSA', 'South Korea': 'KOR', 'Korea Republic': 'KOR',
  Qatar: 'QAT', Switzerland: 'SUI', Morocco: 'MAR', Haiti: 'HAI', Scotland: 'SCO',
  Paraguay: 'PAR', Australia: 'AUS', Germany: 'GER', 'Curaçao': 'CUW', Curacao: 'CUW',
  'Ivory Coast': 'CIV', "Côte d'Ivoire": 'CIV', Ecuador: 'ECU', Netherlands: 'NED',
  Japan: 'JPN', Tunisia: 'TUN', Belgium: 'BEL', Egypt: 'EGY', Iran: 'IRN', 'IR Iran': 'IRN',
  'New Zealand': 'NZL', Spain: 'ESP', 'Cape Verde': 'CPV', 'Cabo Verde': 'CPV',
  'Saudi Arabia': 'KSA', Uruguay: 'URU', France: 'FRA', Senegal: 'SEN', Norway: 'NOR',
  Algeria: 'ALG', Austria: 'AUT', Jordan: 'JOR', Portugal: 'POR', Uzbekistan: 'UZB',
  Colombia: 'COL', England: 'ENG', Croatia: 'CRO', Ghana: 'GHA', Panama: 'PAN',
  // playoff contenders — verify these trigrams exist on FIFA's path before relying on them
  Italy: 'ITA', Denmark: 'DEN', Turkey: 'TUR', 'Türkiye': 'TUR', Poland: 'POL',
  Ukraine: 'UKR', Sweden: 'SWE', Wales: 'WAL', Albania: 'ALB',
  'Bosnia and Herzegovina': 'BIH', 'Bosnia & Herzegovina': 'BIH', 'Czech Republic': 'CZE',
  Czechia: 'CZE', Slovakia: 'SVK', 'Republic of Ireland': 'IRL', Ireland: 'IRL',
  'North Macedonia': 'MKD', Kosovo: 'KVX', Romania: 'ROU', 'Northern Ireland': 'NIR',
  Bolivia: 'BOL', Suriname: 'SUR', Jamaica: 'JAM', 'New Caledonia': 'NCL',
  'DR Congo': 'COD', 'Congo DR': 'COD', Iraq: 'IRQ',
};

const codeConverter = (name) => {
  if (!name) return { title: '', url: PLACEHOLDER };
  if (/winner|path|^\d|^[WL]\d/i.test(name)) return { title: name, url: PLACEHOLDER };
  const key = String(name).trim();
  const code = NAME_TO_FIFA[key] || NAME_TO_FIFA[key.replace(' & ', ' and ')];
  if (!code) {
    if (typeof console !== 'undefined') console.warn('No flag mapping for team:', name);
    return { title: key, url: PLACEHOLDER };
  }
  return { title: key, url: `${FIFA_BASE}/${code}.png` };
};

export default codeConverter;