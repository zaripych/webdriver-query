// tslint:disable-next-line:no-var-requires
const escapeRegExpFunc = require('escape-string-regexp');

export const escapeRegExp = (value: string): string => {
  return escapeRegExpFunc(value);
};
