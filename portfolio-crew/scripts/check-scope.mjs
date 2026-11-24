import { execFileSync } from 'node:child_process';
import { parseArgs } from 'node:util';

const usage = 'node check-scope.mjs --base <commit> --allow <file-or-directory/> [--allow ...] [--repo <path>]';

function git(directory, ...args) {
  return execFileSync('git', ['-C', directory, ...args], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
}

function allowedPath(value) {
  const path = process.platform === 'win32' ? value.replaceAll('\\', '/') : value;
  const segments = (path.endsWith('/') ? path.slice(0, -1) : path).split('/');
  if (/^[a-z]:/i.test(path) || segments.some(segment => ['', '.', '..'].includes(segment))) {
    throw new Error(`--allow expects a repository-relative path: ${JSON.stringify(value)}`);
  }
  return path;
}

try {
  const { values } = parseArgs({
    options: {
      base: { type: 'string' },
      allow: { type: 'string', multiple: true },
      repo: { type: 'string', default: '.' },
      help: { type: 'boolean' },
    },
  });

  if (values.help) {
    console.log(usage);
  } else {
    if (!values.base || !values.allow?.length) throw new Error('--base and at least one --allow are required');

    const allow = values.allow.map(allowedPath);
    const root = git(values.repo, 'rev-parse', '--show-toplevel').replace(/\r?\n$/, '');
    const baseline = git(root, 'rev-parse', '--verify', '--end-of-options', `${values.base}^{commit}`).trimEnd();
    const diff = ['--no-ext-diff', '--no-renames', '--name-only', '-z'];
    const tracked = git(root, 'diff', ...diff, baseline, '--');
    const staged = git(root, 'diff', '--cached', ...diff, baseline, '--');
    const untracked = git(root, 'ls-files', '--others', '--exclude-standard', '-z');
    const changed = [...new Set((tracked + staged + untracked).split('\0').filter(Boolean))].sort();
    const outsideScope = changed.filter(path => !allow.some(entry => (
      entry.endsWith('/') ? path.startsWith(entry) : path === entry
    )));

    if (outsideScope.length) {
      console.error(`Paths outside the allowed scope (${outsideScope.length}/${changed.length}):`);
      for (const path of outsideScope) console.error(`  ${JSON.stringify(path)}`);
      process.exitCode = 1;
    } else {
      console.log(`Scope passed: ${changed.length} changed path(s), baseline ${baseline.slice(0, 12)}.`);
    }
  }
} catch (error) {
  console.error(error.message);
  console.error(usage);
  process.exitCode = 2;
}
