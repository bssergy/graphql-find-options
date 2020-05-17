import { PlainWhere } from './plain-where';

export interface PlainWhereOptions {
  eq?: string | number | Date;
  lt?: string | number | Date;
  gt?: string | number | Date;
  between?: string | number | Date;
  not?: string | number | Date;
  like?: string;
  and?: PlainWhere[];
  or?: PlainWhere[];
}
