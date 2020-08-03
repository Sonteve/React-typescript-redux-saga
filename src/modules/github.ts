import { createAsyncAction, createReducer, ActionType } from 'typesafe-actions';
import { AxiosError } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { getGithubUserData } from '../api/github';
import { AxiosResponse } from 'axios';

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
