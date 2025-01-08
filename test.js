import TemplateStringsArray from './src/index.js';
import tag from './src/tag.js';

const shim = TemplateStringsArray(['Hi\n!']);
const tpl = Object`Hi\n!`;
const raw = String.raw`Hi\n!`;

console.assert(shim[0] === tpl[0]);
console.assert(shim.raw[0] !== tpl[0]);
console.assert(shim.raw[0] === raw);

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
