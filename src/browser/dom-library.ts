import * as Errors from '../shared/errors';
import {
  Selector,
  IRect,
  ISelectedOption,
  QueryBuilder,
  SelectOption
} from '../shared/query';
// tslint:disable-next-line:no-var-requires
const jquery = require('jquery') as JQueryStatic;

export class DomLibrary {
  private booleanProps = [
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'compact',
    'complete',
    'controls',
    'declare',
    'defaultchecked',
    'defaultselected',
    'defer',
    'disabled',
    'draggable',
    'ended',
    'formnovalidate',
    'hidden',
    'indeterminate',
    'iscontenteditable',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'nohref',
    'noresize',
    'noshade',
    'novalidate',
    'nowrap',
    'open',
    'paused',
    'pubdate',
    'readonly',
    'required',
    'reversed',
    'scoped',
    'seamless',
    'seeking',
    'selected',
    'spellcheck',
    'truespeed',
    'willvalidate'
  ];

  public select = (
    selector: Selector,
    parent: HTMLElement | null = null,
    query?: QueryBuilder
  ): HTMLElement[] => {
    let value: HTMLElement[] | null = null;
    try {
      value = parent ? jquery(selector, parent).get() : jquery(selector).get();
    } catch (exc) {
      throw new Errors.ArgumentError(
        `The selector '${selector}' is not a valid selector`,
        exc,
        query
      );
    }

    if (!value || !Array.isArray(value)) {
      // istanbul ignore next
      return [];
    }

    return value;
  };

  public selectFirst = (
    selector: Selector,
    parent: HTMLElement | null = null,
    query?: QueryBuilder
  ): HTMLElement => {
    const result = this.select(selector, parent, query);
    if (!result || result.length === 0) {
      throw new Errors.NoSuchElementError(
        `Selector '${selector}' returned no elements`,
        query
      );
    }
    return result[0];
  };

  public selectSingle = (
    selector: Selector,
    parent: HTMLElement | null = null,
    query?: QueryBuilder
  ): HTMLElement => {
    const result = this.select(selector, parent, query);
    if (!result || result.length === 0) {
      throw new Errors.NoSuchElementError(
        `Selector '${selector}' returned no elements`,
        query
      );
    }
    if (result.length === 1) {
      return result[0];
    } else {
      throw new Errors.SelectorError(
        `Selector '${selector}' returned more ` +
          `than one element but expected only one`,
        query
      );
    }
  };

  public scrollIntoView = (element: HTMLElement) => {
    element.scrollIntoView(false);
  };

  public attributeOf = (element: HTMLElement, name: string): string | null => {
    const val: any = (element as any)[name];

    if (typeof val === 'string') {
      return val;
    }

    if (typeof val === 'boolean') {
      return val === true ? 'true' : null;
    }

    const attrVal = this.domAttributeOf(element, name);

    if (typeof attrVal === 'string') {
      return attrVal;
    }

    return null;
  };

  public textOf = (element: HTMLElement): string => {
    return element.innerText || jquery(element).text();
  };

  public cssOf = (element: HTMLElement, cssPropertyName: string): string => {
    return jquery(element).css(cssPropertyName);
  };

  public clientRectOf = (element: HTMLElement): IRect => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + window.pageXOffset,
      y: rect.top + window.pageYOffset,
      // NOTE for cases when elements are hidden use jQuery
      height: rect.height || 0,
      width: rect.width || 0
    };
  };

  public tagNameOf = (element: HTMLElement): string => {
    return element.tagName.toLowerCase();
  };

  public isDisplayed = (element: HTMLElement): boolean => {
    return (
      this.cssOf(element, 'display') !== 'none' &&
      this.cssOf(element, 'visibility') !== 'hidden'
    );
  };

  public isSelected = (element: HTMLElement): boolean => {
    return this.attributeOf(element, 'selected') === 'true';
  };

  public isChecked = (element: HTMLElement): boolean => {
    return this.attributeOf(element, 'checked') === 'true';
  };

  public isEnabled = (element: HTMLElement): boolean => {
    return this.attributeOf(element, 'disabled') !== 'true';
  };

  public isDomElement = (element: any): element is HTMLElement => {
    if (typeof HTMLElement === 'object') {
      // TODO: Test in different browsers?
      return element instanceof HTMLElement;
    } else {
      return (
        element &&
        typeof element === 'object' &&
        'nodeType' in element &&
        element.nodeType === 1 &&
        'nodeName' in element &&
        typeof element.nodeName === 'string'
      );
    }
  };

  public imitateClick = (element: HTMLElement): void => {
    jquery(element).click();
  };

  public imitateSubmit = (element: HTMLElement): void => {
    jquery(element).submit();
  };

  public imitateClear = (element: HTMLElement): void => {
    this.imitateFocus(element);
    const q = jquery(element);
    q.val('');
  };

  public imitateAppendText = (element: HTMLElement, text: string): void => {
    this.imitateFocus(element);
    const q = jquery(element);
    q.val(q.val() + text);
  };

  public selectedOptionsOf = (
    element: HTMLSelectElement,
    query?: QueryBuilder
  ): ISelectedOption[] => {
    if (
      !element ||
      typeof element.tagName !== 'string' ||
      element.tagName.toLowerCase() !== 'select'
    ) {
      throw new Errors.ArgumentError(
        `Expected 'select' element to be target for selection`,
        query
      );
    }

    const q = jquery(element);
    const allOptions = (q.find('option').get() as HTMLOptionElement[])
      .filter(option => this.isSelected(option))
      .map(option => {
        return {
          text: option.text,
          value: option.value
        };
      });

    return allOptions;
  };

  public imitateSelection = (
    element: HTMLSelectElement,
    option: SelectOption | SelectOption[],
    query?: QueryBuilder
  ): void => {
    if (
      !element ||
      typeof element.tagName !== 'string' ||
      element.tagName.toLowerCase() !== 'select'
    ) {
      throw new Errors.ArgumentError(
        `Expected 'select' element to be target for selection`,
        query
      );
    }

    const isMultiple = this.attributeOf(element, 'multiple') === 'true';
    if (!isMultiple && Array.isArray(option)) {
      throw new Errors.ArgumentError(
        `Expected multiple attribute to be set on select when passed multiple options`,
        query
      );
    }

    const q = jquery(element);

    const allOptions = q.find('option').get() as HTMLOptionElement[];

    const {
      optionsByValue,
      optionsByText,
      selectedToUnselect
    } = allOptions.reduceRight(
      (acc, opt) => {
        acc.optionsByText.set(opt.text, opt);
        acc.optionsByValue.set(opt.value, opt);

        if (this.isSelected(opt)) {
          acc.selectedToUnselect.set(opt.value, opt);
        }
        return acc;
      },
      {
        // for searching:
        optionsByValue: new Map<string, HTMLOptionElement>(),
        optionsByText: new Map<string, HTMLOptionElement>(),
        // to unselect previously selected:
        selectedToUnselect: new Map<string, HTMLOptionElement>()
      }
    );

    // at this point selectedToUnselect might contain
    // options that we actually want to leave selected
    // we filter that below:

    const exactToSelect = new Map<string, HTMLOptionElement>();

    const filterOptionsToSelectAndUnselect = (one: SelectOption) => {
      const finder =
        'text' in one
          ? () => optionsByText.get(one.text)
          : () => optionsByValue.get(one.value);

      const found = finder();

      if (!found) {
        throw new Errors.ArgumentError(
          `Option "${'text' in one ? one.text : one.value}" doesn't exist`,
          query
        );
      }

      if (!this.isSelected(found)) {
        exactToSelect.set(found.value, found);
      }

      // exclude option to select from list of options to unselect:
      selectedToUnselect.delete(found.value);
    };

    if (Array.isArray(option)) {
      option.forEach(filterOptionsToSelectAndUnselect);
    } else {
      filterOptionsToSelectAndUnselect(option);
    }

    this.imitateFocus(element);
    if (isMultiple) {
      // select
      jquery(Array.from(exactToSelect.values()))
        .attr('selected', 'selected')
        .each(function changeAndClick() {
          q.change();
          jquery(this).click();
        });
      // unselect
      jquery(Array.from(selectedToUnselect.values())).removeAttr('selected');
    } else {
      // open the select:
      q.click();
      // select
      jquery(Array.from(exactToSelect.values()))
        .attr('selected', 'selected')
        .each(() => {
          q.change();
          q.click();
        });
      // unselect
      jquery(Array.from(selectedToUnselect.values())).removeAttr('selected');
      if (exactToSelect.size === 0 && selectedToUnselect.size === 0) {
        // imitate as if we selected same value
        q.click();
      }
    }
  };

  public imitateSetText = (element: HTMLElement, text: string): void => {
    this.imitateFocus(element);
    const q = jquery(element);
    q.val(text);
    q.blur();
  };

  private imitateFocus = (element: HTMLElement) => {
    if (document.activeElement !== element) {
      jquery(element).focus();
    }
  };

  private domAttributeOf = (
    element: HTMLElement,
    name: string
  ): string | null => {
    const val = jquery(element).attr(name);
    return this.propToString(val);
  };

  private propToString = (val: boolean | string | undefined): string | null => {
    if (this.booleanProps.indexOf(name) >= 0) {
      const valBool = !!val;
      return valBool ? valBool.toString() : null;
    } else if (typeof val === 'string') {
      return val;
    } else {
      return null;
    }
  };
}
