import { combineReducers } from 'redux';
import { groups, loadingError, loadingData } from './groups';
import knockouts from './knockouts';
import champions from './champions';
import thirds from './thirds';

export default combineReducers({
  groups,
  knockouts,
  loadingError,
  loadingData,
  champions,
  thirds,
});
