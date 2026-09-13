// Submission tests need only the game build; the review Worker has its own test.
import {readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const files=(await readdir('tests')).filter(n=>n.endsWith('.test.mjs')&&n!=='rendered-html.test.mjs').sort().map(n=>'tests/'+n);
const result=spawnSync(process.execPath,['--test',...files],{stdio:'inherit'});
if(result.error)throw result.error;
process.exit(result.status??1);
