import TemplateStringsArray from './src/index.js';
import tag from './src/tag.js';

const shim = TemplateStringsArray(['Hi"\x01\\"!']);
const tpl = Object`Hi"\x01\\"!`;
const raw = String.raw`Hi"\x01\\"!`;

// console.log(shim.raw.join(''), raw);

console.assert(shim[0] === tpl[0]);
console.assert(shim.raw[0] !== tpl[0]);
console.assert(eval(`'${shim.raw.join('')}'`) === eval(`'${raw}'`));

console.assert(
  TemplateStringsArray(['a']) ===
  TemplateStringsArray(['a'])
);

console.assert(
  TemplateStringsArray(['a', 'b']) ===
  TemplateStringsArray(['a', 'b'])
);

const asTag = tag((template, ...values) => ({ template, values }));
const result = asTag`a${'b'}c`;
console.assert(result.template.join('-') === 'a-c');
console.assert(result.values.join('-') === 'b');

console.assert(TemplateStringsArray([]) === TemplateStringsArray([]));
