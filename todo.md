# Conversão para aplicativo iOS com IA

- [x] Confirmar os requisitos da documentação Antigravity e a licença/compatibilidade do repositório dio-agent.
- [x] Definir a abordagem iOS e o modelo seguro de persistência local e sincronização opcional.
- [x] Criar o projeto Expo iOS e migrar o tracker: estudo, avaliações, universidade, bolsas, hábitos, currículo e exportação.
- [x] Integrar o assistente de IA por uma interface segura, sem expor chaves no cliente.
- [x] Testar os fluxos e preparar um arquivo completo do projeto para descarregamento.
- [x] Restaurar a versão web estável do Super Tracker para uso sem computador.
- [x] Adicionar manifest, ícones e metadados de instalação no Safari/iPhone.
- [x] Validar o painel no tamanho de ecrã de iPhone e guardar a versão publicável.
- [x] Guardar o checkpoint da versão PWA e confirmar que a cópia entregue mantém a apresentação no iPhone.
- [x] Adicionar eliminação de histórico de estudo e avaliações com confirmação explícita.
- [x] Adicionar limpeza geral dos dados locais com confirmação explícita e opção de exportar antes de apagar.
- [x] Testar os fluxos de eliminação no formato de iPhone e guardar a versão atualizada.

- [x] Corrigir o cache do service worker para guardar todos os ficheiros da aplicação após a primeira abertura online.
- [x] Validar o cache do service worker e a persistência dos registos no navegador.
- [x] Confirmar manualmente a abertura offline da PWA no iPhone depois da publicação.
- [x] Guardar novo checkpoint da versão offline corrigida.

- [x] Mostrar no cabeçalho se o Super Tracker está online ou offline.
- [x] Confirmar a persistência local no navegador e orientar a validação manual no iPhone.

- [x] Migrar dados estruturados de localStorage para IndexedDB com migração automática da versão existente.
- [x] Adicionar camada opcional OPFS para ficheiros maiores e metadados de armazenamento.
- [x] Mostrar quota e espaço usado através de Storage Manager e manter Cache API para os assets offline.
- [x] Testar persistência, migração, eliminação segura e funcionamento offline em navegador compatível.
- [x] Guardar checkpoint da atualização de armazenamento.

- [x] Escolher o alojamento externo: GitHub Pages para a PWA estática; backend não é necessário para o uso pessoal offline.
- [x] Exportar o código e separar os componentes dependentes do Manus.
- [x] Definir substituto para OAuth, base de dados, storage e APIs Manus, caso sejam necessários fora da plataforma: a cópia offline não usa OAuth, base de dados remota, storage remoto nem APIs Manus.
- [ ] Configurar domínio, HTTPS, variáveis de ambiente e publicação externa. O workflow GitHub Pages foi incluído; falta ativação/verificação no GitHub.
- [ ] Testar a PWA publicada, o modo offline e os fluxos de dados depois da migração.

- [x] Escolher não usar servidor Node nem domínio próprio nesta primeira publicação; GitHub Pages é suficiente para a PWA.
- [x] Escolher não usar TiDB/MySQL nem storage remoto; IndexedDB e OPFS permanecem locais no dispositivo.
- [x] Optar por aplicação pessoal single-tenant sem login, preservando o funcionamento offline.
- [x] Definir que a IA online é opcional e não faz parte da PWA offline; qualquer integração futura deverá usar um proxy externo seguro.

- [x] Simplificar a exportação para PWA estática sem backend, login ou Supabase.
- [x] Preparar a publicação externa da PWA e as instruções de domínio.
- [x] Confirmar que IndexedDB, OPFS, Cache API e modo offline permanecem funcionais após a exportação.


## Correção visual dos cartões de certificados

- [x] Reduzir as imagens dos cartões de certificados para o tamanho médio usado na página Instituições
- [x] Validar proporção, responsividade e ausência de cortes em mobile e desktop
- [x] Publicar a correcção visual


## Compactação dos cartões de certificados

- [x] Reduzir altura, espaçamento e área interna dos cartões de certificados
- [x] Validar leitura, botões, pré-visualização e responsividade
- [x] Publicar a versão compacta


## Adaptação da área de Gestão ao prompt GitHub Pages/API

- [x] Comparar a Gestão actual com o workspace, diagnóstico e regras de segurança do prompt fornecido
- [x] Implementar as melhorias de token, inventário, editor e geração de índice aplicáveis ao portefólio
- [x] Validar CRUD, uploads, conflitos, responsividade e publicação no GitHub Pages


## Link público permanente e actualizável

- [x] Garantir que o link público abre sem autenticação em qualquer navegador
- [x] Fazer o conteúdo público carregar primeiro a versão actual do GitHub Pages e usar cache apenas como fallback
- [x] Validar que futuras publicações aparecem no mesmo link após o workflow terminar


## Repositório privado

- [x] Alterar `Joselio-joao/Jos-lio-portofolio-` para privado
- [x] Confirmar a visibilidade e verificar o impacto no GitHub Pages



## Migração para Supabase

- [x] Configurar autenticação Supabase para utilizadores autorizados
- [x] Migrar conteúdos e ficheiros privados para tabelas, Storage e políticas RLS
- [x] Adaptar Gestão, leitura pública e testes ao Supabase
- [ ] Validar acesso negado, sessão, uploads, publicação e build


## Correção do build Cloudflare Pages

- [ ] Recolher e corrigir o erro do último build no Cloudflare Pages
- [ ] Validar comando, saída e variáveis Supabase do deployment
- [ ] Confirmar que o endereço `pages.dev` fica activo e protegido pelo login


## Erro Cloudflare Pages — nova verificação

- [x] Diagnosticar o build falhado e o estado “No active routes”
- [x] Corrigir ou confirmar build, saída e variáveis Supabase
- [x] Validar o deployment e as rotas no endereço `pages.dev`


## Login por código temporário enviado por e-mail

- [x] Substituir palavra-passe por pedido de código OTP por e-mail
- [x] Confirmar código, sessão e autorização em `portfolio_members`
- [x] Validar mensagens, expiração, reenvio e rotas protegidas
- [ ] Publicar a alteração no Cloudflare Pages


## Restaurar login por e-mail e palavra-passe

- [x] Substituir o fluxo OTP pelo login Supabase com e-mail e palavra-passe
- [x] Remover o estado e as mensagens específicas de código temporário
- [x] Validar sessão, autorização, testes e build
- [x] Publicar a versão correcta no Cloudflare Pages


## Palavra-passe única e registo de acessos

- [ ] Criar validação protegida da palavra-passe sem a expor no frontend
- [ ] Criar sessão temporária e expiração automática
- [ ] Registar data e hora de cada acesso autorizado
- [ ] Adaptar login e Gestão para mostrar o histórico ao proprietário
- [ ] Validar segurança, testes, build e publicação


## Proxy completo por palavra-passe única

- [ ] Migrar leitura pública de conteúdos para a Edge Function protegida
- [ ] Migrar uploads, downloads e CRUD da Gestão para o proxy
- [ ] Substituir a guarda Supabase Auth por sessão temporária do proxy
- [ ] Mostrar ao proprietário o histórico privado de acessos
- [ ] Testar expiração, rejeição, publicação e acesso a ficheiros
- [ ] Configurar e publicar a Edge Function no Supabase


## Proprietário e palavras-passe de visitante de utilização única

- [ ] Manter login do proprietário com e-mail e palavra-passe
- [ ] Permitir que apenas o proprietário gere palavras-passe de visitante
- [ ] Criar palavras-passe de visitante armazenadas apenas como hash
- [ ] Invalidar atomicamente cada palavra-passe depois do primeiro uso
- [ ] Mostrar na Gestão estado, criação, utilização e expiração das palavras-passe
- [ ] Validar permissões, reutilização, expiração e publicação

## Implementação final — autenticação dual e palavras-passe de visitante

- [x] Separar o login de proprietário (e-mail/palavra-passe) do login de visitante (palavra-passe de utilização única)
- [x] Validar a sessão de visitante no proxy com token assinado e expiração automática
- [x] Implementar consumo atómico da palavra-passe através de consume_visitor_password
- [x] Implementar geração, listagem, revogação e auditoria de palavras-passe na Gestão do proprietário
- [x] Restringir a área de Gestão ao proprietário autenticado
- [x] Validar TypeScript, 17 testes Vitest e build externo
- [ ] Confirmar no Supabase os secrets e executar o SQL de palavras-passe, se ainda não tiver sido aplicado
- [ ] Fazer teste manual end-to-end com uma palavra-passe real no deployment
- [ ] Actualizar PASSWORD_PROXY_SETUP.md com a configuração dual e single-use

## Correcção do esquema portfolio_members

- [ ] Confirmar as colunas reais de `portfolio_members` no Supabase
- [ ] Corrigir o SQL de associação do proprietário sem usar a coluna `email`
- [ ] Actualizar a documentação para o esquema real
- [ ] Validar o login do proprietário e o acesso à Gestão

## Diagnóstico adicional do proprietário Supabase

- [ ] Confirmar se o e-mail criado em Auth corresponde exactamente ao e-mail consultado
- [x] Confirmar se existe uma linha correspondente em `portfolio_members`
- [x] Confirmar se a linha tem `role = 'owner'`
- [ ] Corrigir a autorização caso o registo exista mas a Gestão continue bloqueada

- [x] Confirmar pela consulta que `estudantejoselio@gmail.com` existe em `auth.users`
- [x] Criar ou actualizar a linha correspondente em `portfolio_members` com `role = 'owner'`

## Link publicado mostra sempre acesso não autorizado

- [ ] Garantir que o link abre primeiro o ecrã de login quando não existe sessão
- [ ] Corrigir a leitura assíncrona da sessão Supabase antes de decidir autorização
- [ ] Reconhecer correctamente o proprietário após novo login
- [ ] Validar o comportamento no link publicado em navegador limpo

## 404 público e documentos ausentes

- [ ] Confirmar o domínio exacto e a origem do 404 apresentado no iPhone
- [ ] Garantir fallback para rotas directas e links antigos
- [ ] Confirmar a fonte actual dos documentos e imagens publicados
- [ ] Restaurar os conteúdos históricos no Supabase ou activar fallback seguro
- [ ] Validar certificados, instituições, imagens e PDFs no link público

## Ficheiros continuam ausentes no link público

- [ ] Confirmar se `portfolio_items` contém os conteúdos históricos
- [ ] Confirmar se o bucket privado contém imagens, PDFs e anexos
- [ ] Corrigir a importação dos conteúdos históricos, se necessário
- [ ] Corrigir a emissão de URLs assinados para imagens e documentos
- [ ] Validar o carregamento após login de proprietário e visitante

## 404 no link directo da Gestão

- [ ] Garantir que `/gestao` abre a aplicação em Cloudflare Pages
- [ ] Garantir que o alias `/Jos-lio-portofolio-/gestao` também abre a aplicação
- [ ] Validar o redireccionamento para login sem sessão
- [ ] Validar a abertura da Gestão depois do login do proprietário

## Rotas resolvidas; ficheiros multimédia ainda ausentes

- [x] Confirmar que a Gestão e as restantes rotas já carregam
- [ ] Confirmar se os caminhos de imagens/PDFs apontam para Storage privado ou para referências antigas
- [ ] Corrigir a emissão de URLs assinados para os ficheiros existentes
- [ ] Migrar os ficheiros históricos que ainda não estão no bucket privado
- [ ] Validar imagens, PDFs, Office e vídeos após login

## Activação sem computador

- [ ] Orientar publicação da Edge Function pelo painel web acessível no telemóvel
- [ ] Confirmar configuração do Storage privado pelo Supabase mobile web
- [ ] Testar imagens e documentos novamente no iPhone

## 404 persistente no endereço do iPhone

- [ ] Confirmar o domínio completo visível no link aberto pelo iPhone
- [ ] Comparar o domínio com `jos-lio-portofolio.pages.dev`
- [ ] Corrigir eventual domínio antigo ou deployment divergente
- [ ] Validar novamente a Gestão e os documentos no endereço correcto

## URL corrigido

- [x] Identificar `%60` como carácter extra no endereço do iPhone
- [ ] Confirmar a página inicial sem o carácter extra
- [ ] Confirmar `/gestao` sem o carácter extra

## Itens históricos devem aparecer no site

- [ ] Mostrar os itens históricos após login válido
- [ ] Garantir que certificados e PDFs aparecem na página Certificados
- [ ] Garantir que imagens e ligações aparecem nas páginas correspondentes
- [ ] Confirmar que o carregamento continua protegido por autenticação

## Itens continuam ausentes após a correcção

- [ ] Confirmar se o deployment publicado contém o commit `970d3bb`
- [ ] Confirmar se `data/portfolio-content.json` está acessível no domínio público
- [ ] Confirmar se a sessão válida chama a origem correcta dos conteúdos
- [ ] Corrigir a fonte efectiva dos itens se o fallback ainda não for executado
- [ ] Validar visualmente os itens no iPhone

## Deployment correcto activo; diagnóstico pós-login

- [x] Confirmar no Cloudflare que `970d3bb` está em Production
- [ ] Confirmar que o login cria uma sessão de proprietário ou visitante
- [ ] Confirmar que a rota Certificados recebe os itens após a sessão
- [ ] Corrigir a falha específica identificada no teste pós-login

## Itens visíveis, imagens quebradas e secções vazias

- [x] Confirmar que os certificados e PDFs aparecem no iPhone
- [ ] Corrigir os caminhos das imagens históricas
- [ ] Fazer Projectos, Eventos e Obras usar o índice histórico carregado
- [ ] Validar as imagens e as três secções no deployment

## Geração de palavras-passe temporárias bloqueada

- [ ] Capturar e diagnosticar o erro devolvido ao gerar código
- [ ] Confirmar a autorização owner na Edge Function
- [ ] Confirmar a tabela e função SQL de consumo/geração
- [ ] Mostrar o código gerado uma única vez na Gestão
- [ ] Validar a listagem e o primeiro uso

## Edge Function devolve erro não-2xx ao gerar código

- [ ] Obter o código HTTP e a mensagem nos logs de `portfolio-access`
- [ ] Corrigir secret, verificação JWT, autorização owner ou tabela conforme o diagnóstico
- [ ] Repetir a geração no painel móvel

## Edge Function portfolio-access devolve 404

- [x] Confirmar nos logs que o endpoint responde 404
- [ ] Confirmar que a função existe no mesmo projecto Supabase usado por `VITE_SUPABASE_URL`
- [ ] Publicar/activar a função com o nome exacto `portfolio-access`
- [ ] Repetir a geração de uma palavra-passe temporária

## Função ainda não criada no Supabase

- [x] Confirmar que `portfolio-access` não existe no projecto activo
- [ ] Criar a Edge Function com o nome exacto `portfolio-access`
- [ ] Configurar `PORTFOLIO_SESSION_SECRET` e a validação JWT adequada
- [ ] Testar a geração de código no painel Gestão

## Esquema de palavras-passe ainda incompleto

- [ ] Confirmar a existência de `portfolio_visitor_passwords`
- [ ] Aplicar a função SQL `consume_visitor_password`
- [ ] Confirmar ou criar `portfolio_access_logs`
- [ ] Criar e publicar `portfolio-access`
- [ ] Testar geração, utilização única e auditoria

## Edge Function criada mas ainda com erro não-2xx

- [x] Confirmar que o endpoint já não devolve 404
- [ ] Obter a mensagem detalhada do novo erro
- [ ] Corrigir a tabela, função SQL, secret ou autorização indicada pelo log
- [ ] Confirmar que o código aparece depois de gerar

## Logs sem resultados por filtros

- [ ] Remover o filtro de tipo e ajustar o período dos logs
- [ ] Reproduzir a geração depois de actualizar os logs
- [ ] Abrir a invocação e capturar o erro detalhado

## Secret confirmado, geração continua a falhar

- [x] Confirmar que `PORTFOLIO_SESSION_SECRET` existe
- [ ] Verificar existência e colunas de `portfolio_visitor_passwords`
- [x] Verificar existência de `consume_visitor_password`
- [x] Confirmar a associação owner e erro de inserção

## Esquema confirmado; consulta antiga inválida

- [x] Confirmar `portfolio_visitor_passwords`
- [x] Confirmar `portfolio_access_logs`
- [x] Confirmar visualmente a função `consume_visitor_password` e o papel owner
- [ ] Corrigir a geração apenas se o novo diagnóstico indicar falha

## Verify JWT desligado; erro interno pendente

- [x] Confirmar que Verify JWT está desligado
- [ ] Confirmar que a função tem as variáveis automáticas do Supabase
- [ ] Obter a mensagem interna da invocação
- [ ] Corrigir a causa do não-2xx

## Teste manual sem Authorization

- [x] Confirmar que o 401 do corpo `{ "name": "Functions" }` sem header é esperado
- [ ] Reproduzir apenas pelo botão da Gestão com sessão owner
- [ ] Capturar a resposta real da chamada autenticada

## Diagnóstico detalhado no próprio site

- [x] Preservar status HTTP e corpo JSON no cliente proxy
- [x] Mostrar a mensagem concreta na área de Gestão
- [x] Publicar e repetir a geração pelo iPhone

## Nome da Edge Function com capitalização diferente

- [x] Identificar `Portfolio-access` no Supabase e `portfolio-access` no frontend
- [x] Confirmar que a função publicada activa se chama `portfolio-access`
- [ ] Fazer redeploy do frontend alinhado com `portfolio-access` e testar a geração owner

## 404 persiste após alinhar a capitalização

- [ ] Comparar o project ref do `VITE_SUPABASE_URL` com o URL da função
- [ ] Confirmar o slug exacto mostrado no endpoint da função
- [ ] Corrigir a configuração do endpoint definitivo
- [ ] Repetir a geração owner
