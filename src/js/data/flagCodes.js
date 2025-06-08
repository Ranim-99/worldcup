const flagCodes = [
  { code3: '1A', code2: {title : "Group A Winner", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '2A', code2: {title : "Group A Runner-up", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '1B', code2: {title : "Group B Winner", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '2B', code2: {title : "Group B Runner-up", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '1C', code2: {title : "Group C Winner", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '2C', code2: {title : "Group C Runner-up", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '1D', code2: {title : "Group D Winner", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '2D', code2: {title : "Group D Runner-up", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '1E', code2: {title : "Group E Winner", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '2E', code2: {title : "Group E Runner-up", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '1F', code2: {title : "Group F Winner", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '2F', code2: {title : "Group F Runner-up", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '1G', code2: {title : "Group G Winner", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '2G', code2: {title : "Group G Runner-up", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '1H', code2: {title : "Group H Winner", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },
  { code3: '2H', code2: {title : "Group H Runner-up", url: "https://www.idahoyouthsoccer.org/wp-content/uploads/sites/171/2025/05/missing-logo-icon.png"} },

  { code3: 'ASC', code2: {title : "Al Ahly", url: "https://upload.wikimedia.org/wikipedia/ar/2/21/Al_Ahly_SC_logo_23.svg"} },
  { code3: 'IM', code2: {title: 'Inter Miami', url: "https://upload.wikimedia.org/wikipedia/fr/4/46/Inter_Miami_CF_%28logo%29.svg"} },
  { code3: 'PO', code2: {title: 'Porto', url: "https://upload.wikimedia.org/wikipedia/sco/f/f1/FC_Porto.svg"} },
  { code3: 'PAL', code2: {title: 'Palmeiras', url: "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg"} },
  
  { code3: 'PSG', code2: {title: 'Paris Saint-Germain', url: "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg"} },
  { code3: 'ATL', code2: {title: 'Atlético Madrid', url: "https://upload.wikimedia.org/wikinews/en/c/c1/Atletico_Madrid_logo.svg"} },
  { code3: 'BOT', code2: {title: 'Botafogo', url: "https://upload.wikimedia.org/wikipedia/commons/5/52/Botafogo_de_Futebol_e_Regatas_logo.svg"} },
  { code3: 'SEA', code2: {title: 'Seattle Sounders', url: "https://upload.wikimedia.org/wikipedia/ar/2/27/Seattle_Sounders_FC.svg"} },
  
  { code3: 'BAY', code2: {title: 'Bayern Munich', url: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Logo_FC_Bayern_M%C3%BCnchen_%282002%E2%80%932017%29.svg"} },
  { code3: 'AKL', code2: {title: 'Auckland City', url: "https://upload.wikimedia.org/wikipedia/ar/9/9f/Auckland_City_FC_logo.svg"} },
  { code3: 'BOC', code2: {title: 'Boca Juniors', url: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Boca_Juniors_logo18.svg"} },
  { code3: 'SLB', code2: {title: 'SL Benfica', url: "https://upload.wikimedia.org/wikipedia/sco/a/a2/SL_Benfica_logo.svg"} },
  
  { code3: 'FLA', code2: {title: 'Flamengo', url: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg"} },
  { code3: 'EST', code2: {title: 'Espérance de Tunisie', url: "https://upload.wikimedia.org/wikipedia/el/3/3d/Esp%C3%A9rance_Sportive_de_Tunis_%28logo%29.svg"} },
  { code3: 'CHE', code2: {title: 'Chelsea', url: "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg"} },
  { code3: 'LAF', code2: {title: 'LAFC', url: "https://upload.wikimedia.org/wikipedia/commons/8/86/Los_Angeles_Football_Club.svg"} },
  
  { code3: 'RIV', code2: {title: 'River Plate', url: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Escudo_del_C_A_River_Plate.svg"} },
  { code3: 'URW', code2: {title: 'Urawa Red Diamonds', url: "https://upload.wikimedia.org/wikipedia/ar/7/73/Urawa_Red_Diamonds.svg"} },
  { code3: 'MNT', code2: {title: 'Monterrey', url: "https://upload.wikimedia.org/wikipedia/commons/3/35/Club_de_F%C3%BAtbol_Monterrey_2019_Logo.svg"} },
  { code3: 'INT', code2: {title: 'Inter Milan', url: "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg"} },
  
  { code3: 'FLU', code2: {title: 'Fluminense FC', url: "https://upload.wikimedia.org/wikipedia/commons/1/1d/FFC_crest.svg"} },
  { code3: 'DOR', code2: {title: 'Borussia Dortmund', url: "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg"} },
  { code3: 'UHD', code2: {title: 'Ulsan HD', url: "https://upload.wikimedia.org/wikipedia/ar/6/61/Ulsan_HD_FC.svg"} },
  { code3: 'MSU', code2: {title: 'Mamelodi Sundowns', url: "https://upload.wikimedia.org/wikipedia/ar/b/bb/Mamelodi_Sundowns_logo.svg"} },
  
  { code3: 'MCI', code2: {title: 'Manchester City', url: "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg"} },
  { code3: 'WYD', code2: {title: 'Wydad Casablanca', url: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Wydad_Athletic_Club_logo.svg"} },
  { code3: 'AIN', code2: {title: 'Al Ain', url: "https://upload.wikimedia.org/wikipedia/ar/1/1c/%D8%B4%D8%B9%D8%A7%D8%B1_%D9%86%D8%A7%D8%AF%D9%8A_%D8%A7%D9%84%D8%B9%D9%8A%D9%86_%28%D8%A7%D9%84%D8%A5%D9%85%D8%A7%D8%B1%D8%A7%D8%AA%29.svg"} },
  { code3: 'JUV', code2: {title: 'Juventus', url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Juventus_FC_-_logo_black_%28Italy%2C_2017%29.svg"} },
  
  { code3: 'RMA', code2: {title: 'Real Madrid', url: "https://upload.wikimedia.org/wikipedia/sco/5/56/Real_Madrid_CF.svg"} },
  { code3: 'ALH', code2: {title: 'Al Hilal', url: "https://upload.wikimedia.org/wikipedia/ar/archive/1/12/20230720132313%21Al_Hilal_SFC_logo_2022.svg"} },
  { code3: 'PAC', code2: {title: 'Pachuca', url: "https://upload.wikimedia.org/wikipedia/ar/9/93/Pachuca_Tuzos_logo.svg"} },
  { code3: 'SAL', code2: {title: 'FC Salzburg', url: "https://upload.wikimedia.org/wikipedia/ar/9/95/FC_Red_Bull_Salzburg.svg"} },
];

// Converter data from api from 3 digit to 2 digit code
// Updated to return uppercase codes for react-country-flag
const codeConverter = (code) => {
  const flagCode = flagCodes.find(el => el.code3 === code);
  return flagCode ? flagCode.code2 : code; // fallback to original code if not found
};

export default codeConverter;