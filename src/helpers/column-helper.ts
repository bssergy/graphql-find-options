import { Model, Op, WhereOperators, WhereValue, col } from 'sequelize';
import { Col } from 'sequelize/types/lib/utils';
import { ModelType } from '../models/model-type';
import { PlainWhere } from '../models/plain-where';

export function getColumnName<T extends Model<T>>(
  entity: ModelType<T>,
  field: (object: T) => any,
  alias: string = null,
): string {
  let columnName: string = field(entity.rawAttributes as any).field;
  if (alias) {
    columnName = `${alias}.${columnName}`;
  }
  return columnName;
}

export function getColumn<T extends Model<T>>(
  entity: ModelType<T>,
  field: (object: T) => any,
  alias: string = null,
): Col {
  return col(getColumnName(entity, field, alias));
}

export function getArgumentValue(argValue: PlainWhere): WhereValue {
  if (argValue === null) {
    return null;
  }
  if (typeof argValue === 'object' && !(argValue instanceof Date) && argValue.constructor?.name !== 'Array') {
    const values: WhereOperators[] = Object.keys(argValue).map(operation => {
      const value: PlainWhere = argValue[operation];
      if (typeof value === 'object' && value?.constructor?.name === 'Array') {
        return {
          [Op[operation]]: (value as PlainWhere[]).map((x: PlainWhere) => getArgumentValue(x)),
        };
      }
      return {
        [Op[operation]]: getArgumentValue(value),
      };
    });
    if (values.length > 1) {
      return { [Op.and]: values };
    }
    return values[0];
  }
  return argValue as WhereValue;
}
