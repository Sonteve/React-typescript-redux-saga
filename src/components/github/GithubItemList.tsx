import React from 'react';
import { GithubState } from '../../modules/github';

function GithubItemList({ userProfile: { data } }: GithubState) {
  if (!data) return <p>유저정보가 없습니다.</p>;
  const { avatar_url, bio, email, name } = data;
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
