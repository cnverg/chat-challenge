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

module.exports = { compose: compose, apply: apply, first: first };

