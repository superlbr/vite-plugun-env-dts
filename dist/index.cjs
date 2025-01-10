"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_node_path2 = __toESM(require("path"), 1);

// src/envDts.ts
var import_node_path = __toESM(require("path"), 1);
var fs = __toESM(require("fs"), 1);
var import_node_watch = __toESM(require("node-watch"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
var import_minimatch = require("minimatch");
var start = (opts) => {
  const { envDir, filename, name } = opts;
  const generate = async () => {
    const dirs = await fs.promises.readdir(envDir);
    let str = `interface ${name} {
`;
    const readList = [];
    for (const dir of dirs) {
      const f = import_node_path.default.join(envDir, dir);
      const text = await fs.promises.readFile(f, "utf-8");
      const parsed = import_dotenv.default.parse(text);
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
    const watcher = (0, import_node_watch.default)(
      import_node_path.default.join(envDir),
      {
        recursive: true,
        filter: (f) => (0, import_minimatch.minimatch)(f, "*.env*")
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
      const f = filename || import_node_path2.default.resolve(root, "custom-env.d.ts");
      stop = start({ envDir, filename: f, name });
    },
    buildEnd: () => {
      stop?.();
    }
  };
};
var index_default = envDtsPlugin;
