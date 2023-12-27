import { Plugin } from 'vite';

interface Options {
    filename?: string;
    name?: string;
}
declare const envDtsPlugin: (options?: Options) => Plugin;

export { type Options, envDtsPlugin as default };
