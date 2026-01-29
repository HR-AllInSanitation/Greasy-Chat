#!/usr/bin/env node
import { execSync } from 'node:child_process';

const ports = [3000, 3002, 3003, 4173, 5173];

const killPid = pid => {
  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    return;
  }
  setTimeout(() => {
    try {
      process.kill(pid, 0);
      try {
        process.kill(pid, 'SIGKILL');
      } catch {
        /* noop */
      }
    } catch {
      /* already gone */
    }
  }, 300);
};

const collectPids = () => {
  const found = new Set();
  for (const port of ports) {
    try {
      const out = execSync(`lsof -ti tcp:${port}`, { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .split(/\s+/)
        .filter(Boolean);
      out.forEach(pid => found.add(Number(pid)));
    } catch {
      // nothing on this port
    }
  }
  return [...found];
};

const pids = collectPids();
if (!pids.length) {
  console.log('No repo ports to kill.');
  process.exit(0);
}

console.log('Killing PIDs on repo ports:', pids.join(', '));
pids.forEach(killPid);
