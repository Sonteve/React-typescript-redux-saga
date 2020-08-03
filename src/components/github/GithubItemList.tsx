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
