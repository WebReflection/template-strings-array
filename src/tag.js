//@ts-check

import asTemplateStringsArray from './index.js';

/**
 * @template T
 * @param {(template:TemplateStringsArray, ...values:any[]) => T} fn
 * @returns {(template:string[], ...values:any[]) => T}
 */
export default fn => (template, ...values) => fn(
  asTemplateStringsArray(template),
  ...values
);
