import update from 'immutability-helper';
import { KNOCKOUT_DATA_FETCHED, UPDATE_QUALIFIER, UPDATE_KNOCKOUT, UPDATE_KNOCKOUT_SCORE, REMOVE_TEAM } from '../constants/action-types';

function knockouts(state = [], action) {
  switch (action.type) {
    case KNOCKOUT_DATA_FETCHED:
      return action.data;
    
    case UPDATE_QUALIFIER:
      return update(state, {
        [action.round]: {
          matches: {
            [action.index1]: {
              team1: {
                name: { $set: action.teams[0].name },
                code: { $set: action.teams[0].code },
              },
            },
            [action.index2]: {
              team2: {
                name: { $set: action.teams[1].name },
                code: { $set: action.teams[1].code },
              },
            },
          },
        },
      });
    
    case UPDATE_KNOCKOUT:
      // Handle score-only updates
      if (action.home === 'scores' && action.scores) {
        return update(state, {
          [action.round]: {
            matches: {
              [action.index1]: {
                score1: { $set: action.scores.score1 },
                score2: { $set: action.scores.score2 },
              },
            },
          },
        });
      }
      
      // Handle team updates with scores
      let updateObj = {
        [action.round]: {
          matches: {
            [action.index1]: {
              [action.home]: {
                name: { $set: action.teams[0].name },
                code: { $set: action.teams[0].code },
              },
            },
          },
        },
      };
      
      // Add scores if provided
      if (action.scores && action.scores.length > 0) {
        updateObj[action.round].matches[action.index1].score1 = { $set: action.scores[0].score1 };
        updateObj[action.round].matches[action.index1].score2 = { $set: action.scores[0].score2 };
      }
      
      return update(state, updateObj);
    
    case UPDATE_KNOCKOUT_SCORE:
      return state.map((round, roundIndex) => {
        if (roundIndex === action.round) {
          return {
            ...round,
            matches: round.matches.map((match, matchIndex) => {
              if (matchIndex === action.matchIndex) {
                return {
                  ...match,
                  score1: action.score1,
                  score2: action.score2
                };
              }
              return match;
            })
          };
        }
        return round;
      });
    
    case REMOVE_TEAM:
      return update(state, {
        [action.round]: {
          matches: {
            [action.match]: {
              [action.home]: {
                name: { $set: null },
                code: { $set: null },
              },
              // Also reset scores when removing teams
              score1: { $set: null },
              score2: { $set: null },
            },
          },
        },
      });
    
    default:
      return state;
  }
}

export default knockouts;