import { combineReducers } from 'redux';
import github, { githubSaga } from './github';
import { all } from 'redux-saga/effects';

// combineReducer 로 스토어를 모듈들을 합쳐준다.
const rootReducer = combineReducers({
  github,
});

// ReturnType<typeof ~~~>는 함수의 return값을 추론해준다.
// useSelector에서 타입으로 사용하기위해 rootReducer의 리턴타입을 export 해준다.
export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;

// 각각 모듈에서 만든 사가함수를 rootSaga에 등록시키고
// src밑 최상위 root index.js에서 saga미들웨어를 생성하고 그곳에 등록해준다.
export function* rootSaga() {
  yield all([githubSaga()]);
}
