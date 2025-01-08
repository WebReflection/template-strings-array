# template-strings-array

A fast and efficient way to map arrays of strings as templates.

```js
import asTemplateStringsArray from 'template-strings-array';
import { exports } from 'accordant/shared-worker';

// simply override the template arguments
// equivalent of `import tag from "template-strings-array/tag"`
const tag = fn => (template, ...values) => fn(
  asTemplateStringsArray(template),
  ...values
);

// basic made-up example for SQLite in Shared/Worker
const statements = new Map;
const sql = tag(async (template, ...values) => {
  // smart cache for prepared statements
  if (!statements.has(template))
    statements.set(template, db.prepare(template.join('?')));
  return statements.get(template).execute(values);
});

// exposed as remote shared/worker utility
// @see https://github.com/WebReflection/accordant#readme
exports({ sql });
// i.e. -> await worker.sql`SELECT * FROM table WHERE id = ${id}`
```
