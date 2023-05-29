interface ParsedURI {
  scheme: string;
  authority: string | null;
  path: string;
  query: string | null;
  fragment: string | null;
}

function parseURI(uri: string): ParsedURI {
  const mUri = /^(?:(\w{2,}):)?(?:\/\/([^/]*))?(.*?)(?:\?(.*?))?(?:#(.*?))?$/.exec(uri);
  if (!mUri) throw new Error(`Invalid URI: ${uri}`);
  return {
    scheme: mUri[1] ?? '',
    authority: mUri[2] ?? null,
    path: decodeURIComponent(mUri[3] ?? ''),
    query: mUri[4] != null ? decodeURIComponent(mUri[4]) : null,
    fragment: mUri[5] != null ? decodeURIComponent(mUri[5]) : null,
  };
}

function encodeURIRegExp(str: string, reg: RegExp): string {
  return str.replace(reg, encodeURIComponent);
}

function formatURI({ scheme, authority, path = '', query, fragment }: Partial<ParsedURI>): string {
  return (
    (scheme ? `${scheme}:` : '') +
    (authority != null ? `//${authority}${path && !path.startsWith('/') ? '/' : ''}` : '') +
    encodeURIRegExp(path, /[^$-/:;=@[\]_]+/g) +
    (query != null ? `?${encodeURIRegExp(query, /[^$-/:;=?@[-`{|}]+/g)}` : '') +
    (fragment != null ? `#${encodeURIRegExp(fragment, /[^#-/:;=?@[-_{|}]+/g)}` : '')
  );
}

interface ParsedPath {
  root: string;
  dir: string;
  base: string;
  ext: string;
  name: string;
}

function parsePath(path: string): ParsedPath {
  const mRoot = /^(?:\/?((?:\w:)?\/))/.exec(path);
  const root = mRoot?.[1] ?? '';
  const rest = mRoot ? path.slice(mRoot[0].length) : path;
  const mBase = /\/?([^/]*)\/?$/.exec(rest);
  const base = mBase?.[1] ?? '';
  const mExt = /\.[^.]*$/.exec(base);
  const ext = mExt && mExt[0].length !== base.length && base !== '..' ? mExt[0] : '';
  return {
    root,
    dir: `${root}${mBase ? rest.slice(0, -mBase[0].length) : rest}`,
    base,
    ext,
    name: ext ? base.slice(0, -ext.length) : base,
  };
}

function formatPath({ root, dir, base, ext = '', name = '' }: Partial<ParsedPath>): string {
  const dirStr = dir || root;
  const baseStr = base || name + ext;
  if (!dirStr) {
    return baseStr;
  }
  if (dirStr === root) {
    return dirStr + baseStr;
  }
  return `${dirStr}/${baseStr}`;
}

export interface ParsedURIPath extends ParsedURI, ParsedPath {}

export function parse(uri: string): ParsedURIPath {
  const parsedUri = parseURI(uri);
  return {
    ...parsedUri,
    ...parsePath(parsedUri.path),
  };
}

export function format({
  path,
  root,
  dir,
  base,
  ext,
  name,
  ...rest
}: Partial<ParsedURIPath>): string {
  return formatURI({
    ...rest,
    path: path || formatPath({ root, dir, base, ext, name }),
  });
}

export function basename(uri: string, ext?: string): string {
  const parsed = parse(uri);
  if (ext && parsed.ext === ext) return parsed.name;
  if (ext && !parsed.dir && parsed.base === ext) return '';
  return parsed.base;
}

export function dirname(uri: string): string {
  const { scheme, authority, path, root } = parse(uri);
  const dirpath = path.replace(/\/?([^/]+)\/*$/, '');
  return formatURI({
    scheme,
    authority,
    path: scheme || authority != null || dirpath ? dirpath : root || '.',
  });
}

export function extname(uri: string): string {
  return parse(uri).ext;
}

function isAbsolutePath(path: string): boolean {
  return /^(?:\w:)?\//.test(path);
}

export function isAbsolute(uri: string): boolean {
  const { scheme, authority, path } = parse(uri);
  return !!(scheme || authority != null || isAbsolutePath(path));
}

export function normalize(uri: string): string {
  const { scheme, authority, path, query, fragment, root } = parse(uri);
  let pathRootless = path.slice(root.length);
  pathRootless = pathRootless.replace(/[\\/]+/g, '/');
  if (root) {
    pathRootless = pathRootless.replace(/^(?:\/\.{0,2})+/, '');
  }
  const dirs = [] as string[];
  pathRootless.split('/').forEach((dir) => {
    if (dir === '.') {
      if (!dirs.length) {
        dirs.push(dir);
      }
    } else if (dir === '..') {
      if (dirs.length && dirs[dirs.length - 1] !== '..') {
        dirs.pop();
      } else if (!root) {
        dirs.push(dir);
      }
    } else {
      if (dir !== '' && dirs[dirs.length - 1] === '.') {
        dirs.pop();
      }
      dirs.push(dir);
    }
  });
  const normalizedPath = root + dirs.join('/');
  return formatURI({
    scheme,
    authority,
    path: scheme || authority != null || normalizedPath ? normalizedPath : root || '.',
    query,
    fragment,
  });
}

export function join(...paths: string[]): string {
  return normalize(paths.join('/'));
}

export function resolve(...uris: string[]): string {
  const result: ParsedURI = { scheme: '', authority: null, path: '', query: null, fragment: null };
  uris.forEach((uri, i) => {
    const { scheme, authority, path, query, fragment, root } = parse(uri);
    if (!i || scheme) {
      result.scheme = scheme;
      result.authority = authority;
      result.path = path;
      result.query = query;
    } else if (authority != null) {
      result.authority = authority;
      result.path = path;
      result.query = query;
    } else if (root) {
      result.path = path;
      result.query = query;
    } else if (path) {
      result.path += `/${path}`;
      result.query = query;
    } else if (query != null) {
      result.query = query;
    }
    result.fragment = fragment;
  });
  return normalize(format(result));
}

export function relative(from: string, to: string): string {
  const fromParsed = parse(from);
  const toParsed = parse(to);
  if (
    fromParsed.scheme !== toParsed.scheme ||
    fromParsed.authority !== toParsed.authority ||
    fromParsed.root !== toParsed.root
  ) {
    return to;
  }

  const rootPath =
    format({
      scheme: toParsed.scheme,
      authority: toParsed.authority,
      root: toParsed.root,
    }) || '/';
  const fromResolvedPath = resolve(rootPath, from);
  const toResolvedPath = resolve(rootPath, to);
  if (fromResolvedPath === toResolvedPath) {
    return '';
  }

  const fromParts = fromResolvedPath
    .slice(rootPath.length)
    .split('/')
    .filter((part) => part);
  const toParts = toResolvedPath
    .slice(rootPath.length)
    .split('/')
    .filter((part) => part);
  let commonSize = 0;
  for (
    const minSize = Math.min(fromParts.length, toParts.length);
    commonSize < minSize && fromParts[commonSize] === toParts[commonSize];
    commonSize += 1
  );
  return new Array(fromParts.length - commonSize)
    .fill('..')
    .concat(toParts.slice(commonSize))
    .join('/');
}
