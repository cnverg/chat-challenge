import md5 from 'md5';

export class User {
  constructor(name, emailAddress, avatarUrl) {
    Object.assign(this, { id: md5(name), name, emailAddress, avatarUrl, isValid: !!name });
  }
};
