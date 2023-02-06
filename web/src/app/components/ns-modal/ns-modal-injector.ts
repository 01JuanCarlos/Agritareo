import { Injector, Type, InjectionToken, AbstractType, InjectFlags } from '@angular/core';

export class ModalInjector implements Injector {

  constructor(
    private parentInjector: Injector,
    private customTokens: WeakMap<any, any>
  ) { }

  get<T>(token: Type<T> | InjectionToken<T> | AbstractType<T>, notFoundValue?: T, flags?: InjectFlags): T;
  get(token: any, notFoundValue?: any);
  get(token: any, notFoundValue?: any, flags?: any) {
    const value = this.customTokens.get(token);
    if (undefined !== value) {
      return value;
    }

    return this.parentInjector.get<any>(token, notFoundValue);
  }

}
