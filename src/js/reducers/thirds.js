import { REPORT_THIRD } from '../constants/action-types';

// Stores each group's third-placed team, keyed by group letter:
//   { A: { name, code, pts, gd, gf }, B: {...}, ... }
function thirds(state = {}, action) {
  switch (action.type) {
    case REPORT_THIRD: {
      if (!action.team) {
        const next = { ...state };
        delete next[action.group];
        return next;
      }
      return { ...state, [action.group]: action.team };
    }
    default:
      return state;
  }
}

export default thirds;