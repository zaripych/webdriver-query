import { BaseQuery } from './base-query';
import { IObjectQuery, ILocation, ISize, IRect } from '../../shared/query';

export class ObjectQuery<T extends object = {}> extends BaseQuery<T>
  implements IObjectQuery {}

export type LocationQuery = ObjectQuery<ILocation>;

export type SizeQuery = ObjectQuery<ISize>;

export type RectQuery = ObjectQuery<IRect>;
