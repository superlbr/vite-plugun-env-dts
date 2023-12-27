# Generate .d.ts for envs
## Install

```sh
npm i -D vite @luban-ui/vite-plugun-env-dts
```

## Create config file

```ts
import { defineConfig } from 'vite';
import envDts from '@luban-ui/vite-plugun-env-dts';

// vite.config.ts
export default defineConfig(() => {
  const root = __dirname;

  return {
    root,
    server: {
      host: '0.0.0.0',
      port: 5174
    },
    resolve: {
      alias: {
        '@': root
      }
    },
    plugins: [
      envDts({
        filename: 'custom-env.d.ts',
        name: 'CustomProcessEnv'
      })
    ]
    // ...others
  };
});
