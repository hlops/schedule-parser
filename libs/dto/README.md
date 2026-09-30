# dto

Общие DTO воркспейса — единый источник правды для форм запросов и ответов API.
Пакет `@schedule-parser/dto`.

## Состав

Только типы, рантайм-кода нет.

## Сборка

```sh
nx build dto
```

`index.d.ts` склеивается из всех файлов либы (`rollupTypes: true` в `vite.config.mts`) — именно этот файл используется для генерации схем.

## Генерация typebox-схем для API

```sh
nx run api:generate-types
```

## Проверки

```sh
nx lint dto         # eslint
nx typecheck dto    # tsc --noEmit -p tsconfig.lib.json
```

## Важно

Не добавляйте в `package.json` либы поле `types` — `vite-plugin-dts` резолвит его относительно корня проекта (а не `outDir`), и `rollupTypes` падает с `mainEntryPointFilePath path does not exist`.
