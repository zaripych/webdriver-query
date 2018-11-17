export declare type Selector = string;

export interface ILocation {
  x: number;
  y: number;
}

export interface ISize {
  width: number;
  height: number;
}

export interface IRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ISelectedOption {
  value: string;
  text: string;
}

export type SelectOption =
  | {
      value: string;
    }
  | {
      text: string;
    };

export interface IConditionQuery {
  not(): IConditionQuery;
  whenRejected(value: boolean): IConditionQuery;
}

export interface INumberConversionOptions {
  float?: boolean;
  radix?: number;
}

export interface IStringQuery {
  length(): INumberQuery;
  toNumber(options?: INumberConversionOptions): INumberQuery;
  equals(value: string): IConditionQuery;
  matches(expression: RegExp | string): IConditionQuery;
  notEmpty(): IConditionQuery;
  whenRejected(value: string): IStringQuery;
  whenRejectedOrFalsy(value: string): IStringQuery;
}

export interface INullableStringQuery {
  length(): INumberQuery;
  toNumber(options?: INumberConversionOptions): INumberQuery;
  equals(value: string | null): IConditionQuery;
  matches(expression: RegExp | string): IConditionQuery;
  notEmptyOrNull(): IConditionQuery;
  whenRejected(value: string): INullableStringQuery;
  whenRejectedOrFalsy(value: string): IStringQuery;
}

export interface INumberQuery {
  equals(value: number): IConditionQuery;
  greaterThan(value: number): IConditionQuery;
  lessThan(value: number): IConditionQuery;
  greaterThanOrEqual(value: number): IConditionQuery;
  lessThanOrEqual(value: number): IConditionQuery;
  whenRejected(value: number): INumberQuery;
}

export interface IRectQuery {}

export interface IPointQuery {}

export interface ISizeQuery {}

export interface IObjectQuery {}

export interface IArrayQuery<T> {
  count(): INumberQuery;

  at(index: number): T;

  filter(condition: (q: T) => IConditionQuery): this;

  first(condition: (q: T) => IConditionQuery): T;

  indexOf(condition: (q: T) => IConditionQuery): INumberQuery;
}

export interface IMultipleElementsQuery extends IArrayQuery<IElementQuery> {}

export interface IAnyQuery {
  asString(): IStringQuery;

  asObject(): IObjectQuery;

  asElement(): IElementQuery;

  asBoolean(): IConditionQuery;

  truthy(): IConditionQuery;
}

export type AnyResultType =
  | void
  | boolean
  | number
  | string
  | object
  | HTMLElement
  | undefined
  | null;

export interface IElementQueryDriver {
  execute<T extends AnyResultType>(
    script: string | ((element: HTMLElement, ...args: any[]) => T),
    ...args: any[]
  ): IAnyQuery;

  findElements(selector: Selector): IMultipleElementsQuery;

  findElement(selector: Selector): IElementQuery;

  getAttribute(name: string): INullableStringQuery;

  getText(): IStringQuery;

  getCssValue(cssStyleProperty: string): IStringQuery;

  getRect(): IRectQuery;

  getLocation(): IPointQuery;

  getSize(): ISizeQuery;

  getTagName(): IStringQuery;

  isDisplayed(): IConditionQuery;

  isEnabled(): IConditionQuery;

  isSelected(): IConditionQuery;

  isChecked(): IConditionQuery;
}

export interface IElementQueryAdditionalAPI {
  scrollIntoView(): IElementQuery;

  exists(): IConditionQuery;

  innerHTML(): IStringQuery;

  class(): IStringQuery;

  imitateClear(): IElementQuery;

  imitateAppendText(text: string): IElementQuery;

  imitateSetText(text: string): IElementQuery;

  imitateClick(): IElementQuery;

  imitateSubmit(): IElementQuery;

  getSelectedOptions(): IArrayQuery<IObjectQuery>;

  imitateSelection(options: SelectOption): IElementQuery;
}

export interface IElementQuery
  extends IElementQueryAdditionalAPI,
    IElementQueryDriver {}

export type IOneOfQueries =
  | IElementQuery
  | IMultipleElementsQuery
  | IConditionQuery
  | IStringQuery
  | INullableStringQuery
  | INumberQuery
  | IAnyQuery
  | IObjectQuery;

export interface IQueryDriver {
  execute<T extends AnyResultType>(
    script: string | ((...args: any[]) => T),
    ...args: any[]
  ): IAnyQuery;

  findElements(selector: Selector): IMultipleElementsQuery;

  findElement(selector: Selector): IElementQuery;

  batch(subQueries: ((q: this) => {})): IObjectQuery;
}

export interface IConfig {
  waitTimeoutMilliseconds: number;
  minPollPeriodMilliseconds: number;
  pollTimes: number;

  shouldLog: boolean;

  // the above are accessible by their property names
  [key: string]: boolean | number | undefined;
}

export interface IInstanceWaitOptions {
  timeout?: number;
  pollPeriod?: number;
}
