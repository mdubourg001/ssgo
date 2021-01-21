---
title: API
description: Here's the reference of JavaScript (TypeScript) ssgo API. Keep in mind that ssgo is built upon Deno, so the API intend to be used only from Deno scripts.
path: api
weight: 6
---

# API

Here's the reference of the JavaScript (TypeScript) ssgo API.

> **Keep in mind that ssgo is built upon Deno, and so that the API intends to be used only from Deno scripts.**

## `buildTemplateToString`

> _Type: `(templatePath: string, data: Record<string, any>, componentsDirPath?: string) => string`_

**Given the path of a template file and some context data, builds the HTML and returns it as string.**

```typescript
import { buildTemplateToString } from "https://deno.land/x/ssgo/mod.ts"

const __dirname = new URL(".", import.meta.url).pathname
const template = `${__dirname}/template.html`
const components = `${__dirname}/components`

const pageA = await buildTemplateToString(
  template,
  { name: "Steven" },
  components
)
```

---

This API aims to expose more features in the future. **If you have an idea of something useful that could be added to it, please feel free to <a href="https://github.com/mdubourg001/ssgo/issues" target="_blank" rel="noreferrer nofollow noopener">fill and issue</a>.**
