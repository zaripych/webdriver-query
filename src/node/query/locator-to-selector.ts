import * as selenium from 'selenium-webdriver';
import { ArgumentError } from '../../shared/errors';

interface ILocatorDetailsAccess {
  using: string;
  value: string;
}

export const isSeleniumLocator = (locator: any): locator is selenium.By => {
  return (
    typeof locator === 'object' && 'using' in locator && 'value' in locator
  );
};

export const locatorToSelector = (locator: selenium.By): string => {
  if (
    typeof locator !== 'object' ||
    !('using' in locator) ||
    !('value' in locator)
  ) {
    throw new ArgumentError(
      `Expected 'using' and 'value' fields to exist in locator to convert it`
    );
  }
  const details = locator as ILocatorDetailsAccess;
  if (details.using === 'css selector') {
    return details.value;
  } else {
    throw new ArgumentError(
      `Cannot convert ${locator} to a CSS selector, custom locators are not supported`
    );
  }
};
