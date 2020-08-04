## TypeScript Redux-Saga

`Redux Saga는 redux-thunk같이 서버에 데이터를 요청하거나 보내는 비동기처리를 할때 많이 사용 되는 라이브러리이다. Redux-saga는 액션을 모니터링 하고있다가 그 액션이 발생하면 우리가 설정 해 놓은 특정 작업을 하는방식으로 사용된다.`

`saga는 generator함수로 되어있다. 간단하게 generator문법에 대해 보면`

```javascript
function* generatorFunc() {
  console.log('msg1');
  yield 1;
  console.log('msg2');
  yield 2;
  console.log('msg3');
  yield 3;
}

const generatorObj = generatorFunc(); //제너레이터 객체 생성
generatorObj.next(); // msg1, {value : 1, done : false}
//첫번째 yild까지 실행
generatorObj.next(); // msg2, {value : 2, done : false}
//두번째 yild까지 실행
generatorObj.next(); // msg3, {value : 3, done : false}
//세번째 yild까지 실행
generatorObj.next(); // msg3, {value : undefined, done : true}
//next를 했지만 yield가 없으므로 return값이 없고 함수는 종료
```

`처음에 generatorFunc()로 제너레이터 객체를 생성하면 이 함수는 대기상태가 된다. 제너레이터 객체의 내장메서드 next()를 하면 다음에 나오는 yield의 뒷부분까지의 코드를 실행시키고 그 yield뒤의 return값을 value에 담고 제너레이터의 종료 여부를 done에 담은 객체를 return 한다.`

`redux사가에 사용예제를 보면`

```typescript
const GET_DATA = 'data/GET_DATA'; // 액션명 정의
export const getData = (value) => {
  type: GET_DATA;
}; // 액션 생성함수

// 우리가 특정 액션 발생시 실행하고 싶은 비동기 로직함수
// 순서대로 api요청을 하고 데이터 로드성공시 success action을 dispatch 해준다.
//  여기서 call은 뒤의 함수를 실행시키는것이고, put은 dispatch와 같다고 보면된다.
function* asyncLogicFunc() {
  try {
    const reponse = yield call(apiFunc, param);
    yield put({
      type: GET_DATA_SUCCESS,
      payload: response.data,
    });
  } catch (e) {
    yield put({
      type: GET_DATA_FAILURE,
      payload: e,
      error: true,
    });
  }
}

// GET_DATA 액션이 발생하는지 모니터링하는 saga
// GET_DATA 액션이 발생하면 testSaga에서 액션을 감지하고 asyncLogicFunc에 해당 actionName에 해당하는 액션객체를 asyncLogicFunc에 파라미터로 전달하고 실행시킨다.

export function* testSaga() {
  yield takeLatest(GET_DATA, asyncLogicFunc);
}

// rootSaga
// 액션을 모니터링하는 saga를 rootSaga에 등록 시켜놓는다.
// 이 saga함수를 rootSaga에 넣고 rootSaga를 sagaMiddleware에 등록하고 실행시키면 rootSaga안의 모든 사가함수를 실행시켜서 액션 대기상태로 해준다.

import testSaga from './data';

function* rootSaga() {
  yield all([testSaga()]); // rootSaga가 실행되면 그 안의 saga함수들은 액션 대기상태가 된다.
}

// 이상태에서
import getData from './data';
dispatch(getData());

/*
 *이렇게 컴포넌트에서 액션을 생성함수를 호출하고 dispatch를 하면
 *{type:GET_DATA}라는 액션이 발생되고 이 액션은 리듀서에 전달 되기전에 testSaga안의 takeLatest에서 걸리고 asyncLogicFunc를 실행시켜서 비동기 요청을 하고 그 값을 성공,실패 여부에 따라서 dispatch한다.
 */
```

`사가의 동작원리를 간단하게 설명하면 rootSaga에 해당 모듈에서 쓸 saga함수를 넣고 rootsaga를 미들웨어에 등록해놓으면 rootSaga는 그 안에있는 saga함수들을 실행시켜주고 그 saga함수들은 액션 대기상태가 된다. 그리고 그 saga함수에 해당하는 액션이 dispatch되면 그 액션이 리듀서에 전달되기 전에 가로채서 그 해당액션에 대한 제너레이터 함수를 yield 순서대로 실행킨다.`

## 이번 프로젝트에서는 github API를 이용하여 username을 입력받아 그 값을 넣어 api요청을 하여 유저정보를 받아와서 화면에 출력해볼것이다.

## 실행화면

![](https://blogfiles.pstatic.net/20200804_186/home1609_1596546105976NWfVa_PNG/sagaResult.png?type=w2)

## 폴더 구조

![](https://blogfiles.pstatic.net/20200803_214/home1609_1596433957135yNn59_PNG/saga-drSt.png?type=w2)

## 컴포넌트 관계도

![](https://blogfiles.pstatic.net/20200803_277/home1609_1596434228569MlXA4_PNG/ts-redux-saga.png?type=w2)

## Github 모듈 코드

- src/modules/github.ts

```typescript
import { createAsyncAction, createReducer, ActionType } from 'typesafe-actions';
import { AxiosError } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { getGithubUserData } from '../api/github';
import { AxiosResponse } from 'axios';

// github user정보를 요청하는데 필요한 액션명 선언.
const GET_USER_PROFILE = 'github/GET_USER_PROFILE'; // user데이터 요청시 발생하는 액션
const GET_USER_PROFILE_SUCCESS = 'github/GET_USER_PROFILE_SUCCESS'; // user데이터 요청 성공시 발생될 액션
const GET_USER_PROFILE_FAILURE = 'github/GET_USER_PROFILE_FAILURE'; // user데이터 요청 실패시 발생될 액션

//액션 액션 생성함수
// typesafe-actions의 createAsyncAction을 사용하면 비동기 액션끼리 묶어서 사용할 수 있다.
// 순서대로 요청, 성공, 실패 순으로 넣어주면 되고 request, success, failure로 각각 액션에 접근할수있다.
// ex) getUserProfileActions.request('hello') = { type: 'github/GET_USER_DATA', payload: 'hello}
// 제네릭안에는 리듀서로 전달될 액션 payload 각각의 타입을 넣어주면된다.
export const getUserProfileActions = createAsyncAction(
  GET_USER_PROFILE,
  GET_USER_PROFILE_SUCCESS,
  GET_USER_PROFILE_FAILURE
)<string, UserProfile, AxiosError>();

// 우리가 원하는 데이터를 받아오는 비동기 로직
// rootSaga에 등록된 saga함수 내부에서 액션을 파라미터로 받아서 이 함수를 yield를 순서대로 실행한다.
function* getUserProfileSaga(
  action: ReturnType<typeof getUserProfileActions.request>
) {
  try {
    const data: AxiosResponse<any> = yield call(
      getGithubUserData, //실행할 함수 => 여기서는 api 데이터 요청 함수.
      action.payload // 그 함수에 들어갈 파라미터 => user가 입력한 username값.
    );
    // 요청 성공시 받아온 data를 payload에 담아서 success액션객체을 dispath한다.
    yield put({
      type: GET_USER_PROFILE_SUCCESS,
      payload: data,
    });
  } catch (e) {
    // 요청 실패시 error를 payload에 담아서 failure 액션객체을 dispath한다.
    yield put({
      type: GET_USER_PROFILE_FAILURE,
      payload: e,
      error: true,
    });
  }
}

// rootSaga에 등록할 saga함수
// GET_USER_PROFILE액션이 발생하면 그 액션을  getUserProfileSaga에 파라미터로 넘긴뒤 함수를 실행한다.
// takeEvery는 들어온 모든 액션에 대해 중복적으로 처리하지만. (데이터 중복 요청시 다 요청)
// takeLatest는 가장 마지막에 실행된 액션에 대한것만 처리한다. ( 마지막에 액션에 대한것만 요청)
export function* githubSaga() {
  yield takeLatest(GET_USER_PROFILE, getUserProfileSaga);
}

// store의 초기 state
const initialState: GithubState = {
  userProfile: {
    loading: false,
    data: null,
    error: null,
  },
};

// 리듀서부분 제네릭의 첫번째에 스토어의 interface, 두번째로 액션들의 return타입이 들어간다.
// 파라미터로는 첫번째에는 store의 초기 state, 두번째로 해당 액션별로 로직을 처리하고 새로운 state를 return하는 내용이 들어간다.
const github = createReducer<GithubState, GithubActions>(initialState, {
  [GET_USER_PROFILE]: (state) => ({
    ...state,
    userProfile: {
      loading: true,
      data: null,
      error: null,
    },
  }),
  [GET_USER_PROFILE_SUCCESS]: (state, action) => ({
    ...state,
    userProfile: {
      loading: false,
      data: action.payload,
      error: null,
    },
  }),
  [GET_USER_PROFILE_FAILURE]: (state, action) => ({
    ...state,
    userProfile: {
      loading: false,
      data: null,
      error: action.payload,
    },
  }),
});
export default github;

// 액션생성 함수들의 return type.
// 비동기액션생성함수인 getUserProfileActions이 세개의 액션을 만들기때문에 typeof를 붙여서 세가지의 return되는 액션객체 타입을 얻을수있다.
type GithubActions = ActionType<typeof getUserProfileActions>;

// store의 interface
export interface GithubState {
  userProfile: {
    loading: boolean;
    data: null | UserProfile; // 초기데이터는 null이고 데이터 요청 성공시 UserPorifle interface를 따르는 객체가 들어온다.
    error: null | AxiosError; // 초기에는 null이고 데이터 요청 실패시 Axios에서 반환하는 error가 들어온다.
  };
}

//데이터 성공시 받아올 GithubUser data의 interface
export interface UserProfile {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string;
  company: null;
  blog: string;
  location: null;
  email: null;
  hireable: null;
  bio: string;
  twitter_username: null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: Date;
  updated_at: Date;
}
```

- src/modules/index.ts

```typescript
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
```

- src/api/github.ts

```typescript
import axios from 'axios';
import { UserProfile } from '../modules/github';

export const getGithubUserData = async (username: string) => {
  const response = await axios.get<UserProfile>(
    `https://api.github.com/users/${username}`
  );
  return response.data;
};
```

- src/index.tsx

```typescript
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import rootReducer, { rootSaga } from './modules/';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';

// 미들웨어를 생성한다.
const sagaMiddleware = createSagaMiddleware();
// applyMiddleware를 사용하여 만든 미들웨어를 적용해준다.
const store = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
);
// 모듈 별 사가를 모아서 만든 rootSaga를 등록하여 실행한다.
sagaMiddleware.run(rootSaga);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

serviceWorker.unregister();
```

## Container 컴포넌트

- src/components/github.tsx

```typescript
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../modules';
import { getUserProfileActions } from '../../modules/github';
import GithubInsertForm from './GithubInsertForm';
import GithubItemList from './GithubItemList';

// 스토어와 연결되어있는 컴포넌트
function GithubContainer() {
  // github store의 프로퍼티중 userProfile을 받아온다.
  const { userProfile } = useSelector(({ github }: RootState) => github);
  const dispatch = useDispatch();

  // insertForm 컴포넌트로부터 유저이름을 받아서 dispatch 하는 함수
  const handleSubmit = (username: string) => {
    // 비동기 요청관련 액션생성함수 3개를 하나로 묶었을때
    // .request, .success, .failure로 그 액션생성함수에 접근할수있다.
    dispatch(getUserProfileActions.request(username));
  };
  return (
    <div>
      <GithubInsertForm handleSubmit={handleSubmit} />
      <GithubItemList userProfile={userProfile} />
    </div>
  );
}

export default GithubContainer;
```

## Presentational 컴포넌트

- src/components/github/GithubInsertForm.tsx

```typescript
import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';

// 받아올 props에 대한 interface
interface GithubInsertFormProps {
  handleSubmit: (username: string) => void;
}

// user에게 github username을 입력받는 컴포넌트
function GithubInsertForm({ handleSubmit }: GithubInsertFormProps) {
  // 해당컴포넌트에서 input값을 관리하기위한 state
  const [value, setValue] = useState<string>('');
  // 유저이름 입력후 focus를 위한 useRef
  const inputRef = useRef<HTMLInputElement>(null);

  // input값이 바뀔때마다 setValue로 해당 컴포넌트의 value를 바꿔준다.
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  // username 입력후 검색버튼을 눌렀을때 상위 비동기 요청 시작을 위해 상위
  // 컴포넌트로 현재 컴포넌트의 value값을 넘겨주고 input을 비우고 focus한다.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(value);
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={onSubmit}>
      <input
        value={value}
        placeholder="Input github username"
        onChange={onChange}
      />
      <button type="submit">검색</button>
    </form>
  );
}

export default GithubInsertForm;
```

- src/components/github/GithubItemList.tsx

```typescript
import React from 'react';
import { GithubState } from '../../modules/github';

//받아온 데이터 보여주는 컴포넌트

function GithubItemList({ userProfile: { data } }: GithubState) {
  // 받아온 데이터가 실패하거나 없으면 다른문구 출력
  if (!data) return <p>유저정보가 없습니다.</p>;
  const { avatar_url, bio, email, name } = data;
  /* avatar_url : 대표이미지 url
   * name: 유저이름
   * bio : 프로필
   * email : email
   */
  return (
    <div>
      <img src={avatar_url} alt={name} />
      <h2>
        <b>{name}</b>
      </h2>
      <p>{bio}</p>
      <br />
      <div>{email}</div>
    </div>
  );
}

export default GithubItemList;
```
