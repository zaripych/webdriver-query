import {
  IElementQuery,
  QueryBuilder,
  Selector,
  AnyResultType,
  ISelectedOption,
  SelectOption
} from '../../shared/query';
import * as Errors from '../../shared/errors';
import { BaseQuery } from './base-query';
import {
  ArrayQuery,
  createArrayQueryForSingleElementQuery,
  createArrayQuery
} from './array-query';
import { NullableStringQuery } from './nullable-string-query';
import { StringQuery } from './string-query';
import { ConditionQuery } from './condition-query';
import { AnyQuery } from './any-query';
import { evaluate } from './evaluate';
import {
  LocationQuery,
  SizeQuery,
  ObjectQuery,
  RectQuery
} from './object-query';

export class ElementQuery extends BaseQuery<HTMLElement>
  implements IElementQuery {
  public findElements(
    selector: Selector
  ): ArrayQuery<HTMLElement, ElementQuery> {
    const query = this.appendCall('findElements', selector);
    return createArrayQueryForSingleElementQuery(
      this,
      this.build(() => {
        return this.perform().then(e =>
          this.library.select(selector, e, query)
        );
      }, query)
    );
  }

  public findElement(selector: Selector): ElementQuery {
    const query = this.appendCall('findElement', selector);
    return new ElementQuery(
      this.build(() => {
        return this.perform().then(e => {
          return this.library.selectFirst(selector, e, query);
        });
      }, query)
    );
  }

  public exists(): ConditionQuery {
    const query = this.appendCall('exists');
    return new ConditionQuery(
      this.build(() => {
        return this.perform()
          .then(() => {
            return true;
          })
          .catch(err => {
            if (err instanceof Errors.NoSuchElementError) {
              return Promise.resolve(false);
            }
            return Promise.reject(err);
          });
      }, query)
    );
  }

  public scrollIntoView(): ElementQuery {
    const query = this.appendCall('scrollIntoView');
    return new ElementQuery(
      this.build(() => {
        return this.perform().then(e => {
          this.library.scrollIntoView(e);
          return e;
        });
      }, query)
    );
  }

  public getAttribute(name: string): NullableStringQuery {
    const query = this.appendCall('getAttribute', name);
    return new NullableStringQuery(
      this.build(() => {
        return this.perform().then(e => this.library.attributeOf(e, name));
      }, query)
    );
  }

  public getText(): StringQuery {
    const query = this.appendCall('getText');
    return new StringQuery(
      this.build(() => {
        return this.perform().then(
          e => (this.library.isDisplayed(e) ? this.library.textOf(e) : '')
        );
      }, query)
    );
  }

  public getCssValue(cssStyleProperty: string): StringQuery {
    const query = this.appendCall('getCssValue', cssStyleProperty);
    return new StringQuery(
      this.build(() => {
        return this.perform().then(e =>
          this.library.cssOf(e, cssStyleProperty)
        );
      }, query)
    );
  }

  public getRect(): RectQuery {
    const query = this.appendCall('getRect');
    return new ObjectQuery(
      this.build(() => {
        return this.perform().then(e => {
          const rect = this.library.clientRectOf(e);
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          };
        });
      }, query)
    );
  }

  public getLocation(): LocationQuery {
    const query = this.appendCall('getLocation');
    return new ObjectQuery(
      this.build(() => {
        return this.perform().then(e => {
          const rect = this.library.clientRectOf(e);
          return {
            x: rect.x,
            y: rect.y
          };
        });
      }, query)
    );
  }

  public getSize(): SizeQuery {
    const query = this.appendCall('getSize');
    return new ObjectQuery(
      this.build(() => {
        return this.perform().then(e => {
          const rect = this.library.clientRectOf(e);
          return {
            width: rect.width,
            height: rect.height
          };
        });
      }, query)
    );
  }

  public getTagName(): StringQuery {
    const query = this.appendCall('getTagName');
    return new StringQuery(
      this.build(() => {
        return this.perform().then(e => this.library.tagNameOf(e));
      }, query)
    );
  }

  public isDisplayed(): ConditionQuery {
    const query = this.appendCall('isDisplayed');
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(e => this.library.isDisplayed(e));
      }, query)
    );
  }

  public isEnabled(): ConditionQuery {
    const query = this.appendCall('isEnabled');
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(e => this.library.isEnabled(e));
      }, query)
    );
  }

  public isSelected(): ConditionQuery {
    const query = this.appendCall('isSelected');
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(e => this.library.isSelected(e));
      }, query)
    );
  }

  public isChecked(): ConditionQuery {
    const query = this.appendCall('isChecked');
    return new ConditionQuery(
      this.build(() => {
        return this.perform().then(e => this.library.isChecked(e));
      }, query)
    );
  }

  public execute<T extends AnyResultType>(
    script: string | ((element: HTMLElement, ...args: any[]) => T),
    ...args: any[]
  ): AnyQuery {
    const query = this.appendCall('execute', ...[script, ...args]);
    return new AnyQuery(
      this.build(() => {
        return this.perform().then(e => {
          return evaluate(script, ...[e, ...args]);
        });
      }, query)
    );
  }

  public imitateClick(): ElementQuery {
    const query = this.appendCall('imitateClick');
    return new ElementQuery(
      this.build(() => {
        return this.perform().then(e => {
          this.library.imitateClick(e);
          return e;
        });
      }, query)
    );
  }

  public imitateSubmit(): ElementQuery {
    const query = this.appendCall('imitateSubmit');
    return new ElementQuery(
      this.build(() => {
        return this.perform().then(e => {
          this.library.imitateSubmit(e);
          return e;
        });
      }, query)
    );
  }

  public imitateClear(): ElementQuery {
    const query = this.appendCall('imitateClear');
    return new ElementQuery(
      this.build(() => {
        return this.perform().then(e => {
          this.library.imitateClear(e);
          return e;
        });
      }, query)
    );
  }

  public imitateAppendText(text: string): ElementQuery {
    const query = this.appendCall('imitateAppendText', text);
    return new ElementQuery(
      this.build(() => {
        return this.perform().then(e => {
          this.library.imitateAppendText(e, text);
          return e;
        });
      }, query)
    );
  }

  public imitateSetText(text: string): ElementQuery {
    const query = this.appendCall('imitateSetText', text);
    return new ElementQuery(
      this.build(() => {
        return this.perform().then(e => {
          this.library.imitateSetText(e, text);
          return e;
        });
      }, query)
    );
  }

  public imitateSelection(
    options: SelectOption | SelectOption[]
  ): ElementQuery {
    const query = this.appendCall('imitateSelection');
    return new ElementQuery(
      this.build(() => {
        return this.perform().then(e => {
          this.library.imitateSelection(e as HTMLSelectElement, options);
          return e;
        });
      }, query)
    );
  }

  public getSelectedOptions(): ArrayQuery<
    ISelectedOption,
    ObjectQuery<ISelectedOption>
  > {
    const query = this.appendCall('getSelectedOptions');
    return createArrayQuery<ObjectQuery<ISelectedOption>>(
      this.build(() => {
        return this.perform().then(e => {
          return this.library.selectedOptionsOf(e as HTMLSelectElement, query);
        });
      }, query),
      block => new ObjectQuery<ISelectedOption>(block)
    );
  }

  public innerHTML(): StringQuery {
    const query = this.appendCall('innerHTML');
    return new StringQuery(
      this.build(() => {
        return this.perform().then(e => e.innerHTML);
      }, query)
    );
  }

  public class(): StringQuery {
    const query = this.appendCall('class');
    return new StringQuery(
      this.build(() => {
        return this.perform().then(e => e.className);
      }, query)
    );
  }

  private appendCall(
    name: keyof IElementQuery,
    ...args: Array<{}>
  ): QueryBuilder {
    return this.query.appendCall(name, ...args);
  }
}
