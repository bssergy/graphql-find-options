import { Model } from 'sequelize';
import { ClassType } from './class-type';

export type ModelType<T extends Model<T>> = ClassType<T> & typeof Model;
