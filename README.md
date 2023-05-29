# uripath

uripath provides utilities for node:path compatible uri operation.

## Install

```sh
npm install uripath
```

## Usage

```jsx
const uripath = require('uripath');

console.log(uripath.join('http://example.com/dir/', '../../file'));
// => 'http://example.com/file'
```
