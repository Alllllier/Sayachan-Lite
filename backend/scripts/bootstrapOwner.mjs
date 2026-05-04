#!/usr/bin/env node

import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const DEFAULT_BACKEND_URL = 'http://localhost:3001';

function defaultBackendUrl() {
  if (process.env.SAYACHAN_BACKEND_URL) {
    return process.env.SAYACHAN_BACKEND_URL;
  }

  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL;
  }

  if (process.env.PORT) {
    return `http://localhost:${process.env.PORT}`;
  }

  return DEFAULT_BACKEND_URL;
}

function usage() {
  const currentDefaultUrl = defaultBackendUrl();
  return `Sayachan owner bootstrap

Usage:
  npm run bootstrap:owner
  npm run bootstrap:owner -- --email owner@example.com --password "at-least-8-chars"
  npm run bootstrap:owner -- --url https://your-backend.example.com --email owner@example.com

Options:
  --url       Backend base URL. Defaults to ${currentDefaultUrl}
  --email     Owner email. If omitted, the script prompts for it.
  --password  Owner password. If omitted, the script prompts for it.
  --help      Show this help.

Environment alternatives:
  SAYACHAN_BACKEND_URL
  RENDER_EXTERNAL_URL
  PORT
  SAYACHAN_OWNER_EMAIL
  SAYACHAN_OWNER_PASSWORD
`;
}

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }

    if (!token.startsWith('--')) {
      throw new Error(`Unexpected argument: ${token}`);
    }

    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    args[key] = value;
    i += 1;
  }

  return args;
}

async function promptForMissing({ url, email, password }) {
  if (url && email && password) {
    return { url, email, password };
  }

  const currentDefaultUrl = defaultBackendUrl();
  const rl = readline.createInterface({ input, output });
  try {
    return {
      url: url || (await rl.question(`Backend URL [${currentDefaultUrl}]: `)).trim() || currentDefaultUrl,
      email: email || (await rl.question('Owner email: ')).trim(),
      password: password || await rl.question('Owner password (input is visible): '),
    };
  } finally {
    rl.close();
  }
}

function normalizeBaseUrl(url) {
  return String(url || DEFAULT_BACKEND_URL).replace(/\/+$/, '');
}

async function bootstrapOwner({ url, email, password }) {
  const response = await fetch(`${normalizeBaseUrl(url)}/auth/bootstrap-owner`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const message = body?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return body;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const options = await promptForMissing({
    url: args.url || defaultBackendUrl(),
    email: args.email || process.env.SAYACHAN_OWNER_EMAIL,
    password: args.password || process.env.SAYACHAN_OWNER_PASSWORD,
  });

  if (!options.email) {
    throw new Error('Owner email is required.');
  }

  if (!options.password || options.password.length < 8) {
    throw new Error('Owner password is required and must be at least 8 characters.');
  }

  const owner = await bootstrapOwner(options);
  console.log('');
  console.log('Owner bootstrap complete.');
  console.log(`Email: ${owner.email}`);
  console.log(`Role: ${owner.role}`);
  console.log('');
  console.log('Next: open the frontend login page and sign in with this account.');
}

main().catch((error) => {
  console.error('');
  console.error(`Owner bootstrap failed: ${error.message}`);
  console.error('');
  console.error('Make sure the backend URL is reachable and MongoDB is connected.');
  console.error('On Render, pass --url https://your-service.onrender.com or set SAYACHAN_BACKEND_URL if RENDER_EXTERNAL_URL is not available.');
  console.error('If an owner already exists, use the normal login page instead.');
  process.exitCode = 1;
});
