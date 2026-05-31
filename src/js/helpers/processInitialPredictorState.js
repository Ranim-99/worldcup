
/* Adapts the openfootball *flat* World Cup 2026 schema:
 *   { name, matches: [ { round, group?, num?, team1: "..", team2: "..", ground, date, time } ] }
 * into the nested { groupGames, knockoutGames } shape the predictor expects,
 * with every team normalized back to { name, code } objects.
 *
 * Group teams keep their names (incl. playoff placeholders like
 * "UEFA Path A winner"). Knockout teams are nulled for prediction, but the
 * original slot label ("2A", "W74", "3A/B/C/D/F") is preserved on `position`
 * so the bracket can show "to be decided" placeholders. */

const GROUP_NAMES = [
  'Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F',
  'Group G', 'Group H', 'Group I', 'Group J', 'Group K', 'Group L',
];

// Source round labels (as they appear in the 2026 file), in bracket order,
// mapped to the display names the app uses elsewhere.
const KNOCKOUT_ROUNDS = [
  { src: 'Round of 32', name: 'Round of 32' },
  { src: 'Round of 16', name: 'Round of 16' },
  { src: 'Quarter-final', name: 'Quarter-finals' },
  { src: 'Semi-final', name: 'Semi-finals' },
  { src: 'Final', name: 'Final' },
];

const normalizeTeam = (name) => ({
  name: name || null,
  // flagCodes.js maps the country name -> flag; until that's rewritten the
  // name doubles as the code so nothing throws.
  code: name || null,
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
        // groups have no `num` in the source, so synthesize a stable React key
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
      const roundMatches = matches
        .filter((m) => m.round === src)
        .sort((a, b) => (a.num || 0) - (b.num || 0))
        .map((m) => ({
          ...m,
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
    // drop any knockout round not present in the data yet
    .filter((round) => round.matches.length);

  return {
    groupGames: groups,
    knockoutGames,
  };
};

export default processInitialPredictorState;
