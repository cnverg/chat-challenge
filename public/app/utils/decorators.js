export function Inject(...modules) {
  return (target) => Object.defineProperty(target, '$inject', { value: modules });
};
