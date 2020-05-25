import { Model, Op, WhereOperators, WhereValue, col } from 'sequelize';
import { Col } from 'sequelize/types/lib/utils';
import { ModelType } from '../models/model-type';
import { PlainWhere } from '../models/plain-where';

export function getAs<T extends Model<T>>(entity: ModelType<T>, as?: string, parentAs?: string): string {
  return as && parentAs ? `${parentAs}->${as}` : as ? as : entity.name;
}

export function getParentAs(as?: string, parentAs?: string): string {
  return as && parentAs ? `${parentAs}->${as}` : as ? as : null;
}

function getFieldData<T extends Model<T>>(entity: ModelType<T>, as?: string, parentAs?: string, i = 0): any {
  const fieldData: any = {};
  for (const attributeName of Object.keys(entity.rawAttributes)) {
    const attribute = entity.rawAttributes[attributeName];
    fieldData[attributeName] = `${getAs(entity, as, parentAs)}.${attribute.field}`;
  }
  if (++i > 5) {
    return fieldData;
  }
  for (const associationName of Object.keys(entity.associations)) {
    const association = entity.associations[associationName];
    fieldData[associationName] = getFieldData(association.target, association.as, as, i);
  }
  return fieldData;
}

export function getColumnName<T extends Model<T>>(
  entity: ModelType<T>,
  field: (object: T) => any,
  as?: string,
  parentAs?: string,
): string {
  return field(getFieldData(entity, as, parentAs));
}

export function getColumn<T extends Model<T>>(
  entity: ModelType<T>,
  field: (object: T) => any,
  as?: string,
  parentAs?: string,
): Col {
  return col(getColumnName(entity, field, as, parentAs));
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
