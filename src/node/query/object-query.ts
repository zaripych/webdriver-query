import { PromiseLikeQuery } from '../query'
import { ISize, ILocation, IRect } from '../../shared'

export class ObjectQuery<T extends object = {}> extends PromiseLikeQuery<T> {}

export type SizeQuery = ObjectQuery<ISize>

export type LocationQuery = ObjectQuery<ILocation>

export type RectQuery = ObjectQuery<IRect>
