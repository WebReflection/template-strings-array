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

## What's so special about this module?

It's never been easier to use workers or shared workers these days but template literals tags are one of those things that won't survive a `postMessage` roundtrip.

It's not about throwing errors, these silently work, it's rather about having the same [template literals' tag features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates) that allows, when useful or needed, caching operations over complex template/values parsing.

As example, using `uhtml` from a worker (see [coincident](https://github.com/WebReflection/coincident#readme)) works wonderfully and yet every single time the same static parts are sent to the main thread, *uhtml* inevitably re-parse the same thing over and over because the received template argument won't ever be the same.

On top of that, using [SQLite in a Shared/Worker](https://github.com/WebReflection/sql.js#readme) and tags might also benefit from this orchestration, so that long query and complex statements can be also cached on demand.

There are various attempts at fixing the uniqueness of an array of strings out there but AFAIK none of these attempts does the following:

  * create a frozen *template* with a read-only `raw` property, simulating 100% what a real *template* reference looks like by specs
  * have a lazy `raw` read-only accessor that is computed once accessed, if ever, and never again, keeping the *RAM* lower as the `raw` property is very rarely used yet it's defined in specs
  * reduce the amount of concatenated strings: each *chunk* of the array of strings will get its own *Map* reference via *key* so that `a${b}c` and `a${c}d` won't store `a-c` and `a-d` as unique entity but `a` and both `c` and `d` as nested derived chunks. This might not reduce memory consumption but it should play fairly well in terms of both performance and, on the long run, be nicer on RAM too by storing only parts that are different, not entire strings each time as other projects do. Last, but not least, the current logic is also safer than other naive approaches, simply because joining a string won't necessarily produce a unique string after and one needs to be more careful about it, and for very little perf gain, over something that was born to be async and non-blocking (hence raw *ms* to retrieve identities should never be the real bottleneck)

That being said, if you think this module is overkill, or not performing exceptionally well for your use case, here a conversion hint that might do the trick by exploiting joined strings grouped by `length` to avoid collisions with cases such as `['a', 'b']` and `['a,b']` or similar:

```js
const store = {};
const asTemplate = strings => {
  const { length } = strings;
  const joined = strings.join(',');
  const map = store[length] || (store[length] = new Map);
  let result = map.get(joined);
  if (!result) {
    // ⚠️ warning: no `raw` accessor defined in here
    result = Object.freeze([...strings]);
    map.set(joined, result);
  }
  return result;
};
```
