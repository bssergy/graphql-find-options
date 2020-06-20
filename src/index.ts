import {
  FindAndCountOptions,
  FindOptions,
  IncludeOptions,
  LogicType,
  Model,
  Op,
  where as whereFn,
  literal,
} from 'sequelize';
import { FnContainer } from './decorators/fn-container';
import { getArgumentValue, getParentAs, getColumnName } from './helpers/column-helper';
import { ModelType } from './models/model-type';
import { WhereContainer } from './decorators/where-container';

async function getOrderOptions(entity, order, orderOptions = [], orderItemModels = [], as?: string, parentAs?: string) {
  if (as) {
    orderItemModels.push({ model: entity, as });
  }
  for (const field of Object.keys(order)) {
    const argFn = FnContainer.getArgFunc(order.constructor, field);
    const orderItem =
      (argFn && (await argFn(as, parentAs))) || (Object.keys(entity.rawAttributes).includes(field) && field);
    if (orderItem) {
      let orderItemOptions = [];
      if (as && !argFn) {
        orderItemOptions = [...orderItemModels];
      }
      orderItemOptions.push(orderItem);
      orderItemOptions.push(order[field]);
      orderOptions.push(orderItemOptions);
    }
  }

  for (const association of Object.keys(entity.associations)) {
    const associationArgs = order[association];

    if (!associationArgs) {
      continue;
    }

    const model = entity.associations[association].target;

    getOrderOptions(
      model,
      associationArgs,
      orderOptions,
      orderItemModels,
      entity.associations[association].as,
      getParentAs(as, parentAs),
    );
  }

  return orderOptions;
}

function getOptions(selections, entity, args, includeOptions?, parentAs?: string, isRaw = false, distinctObj?) {
  let attributes = selections
    ?.filter(selection => Object.keys(entity.rawAttributes).includes(selection.name.value))
    .map(selection => selection.name.value);

  if (!attributes) {
    attributes = [];
  }

  if (distinctObj?.distinct && attributes.length) {
    const columnName = getColumnName(entity, entity => entity[attributes[0]], includeOptions?.as, parentAs);
    attributes[0] = [literal(`DISTINCT(${columnName})`), attributes[0]];
    distinctObj.distinct = false;
  }

  if (!isRaw) {
    for (const primaryKey of Object.keys(entity.primaryKeys)) {
      if (attributes.indexOf(primaryKey) < 0) {
        attributes.push(primaryKey);
      }
    }
  }

  const where = {};
  if (args) {
    for (const argName of Object.keys(args)) {
      const argFn = FnContainer.getArgFunc(args.constructor, argName);
      if (argFn) {
        if (!where[Op.and]) {
          where[Op.and] = [];
        }
        where[Op.and].push(whereFn(argFn(includeOptions?.as, parentAs), getArgumentValue(args[argName]) as LogicType));
      } else {
        const whereArg = WhereContainer.getArgFunc(args.constructor, argName);
        if (whereArg) {
          if (!where[Op.and]) {
            where[Op.and] = [];
          }

          where[Op.and].push(whereArg(args[argName], includeOptions?.as, parentAs));
        } else if (argName in entity.rawAttributes) {
          where[argName] = getArgumentValue(args[argName]);
        }
      }
    }
  }

  const include = [];
  for (const association of Object.keys(entity.associations)) {
    const selection = selections?.find(selection => selection.name.value === association);
    const associationArgs = args && args[association];

    if (!selection && !associationArgs) {
      continue;
    }
    const model = entity.associations[association].target;

    if (entity.associations[association].isMultiAssociation && !associationArgs) {
      continue;
    }

    const assosiationInclude = {
      model: model,
      required: !!associationArgs,
      as: entity.associations[association].as,
    };
    include.push(
      getOptions(
        selection?.selectionSet.selections,
        model,
        associationArgs,
        assosiationInclude,
        getParentAs(includeOptions?.as, parentAs),
        isRaw,
        distinctObj,
      ),
    );
  }

  const options: IncludeOptions = includeOptions || {};
  options.attributes = attributes;
  options.where = where;
  options.include = include;

  return options;
}

export async function getFindOptions<T extends Model<T>>(
  entity: ModelType<T>,
  args: any,
  fieldNode,
  customOptions?,
): Promise<FindOptions> {
  const isRaw = !!(customOptions?.group || customOptions?.distinct);
  const options: FindAndCountOptions = getOptions(
    fieldNode.selectionSet.selections,
    entity,
    args.where,
    null,
    null,
    isRaw,
    { distinct: customOptions?.distinct },
  );
  options.limit = args.limit;
  options.offset = args.offset;
  options.subQuery = false;
  options.group = customOptions?.group;
  options.raw = isRaw;
  options.mapToModel = isRaw;
  const order = [];
  if (args.order && args.order.length) {
    for (const orderItem of args.order) {
      await getOrderOptions(entity, orderItem, order);
    }
  }
  options.order = order;
  return options;
}

export async function findAndCountAll<T extends Model<T>>(
  entity: ModelType<T>,
  args: any,
  info,
  customOptions?,
): Promise<{
  rows: (T & Model<unknown, unknown>)[];
  count: number;
}> {
  const fieldNode = info.fieldNodes[0].selectionSet.selections[0];
  return entity.findAndCountAll(await getFindOptions(entity, args, fieldNode, customOptions));
}

export async function findAll<T extends Model<T>>(entity: ModelType<T>, args: any, info, customOptions?): Promise<T[]> {
  const fieldNode = info.fieldNodes[0];
  return entity.findAll(await getFindOptions(entity, args, fieldNode, customOptions));
}

export async function findOne<T extends Model<T>>(entity: ModelType<T>, args: any, info): Promise<T | null> {
  const fieldNode = info.fieldNodes[0];
  return entity.findOne(await getFindOptions(entity, args, fieldNode));
}

export async function getFindOptionsForNested<P extends Model<P>, T extends Model<T>>(
  parentEntityIds: number[],
  parentEntity: ModelType<P>,
  entity: ModelType<T>,
  args: any,
  fieldNode,
): Promise<FindOptions> {
  const options: FindOptions = {};
  options.attributes = ['id'];
  options.where = { id: { [Op.in]: parentEntityIds } };
  options.subQuery = false;
  const includeOptions = {
    model: entity,
    as: Object.values(parentEntity.associations).find(x => x.target === entity).as,
    required: false,
  };
  options.include = [getOptions(fieldNode.selectionSet.selections, entity, args, includeOptions)];
  return options;
}

export async function findAllWithNested<P extends Model<P>, T extends Model<T>>(
  parentEntityIds: number[],
  parentEntity: ModelType<P>,
  entity: ModelType<T>,
  args: any,
  info,
): Promise<T[][]> {
  const fieldNode = info.fieldNodes[0];
  const as = Object.values(parentEntity.associations).find(x => x.target === entity).as;
  return parentEntity
    .findAll(await getFindOptionsForNested(parentEntityIds, parentEntity, entity, args, fieldNode))
    .then(result => parentEntityIds.map(x => result.find(y => y.get('id') === x)[as]));
}
