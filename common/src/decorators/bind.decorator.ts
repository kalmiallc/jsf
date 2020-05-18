export function Bind() {

  return function <T extends Function>(target: object, propertyKey: string, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void {
    if (!descriptor || (typeof descriptor.value !== 'function')) {
      throw new TypeError(`Only methods can be decorated with @Bind(). <${ propertyKey }> is not a method!`);
    }

    return {
      configurable: true,
      get(this: T): T {
        const bound: T = descriptor.value!.bind(this); // tslint:disable-line
        // Credits to https://github.com/andreypopp/autobind-decorator for memoizing the result of bind against a
        // symbol on the instance.
        Object.defineProperty(this, propertyKey, {
          value       : bound,
          configurable: true,
          writable    : true
        });
        return bound;
      }
    };
  };
}

export const isBindable = (f) => f.hasOwnProperty('prototype');
