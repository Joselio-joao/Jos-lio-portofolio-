# Configuração do acesso privado do portefólio

A aplicação usa dois níveis de acesso independentes. O **proprietário** entra pelo Supabase Auth com e-mail e palavra-passe. Um **visitante** entra com uma palavra-passe temporária criada pelo proprietário; cada palavra-passe é guardada apenas como hash, é consumida atomicamente no primeiro uso e expira no prazo configurado.

## 1. Aplicar o esquema no Supabase

Abra **Supabase → SQL Editor**, seleccione o projecto correcto e execute uma vez o ficheiro `supabase-visitor-passwords.sql`. O script cria `portfolio_visitor_passwords`, activa RLS e cria `consume_visitor_password`, uma função `SECURITY DEFINER` que bloqueia concorrência com `FOR UPDATE SKIP LOCKED`.

Confirme também que o proprietário está registado em `portfolio_members` com `role = 'owner'`. Sem esse registo, o login de e-mail pode existir no Supabase Auth, mas não terá autorização para a área `/gestao`.

## 2. Configurar os secrets da Edge Function

Na raiz do repositório, associe o Supabase CLI ao projecto e configure apenas o segredo da sessão própria:

```bash
npm install -g supabase
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase secrets set PORTFOLIO_SESSION_SECRET='SEGREDO_LONGO_ALEATORIO_COM_PELO_MENOS_32_CARACTERES'
```

A função utiliza `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no ambiente do Supabase. A chave `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser colocada no frontend, no GitHub ou no Cloudflare Pages. Já não é necessário configurar `PORTFOLIO_ACCESS_PASSWORD`: as palavras-passe são geradas pelo proprietário e armazenadas em `portfolio_visitor_passwords` como hashes.

## 3. Publicar a função

Execute a partir da raiz do repositório:

```bash
supabase functions deploy portfolio-access --no-verify-jwt
```

A opção `--no-verify-jwt` permite que a função aceite os dois formatos previstos: o JWT de sessão do proprietário, validado com `auth.getUser`, e o token HMAC temporário emitido depois do consumo de uma palavra-passe de visitante. A própria função continua a rejeitar acções sem autorização.

## 4. Configurar o Cloudflare Pages

Mantenha no Cloudflare Pages apenas as variáveis públicas do cliente:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Use o comando e a pasta de saída seguintes:

```text
Build command: pnpm build:external
Output directory: dist/public
```

A aplicação deve ser publicada no repositório privado, enquanto o conteúdo e os ficheiros permanecem no Supabase. O bucket `portfolio-private` deve existir e ser privado.

## 5. Utilização normal

Na página de login, o proprietário escolhe **Owner Login** e introduz e-mail e palavra-passe do Supabase. Depois de entrar em `/gestao`, a secção **Gerar palavra-passe de visitante** permite definir uma etiqueta e uma validade entre uma e 168 horas. O código em texto simples é mostrado apenas nesse momento; deve ser copiado e enviado ao visitante por um canal seguro.

O visitante escolhe **Visitor Access**, introduz o código e recebe uma sessão HMAC temporária. Ao primeiro uso, `consume_visitor_password` preenche `used_at`; uma segunda tentativa com o mesmo código recebe erro de palavra-passe inválida, expirada ou já utilizada. A Gestão mostra o estado **Activa**, **Utilizada** ou **Expirada**, permite revogar códigos activos e apresenta os registos de acesso ao proprietário.

## 6. Teste end-to-end

Crie uma palavra-passe na Gestão e abra o site numa janela privada ou num navegador diferente. Use o código uma vez e confirme que os conteúdos publicados carregam. Tente usar o mesmo código novamente e confirme que o acesso é recusado. No proprietário, actualize a auditoria e confirme o resultado, data, agente do navegador e hash de rede; o endereço IP original não é apresentado.

Para testar a concorrência, submeta o mesmo código em duas janelas ao mesmo tempo. A função SQL deve permitir exactamente um consumo bem-sucedido. Para testar expiração, crie um código com validade mínima, aguarde a expiração e confirme a rejeição.

## Segurança operacional

Nunca publique `SUPABASE_SERVICE_ROLE_KEY` ou `PORTFOLIO_SESSION_SECRET`. Nunca registe a palavra-passe de visitante em ficheiros, URLs ou commits. Se o segredo HMAC for comprometido, altere `PORTFOLIO_SESSION_SECRET` e publique novamente a Edge Function; todas as sessões temporárias existentes deixarão de ser válidas.
