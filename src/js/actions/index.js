import processInitialState from '../helpers/processInitialState';
import processInitialPredictorState from '../helpers/processInitialPredictorState';
import { KNOCKOUT_DATA_FETCHED, UPDATE_QUALIFIER, UPDATE_KNOCKOUT,
  UPDATE_SCORE, DATA_FETCHED, LOADING_DATA, LOADING_ERROR, REMOVE_TEAM,
  UPDATE_CHAMPIONS, REMOVE_CHAMPIONS, UPDATE_KNOCKOUT_SCORE } from '../constants/action-types';

import { assignThirds } from '../data/thirdPlaceAllocation';
import { REPORT_THIRD } from '../constants/action-types';

export function loadingError(bool) {
  return {
    type: LOADING_ERROR,
    isError: bool,
  };
}

const THIRD_SLOT_MATCHES = [74, 77, 79, 80, 81, 82, 85, 87];

function applyThirds(dispatch, thirds, knockouts) {
  const r32 = knockouts[0];
  if (!r32) return;
  const findIdx = (num) => r32.matches.findIndex((m) => m.num === num);

  // Clear the eight third slots whenever group picks change.
  THIRD_SLOT_MATCHES.forEach((num) => {
    const idx = findIdx(num);
    if (idx !== -1) {
      dispatch(updateKnockout([{ name: null, code: null }], idx, 0, 'team2', []));
    }
  });

  // --- Automatic allocation DISABLED: ThirdPlacePicker now fills these
  // slots manually from the user's 8-of-12 selection. ---
  // if (Object.keys(thirds).length === 12) {
  //   const fills = assignThirds(thirds);
  //   if (fills) {
  //     fills.forEach((f) => {
  //       const idx = findIdx(f.matchNum);
  //       if (idx !== -1) dispatch(updateKnockout([f.team], idx, 0, 'team2', []));
  //     });
  //   }
  // }
}

export function reportThird(group, team) {
  return (dispatch, getState) => {
    dispatch({ type: REPORT_THIRD, group, team });
    const { thirds, knockouts } = getState();
    applyThirds(dispatch, thirds, knockouts);
  };
}

export function loadingData(bool) {
  return {
    type: LOADING_DATA,
    isLoading: bool,
  };
}

function updateQual(payload, round) {
  return { type: UPDATE_QUALIFIER, payload, round };
}
export function updateQualifier(payload, round) {
  return (dispatch) => dispatch(updateQual(payload, round));
}

function removeMatch(round, match, home) {
  return {
    type: REMOVE_TEAM,
    round,
    match,
    home,
  };
}

export function removeTeam(round, match, home) {
  return (dispatch) => {
    dispatch(removeMatch(round, match, home));
  };
}

function removeChamps(team) {
  return {
    type: REMOVE_CHAMPIONS,
    team,
  };
}

export function removeChampions(team) {
  return (dispatch) => {
    dispatch(removeChamps(team));
  };
}

function updateChamps(team) {
  return {
    type: UPDATE_CHAMPIONS,
    team,
  };
}

export function updateChampions(team) {
  return (dispatch) => {
    dispatch(updateChamps(team));
  };
}

function updateKnock(teams, index1, round, home, scores) {
  return {
    type: UPDATE_KNOCKOUT,
    teams,
    index1,
    round,
    home,
    scores,
  };
}

export function updateKnockout(teams, index1, round, home, scores) {
  return (dispatch) => {
    dispatch(updateKnock(teams, index1, round, home, scores));
  };
}

function updateKnockScore(round, matchIndex, score1, score2) {
  return {
    type: UPDATE_KNOCKOUT_SCORE,
    round,
    matchIndex,
    score1,
    score2,
  };
}

export function updateKnockoutScore(round, matchIndex, score1, score2) {
  return (dispatch) => {
    dispatch(updateKnockScore(round, matchIndex, score1, score2));
  };
}

export function updateGoal(group, index, score, home) {
  return {
    type: UPDATE_SCORE,
    group,
    index,
    score,
    home,
  };
}

export function updateScore(group, index, score, home) {
  return (dispatch) => {
    dispatch(updateGoal(group, index, score, home));
  };
}

export function groupsFetched(data) {
  return {
    type: DATA_FETCHED,
    data,
  };
}

export function fetchKnockouts(data) {
  return {
    type: KNOCKOUT_DATA_FETCHED,
    data,
  };
}

export function fetchData(url) {
  return (dispatch) => {
    dispatch(loadingData(true));
    fetch(url)
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response;
      })
      .then(response => response.json())
      .then((data) => {
        const processedData = processInitialState(data);
        dispatch(groupsFetched(processedData.groupGames));
        dispatch(fetchKnockouts(processedData.knockoutGames));
      })
      .then(() => dispatch(loadingData(false)))
      .catch(() => dispatch(loadingError(true)));
  };
}

export function fetchPredictor(url) {
  return (dispatch) => {
    dispatch(loadingData(true));
    fetch(url)
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response;
      })
      .then(response => response.json())
      .then((data) => {
        const processedData = processInitialPredictorState(data);
        dispatch(groupsFetched(processedData.groupGames));
        dispatch(fetchKnockouts(processedData.knockoutGames));
      })
      .then(() => dispatch(loadingData(false)))
      .catch(() => dispatch(loadingError(true)));
  };
}
