import * as crypto from 'node:crypto';
import { promisify } from 'node:util';
import * as stream from 'node:stream';
import * as readline from 'node:readline';
import * as path from 'node:path';
import * as fs from 'node:fs';

const algorithm = 'aes-192-cbc';
const rootDir = process.cwd();

const pipeline = promisify(stream.pipeline);

const mutableStdout = new stream.Writable({
  write: function (chunk, encoding, callback) {
    // @ts-ignore
    if (!this.muted) {
      process.stdout.write(chunk, encoding);
    }

    callback();
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true
});

async function decrypt(password: string) {
  const key = crypto.scryptSync(password, 'apoj', 24);
  const iv = Buffer.alloc(16, 0);

  const fileExists = fs.existsSync(path.join(rootDir, './.env.enc'));

  if (!fileExists) {
    throw new Error('No .env.enc file found');
  }

  await pipeline(
    fs.createReadStream(path.join(rootDir, './.env.enc')),
    crypto.createDecipheriv(algorithm, key, iv),
    fs.createWriteStream(path.join(rootDir, './.env'))
  );

  return path.join(rootDir, './.env.enc');
}

export default function start() {
  // @ts-ignore
  mutableStdout.muted = false;

  rl.question('Enter the password to decrypt: ', async (password) => {
    try {
      const file = await decrypt(password);

      console.log('\nDecrypted:', file);

      rl.close();
    } catch {
      console.error('\nWrong password');

      return start();
    }
  });

  // @ts-ignore
  mutableStdout.muted = true;
}

start();
