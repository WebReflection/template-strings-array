//@ts-check

const { defineProperty, freeze } = Object;
const { parse, stringify } = JSON;

/** @typedef {Map<string,Chunks>} Chunks */

/** @type {Chunks} */
const chunks = new Map;

/** @type {Map<Chunks,TemplateStringsArray>} */
const templates = new Map;

/** @type {WeakMap<TemplateStringsArray,ReadonlyArray<string>>} */
const raws = new WeakMap;
const re = /\\(?!")/g;

const descriptor = {
  /**
   * @this {TemplateStringsArray}
   * @returns
   */
  get() {
    return raws.get(this) || set(this, freeze(this.map(stringified)));
  }
};

/**
 * @param {Chunks} prev
 * @param {string} value
 * @returns
 */
const add = (prev, value) => {
  const curr = /** @type {Chunks} */(new Map);
  prev.set(value, curr);
  return curr;
};

/**
 * @param {Chunks} chunks
 * @param {string[]} strings
 * @returns
 */
const create = (chunks, strings) => {
  const template = /** @type {TemplateStringsArray} */(
    freeze(defineProperty([...strings], 'raw', descriptor))
  );
  templates.set(chunks, template);
  return template;
};

/**
 * @param {Chunks} prev
 * @param {string} value
 * @returns
 */
const mapped = (prev, value) => prev.get(value) || add(prev, value);

/**
 * @param {TemplateStringsArray} strings
 * @param {ReadonlyArray<string>} raw
 * @returns
 */
const set = (strings, raw) => {
  raws.set(strings, raw);
  return raw;
};

/**
 * @param {string} value
 * @returns
 */
const stringified = value => parse(stringify(value).replace(re, '\\\\'));

/**
 * @param {string[]} strings
 * @returns {TemplateStringsArray}
 */
export default strings => {
  const key = strings.reduce(mapped, chunks);
  return templates.get(key) || create(key, strings);
};
