import { Where, Literal } from 'sequelize/types/lib/utils';
import { WhereContainer } from './where-container';

export function WhereArg(func: (value: any, as?: string, parentAs?: string) => Where | Literal) {
  return (target: Record<string, any>, key: string): void => {
    WhereContainer.setArgFunc(target.constructor, key, func);
  };
}
