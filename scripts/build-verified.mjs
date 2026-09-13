import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
// Same bounded build on Windows and CI; preserve the caller's environment.
for (const args of [['scripts/build-game.mjs'], ['node_modules/vinext/dist/cli.js', 'build']]) {
  execFileSync(process.execPath, args, { stdio: 'inherit', timeout: 180000,
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false', WRANGLER_LOG_PATH: '.wrangler/build.log' } });
}
JSON.parse(await readFile('dist/.openai/hosting.json', 'utf8'));
const { default: worker } = await import('../dist/server/index.js');
if (typeof worker?.fetch !== 'function') throw new Error('Sites Worker must export default.fetch');
console.log('Verified Sites Worker and manifest.');
