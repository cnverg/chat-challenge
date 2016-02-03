const _compose = (f, g) => (...xs) => f(g(...xs));

export function compose (f, ...gs) {
  return gs.reduce(_compose, f);
}