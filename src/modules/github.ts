import { createAsyncAction, createReducer, ActionType } from 'typesafe-actions';
import { AxiosError } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import axios, { AxiosResponse } from 'axios';

const GET_USER_PROFILE = 'github/GET_USER_PROFILE';
const GET_USER_PROFILE_SUCCESS = 'github/GET_USER_PROFILE_SUCCESS';
const GET_USER_PROFILE_FAILURE = 'github/GET_USER_PROFILE_FAILURE';

export const getUserProfileActions = createAsyncAction(
  GET_USER_PROFILE,
  GET_USER_PROFILE_SUCCESS,
  GET_USER_PROFILE_FAILURE
)<string, UserProfile, AxiosError>();

const getGithubUserData = async (username: string) => {
  const response = await axios.get<UserProfile>(
    `https://api.github.com/users/${username}`
  );
  return response.data;
};

function* getUserProfileSaga(
  action: ReturnType<typeof getUserProfileActions.request>
) {
  try {
    const data: AxiosResponse<any> = yield call(
      getGithubUserData,
      action.payload
    );
    yield put({
      type: GET_USER_PROFILE_SUCCESS,
      payload: data,
    });
  } catch (e) {
    yield put({
      type: GET_USER_PROFILE_FAILURE,
      payload: e,
      error: true,
    });
  }
}

export function* githubSaga() {
  yield takeLatest(GET_USER_PROFILE, getUserProfileSaga);
}

const initialState: GithubState = {
  userProfile: {
    loading: false,
    data: null,
    error: null,
  },
};

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

type GithubActions = ActionType<typeof getUserProfileActions>;

export interface GithubState {
  userProfile: {
    loading: boolean;
    data: null | UserProfile;
    error: Error | null;
  };
}

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
