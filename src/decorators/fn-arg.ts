import { Fn, Literal } from 'sequelize/types/lib/utils';
import { FnContainer } from './fn-container';

export function FnArg(func: (as?: string, parentAs?: string) => Fn | Literal | Promise<Fn>) {
  return (target: Record<string, any>, key: string): void => {
    FnContainer.setArgFunc(target.constructor, key, func);
  };
}
