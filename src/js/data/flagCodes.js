const flagCodes = [
  { code3: 'AUS', code2: 'AU' }, 
  { code3: 'ARG', code2: 'AR' }, 
  { code3: 'RUS', code2: 'RU' }, 
  { code3: 'KSA', code2: 'SA' },
  { code3: 'EGY', code2: {title : "Al Ahly", url: "https://upload.wikimedia.org/wikipedia/ar/2/21/Al_Ahly_SC_logo_23.svg"} }, 
  { code3: 'URU', code2: 'UY' }, 
  { code3: 'POR', code2: 'PT' }, 
  { code3: 'RMA', code2: {title:'realmadrid',url : 'https://upload.wikimedia.org/wikipedia/sco/5/56/Real_Madrid_CF.svg'} },
  { code3: 'MAR', code2: 'MA' }, 
  { code3: 'IRN', code2: 'IR' }, 
  { code3: 'FRA', code2: 'FR' }, 
  { code3: 'PER', code2: 'PE' },
  { code3: 'DEN', code2: 'DK' }, 
  { code3: 'ISL', code2: 'IS' }, 
  { code3: 'CRO', code2: 'HR' }, 
  { code3: 'NGA', code2: 'NG' },
  { code3: 'BRA', code2: 'BR' }, 
  { code3: 'SUI', code2: 'CH' }, 
  { code3: 'CRC', code2: 'CR' }, 
  { code3: 'SRB', code2: 'RS' },
  { code3: 'GER', code2: 'DE' }, 
  { code3: 'MEX', code2: 'MX' }, 
  { code3: 'SWE', code2: 'SE' }, 
  { code3: 'KOR', code2: 'KR' },
  { code3: 'BEL', code2: 'BE' }, 
  { code3: 'PAN', code2: 'PA' }, 
  { code3: 'TUN', code2: 'TN' }, 
  { code3: 'ENG', code2: 'GB' },
  { code3: 'POL', code2: 'PL' }, 
  { code3: 'SEN', code2: 'SN' }, 
  { code3: 'COL', code2: 'CO' }, 
  { code3: 'JPN', code2: 'JP' },
  { code3: 'NED', code2: 'NL' }, 
  { code3: 'ITA', code2: 'IT' }, 
  { code3: 'ECU', code2: 'EC' }, 
  { code3: 'ALG', code2: 'DZ' },
  { code3: 'CMR', code2: 'CM' }, 
  { code3: 'GRE', code2: 'GR' }, 
  { code3: 'HON', code2: 'HN' }, 
  { code3: 'BIH', code2: 'BA' },
  { code3: 'CIV', code2: 'CI' }, 
  { code3: 'USA', code2: {title: 'Inter Miami', url: "https://upload.wikimedia.org/wikipedia/fr/4/46/Inter_Miami_CF_%28logo%29.svg"} }, 
  { code3: 'CHI', code2: 'CL' }, 
  { code3: 'GHA', code2: 'GH' },
];

// Converter data from api from 3 digit to 2 digit code
// Updated to return uppercase codes for react-country-flag
const codeConverter = (code) => {
  const flagCode = flagCodes.find(el => el.code3 === code);
  return flagCode ? flagCode.code2 : code; // fallback to original code if not found
};

export default codeConverter;