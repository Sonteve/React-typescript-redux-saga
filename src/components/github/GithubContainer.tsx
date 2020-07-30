import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../modules';
import { getUserProfileActions } from '../../modules/github';
import GithubInsertForm from './GithubInsertForm';
import GithubItemList from './GithubItemList';

function GithubContainer() {
  const { userProfile } = useSelector(({ github }: RootState) => github);
  const dispatch = useDispatch();
  const handleSubmit = (username: string) => {
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
