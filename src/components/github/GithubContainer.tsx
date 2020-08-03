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
