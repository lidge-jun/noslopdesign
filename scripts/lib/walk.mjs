import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

export function walk(root) {
  const out = [];
  const visit = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) visit(p);
      else out.push(relative(root, p).split('\\').join('/'));
    }
  };
  visit(root);
  return out.sort();
}
