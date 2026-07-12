import { describe, it, expect } from 'vitest';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const REPO_ROOT = join(import.meta.dirname, '..');
const PLACEHOLDER = join(REPO_ROOT, '.keep');

describe('Sandcastle workflow smoke test', () => {
  it('has an empty placeholder file at the repo root', () => {
    expect(existsSync(PLACEHOLDER)).toBe(true);
  });

  it('placeholder file is tracked by git', () => {
    const output = execSync('git ls-files --error-unmatch .keep', {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
    }).trim();
    expect(output).toBe('.keep');
  });

  it('placeholder file is empty', () => {
    const stats = statSync(PLACEHOLDER);
    expect(stats.size).toBe(0);
  });
});
