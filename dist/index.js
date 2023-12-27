// src/index.ts
import path2 from "path";

// src/envDts.ts
import path from "path";
import * as fs from "fs";
import watch from "node-watch";
import dotenv from "dotenv";
import { minimatch } from "minimatch";
var start = (opts) => {
  const { envDir, filename, name } = opts;
  const generate = async () => {
    const dirs = await fs.promises.readdir(envDir);
    let str = `interface ${name} {
`;
    const readList = [];
    for (const dir of dirs) {
      const f = path.join(envDir, dir);
      const text = await fs.promises.readFile(f, "utf-8");
      const parsed = dotenv.parse(text);
      Object.keys(parsed).forEach((key) => {
        if (readList.includes(key))
          return;
        readList.push(key);
        str += `  readonly ${key}: string;
`;
      });
    }
    str += "}\n";
    await fs.promises.writeFile(filename, str);
  };
  if (!fs.existsSync(envDir)) {
    console.log(`[envDts] envDir not exists!`);
    return;
  }
  try {
    let watchers = [];
    const watcher = watch(
      path.join(envDir),
      {
        recursive: true,
        filter: (f) => minimatch(f, "*.env*")
      },
      (evt, _) => {
        if (evt === "update") {
          generate();
        }
      }
    );
    watcher.on("error", (e) => {
      console.log("[envDts Error]");
      console.log(e);
    });
    watchers.push(watcher);
    generate();
    const stop = () => {
      watchers.forEach((watcher2) => {
        watcher2.close();
      });
      watchers = [];
    };
    return stop;
  } catch (e) {
    console.log(`[envDts Error]`);
    console.log(e);
  }
};

// src/index.ts
var envDtsPlugin = (options = {}) => {
  const { name = "CustomProcessEnv", filename } = options;
  let root = "";
  let envDir = "";
  let stop;
  return {
    name: "luban:env-dts",
    configResolved: (conf) => {
      root = conf.root;
      envDir = conf.envDir;
    },
    buildStart: () => {
      const f = filename || path2.resolve(root, "custom-env.d.ts");
      stop = start({ envDir, filename: f, name });
    },
    buildEnd: () => {
      stop?.();
    }
  };
};
var src_default = envDtsPlugin;
export {
  src_default as default
};
