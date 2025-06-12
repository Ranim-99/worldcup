import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../reducers';
import { REMOVE_CHAMPIONS } from '../constants/action-types';

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('worldCupPredictorState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('worldCupPredictorState', serializedState);
  } catch (err) {
    // Ignore write errors
  }
};

// Check if this is the first load (page refresh/reload)
const isFirstLoad = () => {
  const sessionFlag = sessionStorage.getItem('appLoaded');
  if (!sessionFlag) {
    sessionStorage.setItem('appLoaded', 'true');
    return true;
  }
  return false;
};

// Reset localStorage on first load
const resetStateOnFirstLoad = () => {
  if (isFirstLoad()) {
    localStorage.removeItem('worldCupPredictorState');
    return true;
  }
  return false;
};

export default function store(preloadedState) {
  // Reset state on first load (page refresh)
  const wasReset = resetStateOnFirstLoad();

  // if (wasReset) {
  //   store.dispatch({ type: REMOVE_CHAMPIONS });
  // }
  
  // Only load persisted state if it wasn't reset
  const persistedState = wasReset ? undefined : loadState();
  const initialState = persistedState || preloadedState;
  
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST'],
        },
      }),
  });

  // Save state changes to localStorage
  store.subscribe(() => {
    const state = store.getState();
    // Only save the prediction data, not loading states
    saveState({
      groups: state.groups,
      knockouts: state.knockouts,
      champions: state.champions,
    });
  });

  return store;
}
