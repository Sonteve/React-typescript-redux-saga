import axios from 'axios';
import { UserProfile } from '../modules/github';

export const getGithubUserData = async (username: string) => {
  const response = await axios.get<UserProfile>(
    `https://api.github.com/users/${username}`
  );
  return response.data;
};
