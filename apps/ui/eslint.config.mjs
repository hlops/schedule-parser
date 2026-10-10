import svelte from "eslint-plugin-svelte";
import baseConfig from "../../eslint.config.mjs";

export default [
    ...baseConfig,
    ...svelte.configs["recommended"],
    {
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
