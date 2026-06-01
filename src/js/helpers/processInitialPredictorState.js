/* Adapts the openfootball flat World Cup 2026 schema into the nested
 * { groupGames, knockoutGames } shape the predictor expects.
 *
 * - 12 groups (A-L), teams normalized to { name, code } objects.
 * - 5 knockout rounds: R32 -> R16 -> QF -> SF -> Final (no third-place match).
 * - Knockout teams start empty ({ name: null, code: null }) with the original
 *   slot label preserved on `position` ("2A", "W74", "3A/B/C/D/F").
 * - Each knockout round is ordered for a clean top-to-bottom bracket, so
 *   adjacent matches feed the same next-round match.
 *
 * Routing/lookup elsewhere is by match `num`, so this display order is purely
 * visual and never affects who plays whom. */

const GROUP_NAMES = [
  'Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F',
  'Group G', 'Group H', 'Group I', 'Group J', 'Group K', 'Group L',
];

// Source round labels (as they appear in the 2026 file) -> display names.
const KNOCKOUT_ROUNDS = [
  { src: 'Round of 32', name: 'Round of 32' },
  { src: 'Round of 16', name: 'Round of 16' },
  { src: 'Quarter-final', name: 'Quarter-finals' },
  { src: 'Semi-final', name: 'Semi-finals' },
  { src: 'Final', name: 'Final' },
];

// Bracket display order per round (by match num), derived from the W## tree.
const KNOCKOUT_DISPLAY_ORDER = {
  'Round of 32': [74, 77, 73, 75, 83, 84, 81, 82, 76, 78, 79, 80, 86, 88, 85, 87],
  'Round of 16': [89, 90, 93, 94, 91, 92, 95, 96],
  'Quarter-finals': [97, 98, 99, 100],
  'Semi-finals': [101, 102],
  Final: [104],
};

const normalizeTeam = (name) => ({
  name: name || null,
  code: name || null, // flagCodes maps the country name -> flag
});

const processInitialPredictorState = (data) => {
  const matches = Array.isArray(data.matches) ? data.matches : [];

  // ---- GROUP STAGE (12 groups, A-L) ----
  const groupMatches = matches.filter((m) => m.group);

  const groups = GROUP_NAMES.map((name) => {
    const sortedGames = groupMatches
      .filter((m) => m.group === name)
      .map((m, i) => ({
        ...m,
        num: m.num != null ? m.num : `${name.replace(/\s+/g, '')}-${i}`,
        team1: normalizeTeam(m.team1),
        team2: normalizeTeam(m.team2),
        stadium: { key: '', name: m.ground || '' },
        city: m.ground || '',
        confirmed: false,
        score1: null,
        score2: null,
        goals1: null,
        goals2: null,
      }));
    return { name, matches: sortedGames };
  });

  // ---- KNOCKOUT STAGE (R32 -> Final) ----
  const knockoutGames = KNOCKOUT_ROUNDS
    .map(({ src, name }) => {
      const order = KNOCKOUT_DISPLAY_ORDER[name] || [];
      const roundMatches = matches
        .filter((m) => m.round === src)
        .sort((a, b) => order.indexOf(a.num) - order.indexOf(b.num))
        .map((m) => ({
          ...m,
          num: m.num != null ? m.num : (src === 'Final' ? 104 : m.num),
          team1: { name: null, code: null, position: m.team1 },
          team2: { name: null, code: null, position: m.team2 },
          stadium: { key: '', name: m.ground || '' },
          city: m.ground || '',
          confirmed: false,
          score1: null,
          score2: null,
          score1et: null,
          score2et: null,
          goals1: null,
          goals2: null,
        }));
      return { name, matches: roundMatches };
    })
    .filter((round) => round.matches.length);

  // Third-place match: shown beneath the Final in the SAME column (no bracket
  // lines). Its teams are the semifinal losers, filled in by KnockoutMatch.
  const thirdPlace = matches.find((m) => m.round === 'Match for third place');
  const finalRound = knockoutGames.find((r) => r.name === 'Final');
  if (thirdPlace && finalRound) {
    finalRound.matches.push({
      ...thirdPlace,
      num: 103,
      team1: { name: null, code: null, position: thirdPlace.team1 },
      team2: { name: null, code: null, position: thirdPlace.team2 },
      stadium: { key: '', name: thirdPlace.ground || '' },
      city: thirdPlace.ground || '',
      confirmed: false,
      score1: null, score2: null, score1et: null, score2et: null,
      goals1: null, goals2: null,
    });
  }

  return {
    groupGames: groups,
    knockoutGames,
  };
};

export default processInitialPredictorState;