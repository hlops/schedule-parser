import svelte from "eslint-plugin-svelte";
import baseConfig from "../../eslint.config.mjs";

export default [
    ...baseConfig,
    ...svelte.configs["recommended"],
    {
        // `.svelte.ts`/`.svelte.js` тоже разбирает svelte-eslint-parser (см. svelte:base:setup-for-svelte-script),
        // поэтому ему нужно явно передать TS-парсер, иначе `import type`/руны не парсятся.
        files: [
            "**/*.svelte",
            "**/*.svelte.ts"
        ],
        languageOptions: {
            parserOptions: {
                parser: await import("@typescript-eslint/parser")
            }
        }
    }
];
