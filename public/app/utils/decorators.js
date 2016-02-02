export function Inject(...modules) {
  return (target) => Object.defineProperty(target, '$inject', { value: modules });
};

export function BindTo(scope) {
  return (target, val, descriptor) => {
    console.log(target);
    console.log(val);
    console.log(descriptor);
    return target;
  }
}