const { execFileSync } = require('child_process');
const { writeFileSync } = require('fs');
const path = require('path');

const COMMIT = '70281aa';
const FILE = 'public/marketplace.html';

try {
const env = { ...process.env, GIT_PAGER: 'cat', GIT_CONFIG_PARAMETERS: "core.pager=cat" };

const content = execFileSync('git', ['cat-file', 'blob', `${COMMIT}:${FILE}`], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
  env
  });

  writeFileSync(path.resolve(__dirname, '..', FILE), content, 'utf8');
  console.log(`Restored ${FILE} from commit ${COMMIT}`);
} catch (error) {
  console.error('Failed to restore file:', error.message);
  process.exit(1);
}

