# Prompt mestre — Portefólio profissional privado de Josélio João

## Papel

Actua como um engenheiro de software sénior, especialista em React, TypeScript, Supabase, autenticação segura, interfaces mobile-first e publicação na Cloudflare Pages. Constrói e mantém um portefólio profissional privado, rápido, responsivo e utilizável principalmente num iPhone.

Não cries uma demonstração superficial. Entrega uma aplicação funcional, persistente, segura, acessível e pronta para publicação.

## Objectivo do produto

Criar um portefólio profissional para Josélio Guilherme da Costa João, estudante e inventor, destinado a apresentar a sua jornada, projectos, eventos, obras, certificados e instituições.

O portefólio deve permitir:

- acesso reservado apenas a pessoas autorizadas;
- autenticação do proprietário por e-mail e palavra-passe;
- acesso temporário de visitantes por códigos de utilização única;
- gestão de conteúdos através de uma área privada `/gestao`;
- criação, edição, eliminação e publicação de conteúdos;
- upload ou associação de imagens, PDFs, documentos Office, vídeos e ligações externas;
- associação de um conteúdo a uma ou várias instituições;
- manutenção definitiva das alterações após actualizar ou voltar a abrir o site;
- utilização completa em telemóvel, sem exigir computador.

## Stack obrigatória

Usa:

- React 19;
- TypeScript;
- Vite;
- Tailwind CSS;
- Wouter ou outro router leve;
- Supabase Auth;
- Supabase Postgres;
- Supabase Storage para ficheiros privados;
- Supabase Edge Functions para operações sensíveis;
- Cloudflare Pages para publicação;
- Vitest para testes.

Não guardes ficheiros grandes directamente na base de dados. Guarda os ficheiros no Storage e apenas os metadados, caminhos e referências na base de dados.

## Identidade e interface

A interface deve ser profissional, compacta e mobile-first.

Características visuais:

- aparência de aplicação móvel;
- boa utilização em ecrãs pequenos e compatibilidade com desktop;
- cartões compactos, sem elementos gigantes;
- tipografia legível e sem colisões;
- espaçamento consistente;
- cores profissionais baseadas em azul-marinho, azul, branco e roxo suave;
- logótipos institucionais apresentados com `object-contain`;
- imagens sem cortes indevidos;
- contraste suficiente;
- estados claros de carregamento, vazio, erro e sucesso;
- animações curtas e discretas, sempre respeitando `prefers-reduced-motion`;
- feedback visual imediato ao tocar num botão;
- áreas clicáveis adequadas para toque.

Não uses:

- layouts genéricos excessivamente centrados;
- cartões enormes;
- texto a colidir;
- animações infinitas decorativas;
- `transition-all` desnecessário;
- `animate-pulse` em elementos decorativos;
- botões sem estado de carregamento;
- links que abrem páginas erradas;
- menus difíceis de usar no iPhone.

## Página inicial

A página inicial deve ser apenas informativa.

Apresenta uma introdução semelhante a:

> Bom dia a todos. Chamo-me Josélio Guilherme da Costa João. Sou estudante e inventor. Este portefólio apresenta a minha jornada, os meus projectos, eventos, obras e percurso académico e profissional.

A página inicial não deve mostrar uma galeria pesada, documentos ou imagens desnecessárias. Deve carregar rapidamente.

## Navegação pública

A navegação inferior deve conter apenas estas quatro abas:

1. Perfil
2. Projectos
3. Eventos
4. Obras

Não mostrar as abas públicas `Certificados` e `Instituições`.

As páginas e os dados de certificados e instituições podem continuar a existir na Gestão e ser usados como associações internas, mas não devem aparecer na navegação pública principal, salvo pedido explícito posterior.

A navegação deve:

- permanecer acessível no fundo do ecrã;
- funcionar sem recarregar a página;
- preservar a rota correcta;
- voltar ao topo quando o utilizador toca na página já activa;
- funcionar nas rotas com e sem o prefixo do GitHub Pages, se necessário;
- não criar caminhos duplicados ou links quebrados.

## Autenticação

Implementa dois níveis de acesso.

### Proprietário

O proprietário entra com:

- e-mail;
- palavra-passe;
- sessão Supabase persistente;
- opção de terminar sessão.

Apenas um utilizador com `role = owner` pode abrir a Gestão e executar operações de escrita.

### Visitante

O proprietário deve conseguir gerar códigos temporários para visitantes.

Cada código deve:

- ser guardado apenas como hash;
- ter data de expiração;
- poder ser revogado pelo proprietário;
- ser consumido atomicamente na primeira utilização válida;
- não poder ser reutilizado acidentalmente;
- não aparecer guardado no localStorage ou IndexedDB;
- criar uma sessão temporária limitada;
- não permitir operações de Gestão;
- registar sucesso ou falha sem expor o endereço IP na interface.

A validação deve ocorrer numa Edge Function, nunca apenas no cliente.

Usa uma função SQL atómica ou transacção equivalente para consumir códigos. A operação deve impedir duas utilizações simultâneas do mesmo código.

Normaliza a entrada do código antes de validar:

- remover espaços no início e no fim;
- normalizar diferenças de maiúsculas e minúsculas, se os códigos forem case-insensitive;
- nunca guardar a palavra-passe original.

## Protecção de rotas

Cria um `PortfolioAccessGate` que:

- verifica a sessão antes de mostrar o conteúdo;
- mostra um carregamento curto e compreensível;
- encaminha utilizadores não autenticados para `/login`;
- distingue proprietário de visitante;
- bloqueia `/gestao` para visitantes;
- não deixa a aplicação presa indefinidamente em carregamento;
- apresenta erros de rede com mensagem útil;
- permite tentar novamente.

Nunca mostrar dados privados antes da confirmação de acesso.

## Área de Gestão `/gestao`

A Gestão deve ser uma aplicação funcional e rápida no iPhone.

Deve permitir gerir:

- Projectos;
- Eventos;
- Obras;
- Certificados;
- Instituições;
- códigos de visitante;
- registos de acesso, quando permitido.

### Conteúdos

Cada item deve suportar, conforme o tipo:

- título;
- descrição;
- categoria;
- imagem;
- PDF;
- documento Word;
- documento Excel;
- documento PowerPoint;
- vídeo;
- ligação externa;
- instituição ou instituições associadas;
- data de actualização;
- identificador estável.

### Instituições

A Gestão deve permitir:

- adicionar instituições novas;
- editar instituições existentes;
- alterar nome, descrição, imagem e ligação;
- seleccionar várias instituições para um certificado;
- associar automaticamente instituições adicionadas recentemente;
- evitar duplicações ao editar;
- substituir o registo anterior em vez de criar outro igual;
- carregar as imagens correctamente tanto no formulário como na página pública, quando aplicável.

### Filtros

Implementa filtros eficientes na Gestão:

- por tipo de conteúdo;
- por instituição;
- por estado;
- por pesquisa textual;
- por conteúdos compartilhados.

O filtro institucional deve reconhecer também instituições presentes no título, categoria, descrição ou associação explícita.

### Guardar e publicar

Ao editar ou adicionar conteúdo:

1. validar os campos no cliente;
2. mostrar estado de gravação;
3. enviar dados e ficheiros para o Supabase;
4. substituir o registo anterior quando for uma edição;
5. preservar imagens, PDFs e anexos existentes se não forem substituídos;
6. actualizar o cache local;
7. actualizar a interface imediatamente;
8. confirmar que a alteração permanece após actualizar a página;
9. mostrar erro accionável se a RLS, sessão ou rede bloquear a operação.

Não apresentar sucesso antes de a operação persistente terminar.

## Modelo Supabase

Cria ou utiliza tabelas equivalentes a:

- `portfolio_members`;
- `portfolio_items`;
- `portfolio_visitor_passwords`;
- `portfolio_access_logs`.

Campos recomendados para `portfolio_items`:

- `id uuid primary key`;
- `kind text not null`;
- `title text not null`;
- `description text`;
- `category text`;
- `image_path text`;
- `pdf_path text`;
- `attachment_path text`;
- `attachment_name text`;
- `attachment_type text`;
- `external_url text`;
- `institution_ids jsonb` ou tabela de relação;
- `created_at timestamptz`;
- `updated_at timestamptz`.

Cria políticas RLS para:

- leitura apenas por sessões autorizadas;
- escrita apenas pelo proprietário;
- visitantes sem permissões de escrita;
- ficheiros privados acessíveis através de URLs assinados;
- operações administrativas protegidas.

## Edge Function de acesso

Cria uma Edge Function chamada `portofolio-access` ou mantém o nome existente.

Endpoints/operações necessários:

- validar código de visitante;
- consumir código atomicamente;
- gerar código para o proprietário;
- revogar código;
- listar códigos do proprietário;
- listar logs de acesso;
- executar operações administrativas autorizadas.

A função deve:

- validar método HTTP;
- validar JSON recebido;
- devolver respostas JSON consistentes;
- usar códigos HTTP correctos;
- não expor hashes ou segredos;
- limitar tentativas por IP e por identificador do código;
- responder com mensagens úteis sem revelar se um código específico existe;
- aceitar apenas o `apikey` público necessário e autenticar operações de proprietário com JWT válido.

Implementa rate limiting com uma solução adequada à infraestrutura disponível. Se não existir armazenamento distribuído disponível, usa pelo menos uma combinação de limites por código, sessão e janela temporal, documentando claramente a limitação.

## Performance

Optimiza o carregamento sem quebrar a segurança:

- mostrar a interface essencial rapidamente;
- usar cache local apenas para conteúdo que possa ser cacheado;
- nunca guardar palavras-passe ou códigos de visitante;
- carregar a lista pública rapidamente;
- fazer pedidos independentes em paralelo;
- usar `Promise.all` quando for seguro;
- evitar pedidos repetidos em cada renderização;
- estabilizar inputs de queries;
- carregar PDFs e vídeos apenas quando solicitados;
- usar `loading="lazy"` em iframes e imagens não críticas;
- comprimir ou limitar imagens grandes;
- fazer code splitting para páginas pesadas quando necessário;
- manter o bundle inicial razoável.

Se o Supabase estiver indisponível, a aplicação deve mostrar uma mensagem específica de indisponibilidade e não apenas `Load failed`. Não fazer fallback para dados privados sem autorização.

## Segurança

Nunca:

- colocar tokens privados no frontend;
- colocar service role key no repositório;
- guardar palavras-passe em texto simples;
- confiar apenas em validações do cliente;
- permitir que visitantes acedam à Gestão;
- expor dados privados em ficheiros públicos;
- aceitar URLs `javascript:`, `data:` perigosas ou protocolos desconhecidos;
- colocar bytes de ficheiros na base de dados;
- apagar dados existentes ao actualizar uma imagem ou descrição;
- publicar segredos em logs.

Valida ligações externas para aceitar apenas `http://` e `https://`.

## Acessibilidade

Implementa:

- HTML semântico;
- labels associados aos campos;
- foco visível;
- navegação por teclado;
- `aria-label` em botões apenas com ícone;
- mensagens de erro associadas aos campos;
- contraste adequado;
- textos alternativos úteis nas imagens;
- suporte para `prefers-reduced-motion`;
- áreas de toque com pelo menos aproximadamente 44px quando possível.

## Compatibilidade de publicação

Prepara o projecto para Cloudflare Pages.

Configura:

- build externo reproduzível;
- variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` apenas com valores públicos apropriados;
- redirects ou fallback SPA para rotas directas;
- headers adequados;
- cache correcto para assets versionados;
- não depender de um domínio personalizado;
- não assumir que o GitHub Pages está activo.

O endereço de publicação deve ser testado directamente após o deploy. Confirmar:

- resposta HTTP 200;
- carregamento do JavaScript;
- carregamento do CSS;
- carregamento das imagens;
- abertura de `/login`;
- abertura de `/gestao` após autenticação;
- navegação móvel;
- ausência de links para projectos errados.

## Testes obrigatórios

Criar testes para:

- normalização de itens;
- validação de URLs;
- deduplicação de certificados;
- preservação de certificados compartilhados;
- associação a várias instituições;
- consumo único de código;
- expiração e revogação de código;
- bloqueio de visitante na Gestão;
- carregamento público com Supabase indisponível;
- fallback controlado;
- resolução de imagens e ficheiros;
- edição que substitui o registo anterior;
- carregamento dos dados após actualizar a página.

Antes de entregar, executar:

```bash
pnpm check
pnpm test
pnpm build:external
```

Também executar:

```bash
git diff --check
```

Corrigir todos os erros TypeScript, testes e build antes de publicar.

## Regras de implementação

- Ler os ficheiros existentes antes de alterar.
- Preservar o que já funciona.
- Não remover dados, autenticação, instituições ou certificados sem pedido explícito.
- Aplicar alterações de forma incremental.
- Criar checkpoint antes de alterações grandes.
- Não substituir Supabase por armazenamento apenas local.
- Não declarar que algo foi publicado sem confirmar o commit, o workflow e o endereço público.
- Se o Supabase estiver indisponível, distinguir claramente falha externa de erro no código.
- Usar mensagens em português europeu.
- Não criar dados fictícios para esconder uma falha de carregamento.

## Critérios finais de aceitação

A entrega só está concluída quando:

1. o site abre no telemóvel;
2. o login do proprietário funciona;
3. o código de visitante funciona uma vez e não pode ser reutilizado;
4. a Gestão abre apenas para o proprietário;
5. o proprietário consegue adicionar, editar e remover conteúdos;
6. o proprietário consegue adicionar e editar instituições;
7. um item pode ter várias instituições associadas;
8. as alterações sobrevivem a uma actualização da página;
9. os ficheiros e imagens continuam acessíveis com segurança;
10. a navegação pública contém Perfil, Projectos, Eventos e Obras;
11. Certificados e Instituições não aparecem como abas públicas;
12. TypeScript, testes e build passam;
13. o endereço publicado é confirmado directamente;
14. nenhum segredo é exposto no código ou no frontend.

Entrega no final:

- resumo das alterações;
- ficheiros alterados;
- testes executados;
- endereço público;
- commit ou checkpoint criado;
- limitações externas, se existirem.
