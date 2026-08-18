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
