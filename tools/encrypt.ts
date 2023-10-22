import * as crypto from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';
import * as stream from 'node:stream';
import { promisify } from 'node:util';

const algorithm = 'aes-192-cbc';
const rootDir = process.cwd();

const pipeline = promisify(stream.pipeline);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function encrypt(password: string) {
  const key = crypto.scryptSync(password, 'apoj', 24);
  const iv = Buffer.alloc(16, 0);

  const fileExists = fs.existsSync(path.join(rootDir, './.env'));

  if (!fileExists) {
    throw new Error('No .env file found');
  }

  await pipeline(
    fs.createReadStream(path.join(rootDir, './.env')),
    crypto.createCipheriv(algorithm, key, iv),
    fs.createWriteStream(path.join(rootDir, './.env.enc'))
  );

  return path.join(rootDir, './.env');
}

export default function start() {
  rl.question('Enter the password to encrypt: ', async (password) => {
    const file = await encrypt(password);

    rl.close();

    console.log('Encrypted:', file);
  });
}

start();
