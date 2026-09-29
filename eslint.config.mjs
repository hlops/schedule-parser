import nx from "@nx/eslint-plugin";

export default [
    ...nx.configs["flat/base"],
    ...nx.configs["flat/typescript"],
    ...nx.configs["flat/javascript"],
    {
      "ignores": [
        "**/dist",
        "**/out-tsc",
        "**/vite.config.*.timestamp*",
        "**/vitest.config.*.timestamp*"
      ]
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.js",
            "**/*.jsx"
        ],
        rules: {
            "@nx/enforce-module-boundaries": [
                "error",
                {
                    enforceBuildableLibDependency: true,
                    allow: [
                        "^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"
                    ],
                    depConstraints: [
                      // Серверные приложения и либы могут зависеть только от серверных и shared
                      {
                        sourceTag: 'scope:server',
                        onlyDependOnLibsWithTags: ['scope:server', 'scope:shared'],
                      },
                      // Клиентские приложения могут зависеть только от клиентских и shared
                      {
                        sourceTag: 'scope:client',
                        onlyDependOnLibsWithTags: ['scope:client', 'scope:shared'],
                      },
                      // Shared-либы могут зависеть только от других shared-либ
                      {
                        sourceTag: 'scope:shared',
                        onlyDependOnLibsWithTags: ['scope:shared'],
                      },
                      // Приложения не могут зависеть от других приложений
                      {
                        sourceTag: 'type:app',
                        onlyDependOnLibsWithTags: ['type:lib'],
                      },
                    ]
                }
            ]
        }
    },
    {
        files: [
            "**/*.ts",
            "**/*.tsx",
            "**/*.cts",
            "**/*.mts",
            "**/*.js",
            "**/*.jsx",
            "**/*.cjs",
            "**/*.mjs"
        ],
        // Override or add rules here
        rules: {}
    }
];
