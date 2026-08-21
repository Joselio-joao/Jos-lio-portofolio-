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
