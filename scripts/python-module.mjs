import { spawnSync } from 'node:child_process';

const [, , moduleName, ...moduleArgs] = process.argv;

if (!moduleName) {
  console.error('Usage: node scripts/python-module.mjs <module> [...args]');
  process.exit(2);
}

const candidates = [
  { command: 'python3', args: ['-m', moduleName, ...moduleArgs] },
  { command: 'python', args: ['-m', moduleName, ...moduleArgs] },
  { command: 'py', args: ['-3', '-m', moduleName, ...moduleArgs] },
];

for (const candidate of candidates) {
  const result = spawnSync(candidate.command, candidate.args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error?.code === 'ENOENT') {
    continue;
  }

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  process.exit(result.status ?? 1);
}

console.error('Python 3 was not found. Install Python 3.12 or add it to PATH.');
process.exit(127);
