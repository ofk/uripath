import path from 'path';

import * as uripath from '../src';

const FILE_TESTCASE = [
  '',
  '.',
  'file.ext',
  'FILE.EXT',
  'file.foo',
  'file.foo.ext',
  'file',
  'file.',
  '.file',
  '.ext',
  '.file.ext',
];

const DIRPATH_TESTCASE = [
  '/',
  './',
  '../',
  'baz/',
  '/baz',
  'foo/bar/baz/',
  '/foo/bar/baz/',
  '/foo/bar/baz/qux/..',
  '/foo/bar/baz/../qux',
];

const FILEPATH_TESTCASE = [
  ...DIRPATH_TESTCASE.map((dirpath) => `${dirpath}${dirpath.endsWith('/') ? '' : '/'}file.ext`),
  '/foo/bar/baz/.ext',
];

const URI_PARSED_PAIRS = [
  [
    '/path/dir/file.txt',
    {
      root: '/',
      dir: '/path/dir',
      base: 'file.txt',
      ext: '.txt',
      name: 'file',
    },
  ],
  [
    './dir/file.txt',
    {
      root: '',
      dir: './dir',
      base: 'file.txt',
      ext: '.txt',
      name: 'file',
    },
  ],
  [
    'file:///home/user/dir/file.txt',
    {
      scheme: 'file',
      authority: '',
      root: '/',
      dir: '/home/user/dir',
      base: 'file.txt',
      ext: '.txt',
      name: 'file',
    },
  ],
  [
    'file:///',
    {
      scheme: 'file',
      authority: '',
      root: '/',
      dir: '/',
      base: '',
      ext: '',
      name: '',
    },
  ],
  [
    'file:///C:/path/dir/file.txt',
    {
      scheme: 'file',
      authority: '',
      root: 'C:/',
      dir: 'C:/path/dir',
      base: 'file.txt',
      ext: '.txt',
      name: 'file',
    },
  ],
  [
    'C:/path/dir/file.txt',
    {
      scheme: '',
      authority: null,
      root: 'C:/',
      dir: 'C:/path/dir',
      base: 'file.txt',
      ext: '.txt',
      name: 'file',
    },
  ],
  [
    'C:/',
    {
      scheme: '',
      authority: null,
      root: 'C:/',
      dir: 'C:/',
      base: '',
      ext: '',
      name: '',
    },
  ],
  [
    'http://example.com/path/dir/file.txt',
    {
      scheme: 'http',
      authority: 'example.com',
      root: '/',
      dir: '/path/dir',
      base: 'file.txt',
      ext: '.txt',
      name: 'file',
    },
  ],
  [
    '//example.com/path/dir/file.txt',
    {
      scheme: '',
      authority: 'example.com',
      root: '/',
      dir: '/path/dir',
      base: 'file.txt',
      ext: '.txt',
      name: 'file',
    },
  ],
  [
    'http://example.com',
    {
      scheme: 'http',
      authority: 'example.com',
      root: '',
      dir: '',
      base: '',
      ext: '',
      name: '',
    },
  ],
  [
    'uri://user:pass@example.com:123/one/two.three?q1=a1&q2=a2#body',
    {
      scheme: 'uri',
      authority: 'user:pass@example.com:123',
      path: '/one/two.three',
      query: 'q1=a1&q2=a2',
      fragment: 'body',
      root: '/',
      dir: '/one',
      base: 'two.three',
      ext: '.three',
      name: 'two',
    },
  ],
  [
    'data:,Hello,%20World!',
    {
      scheme: 'data',
      authority: null,
      path: ',Hello, World!',
      query: null,
      fragment: null,
    },
  ],
] satisfies [string, object][];

const ROOTPATH_TESTCASE = ['/', 'C:/', 'file:///', 'file://C:/', '//example.com', '//example.com/'];

describe('parse', () => {
  [...FILE_TESTCASE, ...FILEPATH_TESTCASE, ...DIRPATH_TESTCASE].forEach((arg) => {
    it(`behaves the same as node:path method if given ${JSON.stringify(arg)}`, () => {
      expect(uripath.parse(arg)).toMatchObject(path.parse(arg));
    });
  });

  URI_PARSED_PAIRS.forEach(([uri, parsed]) => {
    it(`returns a parsed result if given ${JSON.stringify(uri)}`, () => {
      expect(uripath.parse(uri)).toMatchObject(parsed);
    });
  });
});

describe('format', () => {
  [...FILE_TESTCASE, ...FILEPATH_TESTCASE, ...DIRPATH_TESTCASE].forEach((arg) => {
    it(`behaves the same as node:path method if given ${JSON.stringify(arg)}`, () => {
      expect(uripath.format(uripath.parse(arg))).toBe(arg);
    });
  });

  URI_PARSED_PAIRS.forEach(([uri, parsed]) => {
    it(`expect an uri if given ${JSON.stringify(parsed)}`, () => {
      expect(uripath.format(parsed)).toBe(uri);
    });
  });
});

describe('basename', () => {
  [...FILE_TESTCASE, ...FILEPATH_TESTCASE, ...DIRPATH_TESTCASE].forEach((arg) => {
    it(`behaves the same as node:path method if given ${JSON.stringify(arg)}`, () => {
      expect(uripath.basename(arg)).toBe(path.basename(arg));
    });
  });

  [...FILE_TESTCASE, ...FILEPATH_TESTCASE].forEach((arg) => {
    it(`behaves the same as node:path method if given ${JSON.stringify(arg)} and ".ext"`, () => {
      expect(uripath.basename(arg, '.ext')).toBe(path.basename(arg, '.ext'));
    });
  });

  ROOTPATH_TESTCASE.forEach((arg) => {
    it(`returns an empty basename if given ${JSON.stringify(arg)}`, () => {
      expect(uripath.basename(arg)).toBe('');
    });
  });
});

describe('dirname', () => {
  [...FILE_TESTCASE, ...FILEPATH_TESTCASE, ...DIRPATH_TESTCASE].forEach((arg) => {
    it(`behaves the same as node:path method if given ${JSON.stringify(arg)}`, () => {
      expect(uripath.dirname(arg)).toBe(path.dirname(arg));
    });
  });

  ROOTPATH_TESTCASE.forEach((arg) => {
    it(`returns a root path if given ${JSON.stringify(arg)}`, () => {
      expect(uripath.dirname(arg)).toBe(arg);
    });
  });
});

describe('extname', () => {
  [...FILE_TESTCASE, ...FILEPATH_TESTCASE, ...DIRPATH_TESTCASE].forEach((arg) => {
    it(`behaves the same as node:path method if given ${JSON.stringify(arg)}`, () => {
      expect(uripath.extname(arg)).toBe(path.extname(arg));
    });
  });

  ROOTPATH_TESTCASE.forEach((arg) => {
    it(`returns an empty extname if given ${JSON.stringify(arg)}`, () => {
      expect(uripath.extname(arg)).toBe('');
    });
  });
});

describe('isAbsolute', () => {
  ['/foo/bar', '/baz/..', 'qux/', '.'].forEach((arg) => {
    it(`behaves the same as node:path method if given ${JSON.stringify(arg)}`, () => {
      expect(uripath.isAbsolute(arg)).toBe(path.isAbsolute(arg));
    });
  });

  ['C:/foo', 'z:/'].forEach((arg) => {
    it(`returns an absolute path if it has a drive letter ${JSON.stringify(arg)}`, () => {
      expect(uripath.isAbsolute(arg)).toBe(true);
    });
  });

  ['http://example.com'].forEach((arg) => {
    it(`returns an absolute path if it has a protocol schema ${JSON.stringify(arg)}`, () => {
      expect(uripath.isAbsolute(arg)).toBe(true);
    });
  });
});

describe('join', () => {
  [
    [''],
    ['.'],
    ['.', '.', '.'],
    ['..', '..', '..'],
    ['foo', 'bar/baz', 'qux'],
    ['foo//', '//bar//baz//', '//qux//'],
    ['foo', '..'],
    ['foo', '..', '..'],
    ['foo', '..', 'bar'],
    ['foo', '..', 'bar', 'baz'],
    ['foo', '..', 'bar', 'baz', '..', 'qux'],
  ].forEach((args) => {
    it(`behaves the same as node:path method if given ${JSON.stringify(args)}`, () => {
      expect(uripath.join(...args)).toEqual(path.join(...args));
    });
  });

  (
    [
      [['c:/foo', 'bar'], 'c:/foo/bar'],
      [['c:/foo/', 'bar'], 'c:/foo/bar'],
      [['c:/foo', '/bar'], 'c:/foo/bar'],
      [['c:/foo/', '/bar'], 'c:/foo/bar'],
      [['d:/foo', '../bar'], 'd:/bar'],
      [['d:/foo', '../../bar'], 'd:/bar'],
      [['d:/foo/', '../bar'], 'd:/bar'],
      [['d:/foo/', '../../bar'], 'd:/bar'],
    ] satisfies [string[], string][]
  ).forEach(([args, result]) => {
    it(`joins ${JSON.stringify(args)} that has a drive letter`, () => {
      expect(uripath.join(...args)).toEqual(result);
    });
  });

  (
    [
      [['http://example.com', 'file'], 'http://example.com/file'],
      [['http://example.com/', 'file'], 'http://example.com/file'],
      [['http://example.com', '/file'], 'http://example.com/file'],
      [['http://example.com/', '/file'], 'http://example.com/file'],
      [['http://example.com/dir', 'file'], 'http://example.com/dir/file'],
      [['http://example.com/dir/', 'file'], 'http://example.com/dir/file'],
      [['http://example.com/dir', '/file'], 'http://example.com/dir/file'],
      [['http://example.com/dir/', '/file'], 'http://example.com/dir/file'],
      [['http://example.com/dir', '../file'], 'http://example.com/file'],
      [['http://example.com/dir', '../../file'], 'http://example.com/file'],
      [['http://example.com/dir/', '../file'], 'http://example.com/file'],
      [['http://example.com/dir/', '../../file'], 'http://example.com/file'],
    ] satisfies [string[], string][]
  ).forEach(([args, result]) => {
    it(`joins ${JSON.stringify(args)} that has a protocol schema`, () => {
      expect(uripath.join(...args)).toEqual(result);
    });
  });
});

describe('normalize', () => {
  [
    ...FILE_TESTCASE,
    ...FILEPATH_TESTCASE,
    ...DIRPATH_TESTCASE,
    'foo/../../bar',
    '/foo/../../bar',
    'foo/./bar//baz///qux/..',
    '/foo/./bar/././baz',
    '/foo/../bar/baz/qux/../../quux/.',
    './foo',
    '.././foo/',
  ].forEach((arg) => {
    it(`behaves the same as node:path method if given ${JSON.stringify(arg)}`, () => {
      expect(uripath.normalize(arg)).toEqual(path.normalize(arg));
    });
  });

  (
    [
      ['c:/dir//file', 'c:/dir/file'],
      ['c:/../dir/../file', 'c:/file'],
      ['//example.com//dir//file', '//example.com/dir/file'],
      ['http://example.com/../dir/../file', 'http://example.com/file'],
    ] satisfies [string, string][]
  ).forEach(([arg, result]) => {
    it(`returns normalized ${JSON.stringify(arg)}`, () => {
      expect(uripath.normalize(arg)).toEqual(result);
    });
  });
});

describe('relative', () => {
  (
    [
      ['', ''],
      ['', 'file'],
      ['dir', 'file'],
      ['/', '/file'],
      ['/file', '/file'],
      ['/dir', '/file'],
      ['/dir', '/dir/file'],
      ['/dir/', '/dir/file'],
      ['/dir', '/dir/file/'],
      ['/dir/', '/dir/file/'],
      ['/dir/file', '/dir'],
      ['/dir/file/', '/dir'],
      ['/dir/file', '/dir/'],
      ['/dir/file/', '/dir/'],
      ['/dir/hoge/foo/bar/file', '/dir/hoge/baz/qux/file'],
      ['./', './file'],
      ['./dir', './file'],
    ] satisfies [string, string][]
  ).forEach((args) => {
    it(`behaves the same as node:path method if given ${JSON.stringify(args)}`, () => {
      expect(uripath.relative(...args)).toEqual(path.relative(...args));
    });
  });

  (
    [
      [['c:/dir', 'c:/dir/file'], 'file'],
      [['http://example.com/dir', 'http://example.com/dir/file'], 'file'],
      [['c:/dir', 'd:/dir/file'], 'd:/dir/file'],
      [['c:/dir', 'http://example.org/dir/file'], 'http://example.org/dir/file'],
      [['http://example.com/dir', 'http://example.org/dir/file'], 'http://example.org/dir/file'],
    ] satisfies [[string, string], string][]
  ).forEach(([args, result]) => {
    it(`returns relative path of ${JSON.stringify(args)}`, () => {
      expect(uripath.relative(...args)).toEqual(result);
    });
  });
});

describe('resolve', () => {
  [
    ['/foo/bar', 'baz', 'qux'],
    ['/foo/bar', './baz', '../qux'],
    ['/foo/bar', '/baz', 'qux'],
    ['/foo/bar', '/baz', '../qux'],
  ].forEach((args) => {
    it(`behaves the same as node:path method if given ${JSON.stringify(args)}`, () => {
      expect(uripath.resolve(...args)).toEqual(path.resolve(...args));
    });
  });

  (
    [
      [['foo', 'bar'], 'foo/bar'],
      [['../foo', '../bar'], '../bar'],
      [['c:/foo/bar', 'baz/qux', 'quux'], 'c:/foo/bar/baz/qux/quux'],
      [['c:/foo/bar', '/baz', 'qux'], '/baz/qux'],
      [['c:/foo/bar', 'd:/baz', 'qux'], 'd:/baz/qux'],
      [['c:/foo/bar', 'c:/foo/hoge/piyo'], 'c:/foo/hoge/piyo'],
      [['/foo/bar', 'http://example.com/dir', 'file'], 'http://example.com/dir/file'],
      [['/foo/bar', 'http://example.com/dir', '/file'], 'http://example.com/file'],
      [
        ['http://example.com/foo/bar', 'http://example.com/foo/hoge/piyo'],
        'http://example.com/foo/hoge/piyo',
      ],
      [['file:///', '/foo/bar'], 'file:///foo/bar'],
      [['file:///', 'c:/foo/bar'], 'file:///c:/foo/bar'],
      [['file:///', 'http://example.com/dir'], 'http://example.com/dir'],
    ] satisfies [string[], string][]
  ).forEach(([args, result]) => {
    it(`resolves ${JSON.stringify(args)}`, () => {
      expect(uripath.resolve(...args)).toEqual(result);
    });
  });
});
