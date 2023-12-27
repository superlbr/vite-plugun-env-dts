import path from 'node:path';
import * as fs from 'node:fs';
import type { Watcher } from 'node-watch';
import watch from 'node-watch';
import dotenv from 'dotenv';
import { minimatch } from 'minimatch';

export const start = (opts: { envDir: string; filename: string; name: string }) => {
  const { envDir, filename, name } = opts;

  const generate = async () => {
    const dirs = await fs.promises.readdir(envDir);
    let str = `interface ${name} {\n`;
    const readList: string[] = [];

    for (const dir of dirs) {
      const f = path.join(envDir, dir);
      const text = await fs.promises.readFile(f, 'utf-8');
      const parsed = dotenv.parse(text);
      Object.keys(parsed).forEach((key) => {
        if (readList.includes(key))
          return;
        readList.push(key);
        str += `  readonly ${key}: string;\n`;
      });
    }
    str += '}\n';

    await fs.promises.writeFile(filename, str);
  };

  if (!fs.existsSync(envDir)) {
    console.log(`[envDts] envDir not exists!`);
    return;
  }

  try {
    let watchers: Watcher[] = [];
    const watcher = watch(
      path.join(envDir),
      {
        recursive: true,
        filter: f => minimatch(f, '*.env*')
      },
      (evt, _) => {
        if (evt === 'update') {
          generate();
        }
      }
    );
    watcher.on('error', (e) => {
      console.log('[envDts Error]');
      console.log(e);
    });
    watchers.push(watcher);

    generate();

    const stop = () => {
      watchers.forEach((watcher) => {
        watcher.close();
      });
      watchers = [];
    };

    return stop;
  } catch (e) {
    console.log(`[envDts Error]`);
    console.log(e);
  }
};
