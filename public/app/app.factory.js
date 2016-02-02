import md5 from 'md5';
import angular from 'angular';
import Constants from './utils/constants';

export function GravatarFactory() {
  return {
    getUrl(email) {
      return `https://www.gravatar.com/avatar?gravatar_id=${md5(email)}&d=mm`;
    }
  };
};
