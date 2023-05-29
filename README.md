# @ofk/uripath

uripath provides utilities for node:path compatible uri operation.

## Install

```sh
npm install @ofk/uripath
```

## Usage

```jsx
const uripath = require('@ofk/uripath');

console.log(uripath.join('http://example.com/dir/', '../../file'));
// => 'http://example.com/file'
```
