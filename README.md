# Jos-lio-portofolio-

Site independente de Josélio João para apresentação pública no GitHub Pages.

A aplicação segue as instruções do `Pasted_content_04.txt`: é uma PWA responsiva, instalável e orientada a funcionamento offline, com dados locais no dispositivo, IndexedDB, OPFS opcional, exportação/importação JSON, confirmação de eliminação, Service Worker versionado, acessibilidade mobile-first e base relativa para funcionar em subcaminhos do GitHub Pages.

## Desenvolvimento

```bash
pnpm install
pnpm run dev
pnpm run check:external
pnpm test
pnpm run build:external
```

O build externo é criado em `dist/public`. O workflow `.github/workflows/deploy-pages.yml` publica automaticamente essa pasta no GitHub Pages após cada alteração na branch `main`.

A aplicação não depende de login obrigatório, Supabase, Firebase, API externa ou base de dados remota para as funções essenciais. Não devem ser adicionados ao repositório tokens, cookies, ficheiros `.env`, dumps de bases de dados ou credenciais.
