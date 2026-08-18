# Publicação externa simples do Super Tracker

Esta versão pode ser publicada como uma PWA estática. Para o tracker pessoal, não são necessários Supabase, login, servidor Node ou base de dados remota: os dados ficam no IndexedDB do dispositivo, os ficheiros grandes usam OPFS quando suportado e o Service Worker mantém a aplicação disponível offline.

## Cloudflare Pages

Cria um projeto a partir do repositório GitHub e usa as seguintes definições:

- **Build command:** `pnpm exec vite build`
- **Output directory:** `dist/public`
- **Node version:** 22

Depois de abrir o endereço publicado uma vez no Safari com Internet, adiciona-o ao Ecrã Principal. O domínio próprio pode ser ligado nas definições de Domains do provedor.

## GitHub Pages

O código precisa de uma ação de build que execute `pnpm install` e `pnpm exec vite build`, publique `dist/public` e configure o domínio base no `vite.config.ts` se o projeto for servido num subcaminho. Para um domínio próprio, a configuração é mais simples porque a aplicação fica na raiz.

## Importante

Esta exportação deliberadamente não inclui autenticação Manus, tRPC, TiDB, S3 ou APIs de servidor. A PWA continua independente e offline. Se futuramente forem necessários sincronização, login ou IA online, será preciso acrescentar uma API externa e rever a política de armazenamento.
