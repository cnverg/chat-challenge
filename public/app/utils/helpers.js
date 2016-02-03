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

module.exports = { compose: compose };

