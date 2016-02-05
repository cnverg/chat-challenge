const _compose = function(f, g) {
  return function() {
    const xs = [].slice.call(arguments, 0);
    return f(g.apply(g, xs));
  }
};

function compose (f) {
  const gs = [].slice.call(arguments, 1);
  return gs.reduce(_compose, f);
};

function apply() {
  const fns = [].slice.call(arguments, 0);
  return function() {
    const args = [].slice.call(arguments, 0);
    return fns.map(f => f.apply(null, args));
  }
}

function first() {
  return arguments[0];
}

function id(x) {
  return x;
}

function forEach(apply) {
  return function each(collection) {
    collection.forEach(apply);
  }
}

function lazy(f) {
  const xs = [].slice.call(arguments, 1);

  return function() {
    const ys = [].slice.call(arguments, 0);

    return function() {
      const zs = [].slice.call(arguments, 0);
      f.apply(f, xs.concat(ys).concat(zs));
    }
  }
}

function isMd5(str) {
  return str && /^[a-f0-9]{32}$/.test(str);
}

module.exports = { compose: compose, apply: apply, first: first, forEach: forEach, lazy: lazy, isMd5: isMd5 };
