import md5 from 'md5';
import { compose } from '../utils/helpers';

export class User {
  constructor(name, emailAddress, avatarUrl) {
    const initial = Date.now().toString().split('');

    const bind = (f, ...args) => f.bind(f, ...args);
    const charWeight = (c) => c.charCodeAt(0);
    const reduce = (v, apply, [x, ...xs]) => x ? reduce(apply(v, x), apply, xs) : v;
    const map = (transform, [x, ...xs]) => x ? [transform(x)].concat(map(transform, xs)) : [];

    const split =  (separator) => (str) => str.split(separator);

    const makeId = compose(md5, n => n * Date.now(), bind(reduce, 0, (acc, x) => acc + x), bind(map, charWeight), split(''), String);

    Object.assign(this, { id: makeId(Date.now()), name, emailAddress, avatarUrl, isValid: !!name });
  }
};
