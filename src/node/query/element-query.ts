import * as selenium from 'selenium-webdriver';
import {
  IQueryBuildingBlock,
  StringQuery,
  NullableStringQuery,
  ConditionQuery,
  LocationQuery,
  SizeQuery,
  AnyQuery,
  PromiseLikeQueryNoExecute
} from '../query';

import {
  QueryBuilder,
  IElementQuery,
  AnyResultType,
  Selector,
  IPromise,
  ISelectedOption,
  SelectOption
} from '../../shared/query';

import { locatorToSelector, isSeleniumLocator } from './locator-to-selector';

import { ArrayQuery } from './array-query';
import { ObjectQuery, RectQuery } from './object-query';

export class ElementQuery<
  TElement = selenium.WebElement,
  TElementPromise extends IPromise<any> = selenium.WebElementPromise
> extends PromiseLikeQueryNoExecute<TElement, TElementPromise>
  implements IElementQuery {
  constructor(buildInfo: IQueryBuildingBlock) {
    super(buildInfo);
  }

  public perform(): TElementPromise {
    return (new selenium.WebElementPromise(
      this.executor.driver as selenium.WebDriver,
      this.executor.perform<selenium.WebElement>(this.query)
    ) as any) as TElementPromise;
  }

  public findElements(
    selector: Selector | selenium.By
  ): ArrayQuery<TElement, ElementQuery<TElement, TElementPromise>> {
    if (isSeleniumLocator(selector)) {
      return this.findElements(locatorToSelector(selector as selenium.By));
    }
    const query = this.appendCall('findElements', selector);
    return new ArrayQuery(
      this.build(query),
      build => new ElementQuery<TElement, TElementPromise>(build)
    );
  }

  public findElement(
    selector: Selector | selenium.By
  ): ElementQuery<TElement, TElementPromise> {
    if (isSeleniumLocator(selector)) {
      return this.findElement(locatorToSelector(selector as selenium.By));
    }
    const query = this.appendCall('findElement', selector);
    return new ElementQuery<TElement, TElementPromise>(this.build(query));
  }

  public exists(): ConditionQuery {
    const query = this.appendCall('exists');
    return new ConditionQuery(this.build(query));
  }

  public scrollIntoView(): ElementQuery<TElement, TElementPromise> {
    const query = this.appendCall('scrollIntoView');
    return new ElementQuery<TElement, TElementPromise>(this.build(query));
  }

  public getAttribute(name: string): NullableStringQuery {
    const query = this.appendCall('getAttribute', name);
    return new NullableStringQuery(this.build(query));
  }

  public getText(): StringQuery {
    const query = this.appendCall('getText');
    return new StringQuery(this.build(query));
  }

  public getCssValue(cssStyleProperty: string): StringQuery {
    const query = this.appendCall('getCssValue', cssStyleProperty);
    return new StringQuery(this.build(query));
  }

  public getRect(): RectQuery {
    const query = this.appendCall('getRect');
    return new ObjectQuery(this.build(query));
  }

  public getLocation(): LocationQuery {
    const query = this.appendCall('getLocation');
    return new ObjectQuery(this.build(query));
  }

  public getSize(): SizeQuery {
    const query = this.appendCall('getSize');
    return new ObjectQuery(this.build(query));
  }

  public getTagName(): StringQuery {
    const query = this.appendCall('getTagName');
    return new StringQuery(this.build(query));
  }

  public isDisplayed(): ConditionQuery {
    const query = this.appendCall('isDisplayed');
    return new ConditionQuery(this.build(query));
  }

  public isEnabled(): ConditionQuery {
    const query = this.appendCall('isEnabled');
    return new ConditionQuery(this.build(query));
  }

  public isSelected(): ConditionQuery {
    const query = this.appendCall('isSelected');
    return new ConditionQuery(this.build(query));
  }

  public isChecked(): ConditionQuery {
    const query = this.appendCall('isChecked');
    return new ConditionQuery(this.build(query));
  }

  public execute<T extends AnyResultType>(
    script: string | ((element: HTMLElement, ...args: any[]) => T),
    ...args: any[]
  ): AnyQuery {
    const query = this.query.appendCall('execute', ...[script, ...args]);
    return new AnyQuery(this.build(query));
  }

  public imitateClick(): ElementQuery<TElement, TElementPromise> {
    const query = this.appendCall('imitateClick');
    return new ElementQuery(this.build(query));
  }

  public imitateSubmit(): ElementQuery<TElement, TElementPromise> {
    const query = this.appendCall('imitateSubmit');
    return new ElementQuery(this.build(query));
  }

  public imitateClear(): ElementQuery<TElement, TElementPromise> {
    const query = this.appendCall('imitateClear');
    return new ElementQuery(this.build(query));
  }

  public imitateAppendText(
    text: string
  ): ElementQuery<TElement, TElementPromise> {
    const query = this.appendCall('imitateAppendText', text);
    return new ElementQuery(this.build(query));
  }

  public imitateSetText(text: string): ElementQuery<TElement, TElementPromise> {
    const query = this.appendCall('imitateSetText', text);
    return new ElementQuery(this.build(query));
  }

  public imitateSelection(
    options: SelectOption | SelectOption[]
  ): ElementQuery<TElement, TElementPromise> {
    const query = this.appendCall('imitateSelection', options);
    return new ElementQuery(this.build(query));
  }

  public getSelectedOptions(): ArrayQuery<
    ISelectedOption,
    ObjectQuery<ISelectedOption>
  > {
    const query = this.appendCall('getSelectedOptions');
    return new ArrayQuery(
      this.build(query),
      block => new ObjectQuery<ISelectedOption>(block)
    );
  }

  public innerHTML(): StringQuery {
    const query = this.appendCall('innerHTML');
    return new StringQuery(this.build(query));
  }

  public class(): StringQuery {
    const query = this.appendCall('class');
    return new StringQuery(this.build(query));
  }

  private appendCall(
    method: keyof IElementQuery,
    ...args: Array<{}>
  ): QueryBuilder {
    return this.query.appendCall(method, ...args);
  }
}
