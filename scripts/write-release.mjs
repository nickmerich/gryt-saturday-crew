import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';

const git = (...args) => {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
};

// Nonsecret build provenance. Builders without .git must provide the exact SHA.
const candidate = process.env.GRYT_BUILD_COMMIT || git('rev-parse', 'HEAD');
if (candidate && !/^[a-f0-9]{40}$/i.test(candidate)) {
  throw new Error('GRYT_BUILD_COMMIT must be a full 40-character git commit SHA.');
}
const dirty = git('status', '--porcelain', '--untracked-files=no');
mkdirSync('public', { recursive: true });
writeFileSync('public/release.json', JSON.stringify({
  release: 'free-runs-v1',
  commit: candidate || 'unknown',
  dirty: dirty === null ? null : dirty.length > 0,
}, null, 2) + '\n');
console.log(`Release marker: ${candidate || 'unknown (configure GRYT_BUILD_COMMIT before publishing)'}`);
