import {
  FindAndCountOptions,
  FindOptions,
  IncludeOptions,
  LogicType,
  Model,
  Op,
  fn,
  where as whereFn,
} from 'sequelize';
import { FnContainer } from './decorators/fn-container';
import { getArgumentValue } from './helpers/column-helper';
import { ModelType } from './models/model-type';

async function getOrderOptions(entity, order, orderOptions = [], as = null) {
  for (const field of Object.keys(order)) {
    const argFn = FnContainer.getArgFunc(order.constructor, field);
    const orderItem =
      (argFn && (await argFn(as || entity.options.name.singular))) ||
      (Object.keys(entity.rawAttributes).includes(field) && field);
    if (orderItem) {
      const orderItemOptions = [];
      if (as && !argFn) {
        orderItemOptions.push({ model: entity, as });
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

    getOrderOptions(model, associationArgs, orderOptions, entity.associations[association].as);
  }

  return orderOptions;
}

function getOptions(selections, entity, args, includeOptions) {
  const attributes = selections
    ?.filter(selection => Object.keys(entity.rawAttributes).includes(selection.name.value))
    .map(selection => selection.name.value);

  const where = {};
  if (args) {
    for (const argName of Object.keys(args)) {
      const argFn = FnContainer.getArgFunc(args.constructor, argName);
      if (argFn) {
        if (!where[Op.and]) {
          where[Op.and] = [];
        }
        where[Op.and].push(whereFn(argFn(includeOptions.as), getArgumentValue(args[argName]) as LogicType));
      } else if (argName in entity.rawAttributes) {
        where[argName] = getArgumentValue(args[argName]);
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
      model,
      required: !!associationArgs,
      as: entity.associations[association].as,
    };
    include.push(getOptions(selection?.selectionSet.selections, model, associationArgs, assosiationInclude));
  }

  const options: IncludeOptions = includeOptions || {};
  options.attributes = attributes;
  options.where = where;
  options.include = include;

  return options;
}

export async function getFindOptions<T extends Model<T>>(entity: ModelType<T>, args: any, fieldNode): Promise<FindOptions> {
  const options: FindAndCountOptions = getOptions(fieldNode.selectionSet.selections, entity, args.where, { as: entity.options.name.singular });
  options.limit = args.limit;
  options.offset = args.offset;
  options.subQuery = false;
  const order = [];
  if (args.order && args.order.length) {
    for (const orderItem of args.order) {
      await getOrderOptions(entity, orderItem, order);
    }
  }
  options.order = order;
  return options;
}

export async function findAndCountAll<T extends Model<T>>(entity: ModelType<T>, args: any, info): Promise<{
  rows: (T & Model<unknown, unknown>)[];
  count: number;
}> {
  const fieldNode = info.fieldNodes[0].selectionSet.selections[0];
  return entity.findAndCountAll(await getFindOptions(entity, args, fieldNode));
}

export async function getFindOptionsForNested<P extends Model<P>, T extends Model<T>>(
  parentEntityIds: number[],
  parentEntity: ModelType<P>,
  entity: ModelType<T>,
  args: any,
  fieldNode,
): Promise<FindOptions> {
  const options: FindOptions = {};
  options.attributes = [];
  options.where = { id: { [Op.in]: parentEntityIds } };
  options.subQuery = false;
  options.order = fn('field', `\`${parentEntity.options.name.singular}\`.\`id\``, parentEntityIds);
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
    .then(result => result.map(x => x[as]));
}
