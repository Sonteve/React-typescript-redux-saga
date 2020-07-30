import { combineReducers } from 'redux';
import github, { githubSaga } from './github';
import { all } from 'redux-saga/effects';

const rootReducer = combineReducers({
  github,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

export function* rootSaga() {
  yield all([githubSaga()]);
}
