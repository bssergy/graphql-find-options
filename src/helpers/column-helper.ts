import { Model, Op, WhereOperators, WhereValue, col } from 'sequelize';
import { Col } from 'sequelize/types/lib/utils';
import { ModelType } from '../models/model-type';
import { PlainWhere } from '../models/plain-where';
import { JoinContainer } from '../decorators/join-container';

export function getAs<T extends Model<T>>(entity: ModelType<T>, as?: string, parentAs?: string): string {
  return as && parentAs ? `${parentAs}->${as}` : as ? as : entity.name;
}

export function getParentAs(as?: string, parentAs?: string): string {
  return as && parentAs ? `${parentAs}->${as}` : as ? as : null;
}

function getFieldData<T extends Model<T>>(entity: ModelType<T>, as?: string, parentAs?: string): any {
  const fieldData: any = {};
  for (const attributeName of Object.keys(entity.rawAttributes)) {
    const attribute = entity.rawAttributes[attributeName];
    fieldData[attributeName] = `\`${getAs(entity, as, parentAs)}\`.\`${attribute.field}\``;
  }
  for (const associationName of Object.keys(entity.associations)) {
    const association = entity.associations[associationName];
    (() => {
      var associationTarget = association.target;
      var associationAs = association.as;
      Object.defineProperty(fieldData, associationName, {
          get: function() {
              return getFieldData(associationTarget, associationAs, as);
          }
      });
    })();
  }
  return fieldData;
}

function getAssociationData<T extends Model<T>>(entity: ModelType<T>, as?: string): any {
  const associationData: any = {};
  for (const associationName of Object.keys(entity.associations)) {
    associationData['name'] = associationName;
    associationData
    const association = entity.associations[associationName];
    (() => {
      var associationTarget = association.target;
      var associationAs = association.as;
      Object.defineProperty(associationData, associationName, {
          get: function() {
            JoinContainer.addJoin(associationTarget, as);
            return getAssociationData(associationTarget, associationAs);
          }
      });
    })();
  }
  return associationData;
}

export function leftJoin<T extends Model<T>>(
  entity: ModelType<T>,
  field: (object: T) => any,
  as?: string
): string {
  return field(getAssociationData(entity, as));
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
