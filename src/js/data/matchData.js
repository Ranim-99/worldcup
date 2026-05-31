/* World Cup 2026 bracket routing, derived directly from the openfootball
 * fixture slots:
 *   - group -> Round of 32 from the "1X" / "2X" slot labels
 *   - knockout progression from the "W##" winner labels
 *
 * advance[0]      groups -> Round of 32   (used by App.renderGroups + GroupTable)
 * advance[1..4]   winner routing per round (used by App.renderKnockouts)
 * advance[5]      dummy so advance[i+1] never goes out of bounds on the Final
 *
 * Each knockout-routing entry is ordered to line up positionally with the
 * round's matches AFTER they are sorted by `num` ascending (which is what
 * processInitialPredictorState does). index: 0 = team1 slot, 1 = team2 slot.
 *
 * NOTE: the eight third-place slots in the R32 ("3A/B/C/D/F", etc.) are NOT
 * routed here — which group's third fills each slot depends on the FIFA
 * lookup table once you know which thirds qualified. See thirdPlace note. */

export const FINAL_MATCH_NUM = 104;

export const advance = [
  // [0] Group stage -> Round of 32
  // group: A=0 ... L=11. winner = "1X" slot, runnerUp = "2X" slot.
  {
    round: 'Round of 32',
    matches: [
      { group: 0,  winner: { num: 79, slot: 'team1' }, runnerUp: { num: 73, slot: 'team1' } }, // A
      { group: 1,  winner: { num: 85, slot: 'team1' }, runnerUp: { num: 73, slot: 'team2' } }, // B
      { group: 2,  winner: { num: 76, slot: 'team1' }, runnerUp: { num: 75, slot: 'team2' } }, // C
      { group: 3,  winner: { num: 81, slot: 'team1' }, runnerUp: { num: 88, slot: 'team1' } }, // D
      { group: 4,  winner: { num: 74, slot: 'team1' }, runnerUp: { num: 78, slot: 'team1' } }, // E
      { group: 5,  winner: { num: 75, slot: 'team1' }, runnerUp: { num: 76, slot: 'team2' } }, // F
      { group: 6,  winner: { num: 82, slot: 'team1' }, runnerUp: { num: 88, slot: 'team2' } }, // G
      { group: 7,  winner: { num: 84, slot: 'team1' }, runnerUp: { num: 86, slot: 'team2' } }, // H
      { group: 8,  winner: { num: 77, slot: 'team1' }, runnerUp: { num: 78, slot: 'team2' } }, // I
      { group: 9,  winner: { num: 86, slot: 'team1' }, runnerUp: { num: 84, slot: 'team2' } }, // J
      { group: 10, winner: { num: 87, slot: 'team1' }, runnerUp: { num: 83, slot: 'team1' } }, // K
      { group: 11, winner: { num: 80, slot: 'team1' }, runnerUp: { num: 83, slot: 'team2' } }, // L
    ],
  },

  // [1] Round of 32 winners -> Round of 16  (ordered by R32 num 73..88)
  {
    round: 'Round of 16',
    matches: [
      { from: 73, num: 90, index: 0 },
      { from: 74, num: 89, index: 0 },
      { from: 75, num: 90, index: 1 },
      { from: 76, num: 91, index: 0 },
      { from: 77, num: 89, index: 1 },
      { from: 78, num: 91, index: 1 },
      { from: 79, num: 92, index: 0 },
      { from: 80, num: 92, index: 1 },
      { from: 81, num: 94, index: 0 },
      { from: 82, num: 94, index: 1 },
      { from: 83, num: 93, index: 0 },
      { from: 84, num: 93, index: 1 },
      { from: 85, num: 96, index: 0 },
      { from: 86, num: 95, index: 0 },
      { from: 87, num: 96, index: 1 },
      { from: 88, num: 95, index: 1 },
    ],
  },

  // [2] Round of 16 winners -> Quarter-finals  (ordered by R16 num 89..96)
  {
    round: 'Quarter-finals',
    matches: [
      { from: 89, num: 97,  index: 0 },
      { from: 90, num: 97,  index: 1 },
      { from: 91, num: 99,  index: 0 },
      { from: 92, num: 99,  index: 1 },
      { from: 93, num: 98,  index: 0 },
      { from: 94, num: 98,  index: 1 },
      { from: 95, num: 100, index: 0 },
      { from: 96, num: 100, index: 1 },
    ],
  },

  // [3] Quarter-final winners -> Semi-finals  (ordered by QF num 97..100)
  {
    round: 'Semi-finals',
    matches: [
      { from: 97,  num: 101, index: 0 },
      { from: 98,  num: 101, index: 1 },
      { from: 99,  num: 102, index: 0 },
      { from: 100, num: 102, index: 1 },
    ],
  },

  // [4] Semi-final winners -> Final  (ordered by SF num 101,102)
  {
    round: 'Final',
    matches: [
      { from: 101, num: 104, index: 0 },
      { from: 102, num: 104, index: 1 },
    ],
  },

  // [5] dummy: Final round has no "next match", but App.renderKnockouts still
  // reads advance[i+1] for it. The Final's num (104) is special-cased in
  // KnockoutMatch, so these values are never actually applied.
  {
    round: 'Final',
    matches: [
      { from: 104, num: 104, index: 0 },
      { from: 104, num: 104, index: 1 },
    ],
  },
];