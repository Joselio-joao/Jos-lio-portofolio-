# Pesquisa de integração de agente

## Documentação Antigravity consultada

A página de início descreve o Antigravity como ambiente de desenvolvimento com agentes que trabalham dentro de projetos e pastas/repositórios autorizados. A documentação apresenta modos local e worktree para o agente alterar código, além de uma CLI e um SDK. Este material ainda não comprova uma integração de agente como funcionalidade de execução dentro de um app iOS; a página específica do SDK precisa ser avaliada antes de selecionar a arquitetura.

Fonte consultada: https://antigravity.google/docs/getting-started

## SDK Antigravity

A página do SDK descreve uma framework Python para construir, testar e executar agentes autónomos, com ferramentas de sistema, funções Python, servidores MCP e políticas de permissões. O exemplo de início usa `pip install google-antigravity` e `LocalAgentConfig`, ou seja, requer um ambiente Python de servidor/local e não uma biblioteca de interface nativa para iOS. Como pode operar ficheiros e comandos, uma eventual integração precisa de políticas de negação por defeito e de um serviço servidor separado do aplicativo móvel.

Fonte consultada: https://antigravity.google/docs/sdk/overview/

## Repositório DIO Agent

O repositório `digitalinnovationone/dio-agent` é um pacote de instruções, personalidade, conhecimento e skills para um tutor de estudos; não é um SDK iOS nem um servidor de agente pronto a integrar. A estrutura central é composta por `AGENTS.md`, conteúdos em Markdown e skills de plano de estudos, explicação de conceitos e resolução guiada de desafios. Pode inspirar o comportamento do assistente do Super Tracker, mas não deve ser executado dentro do app sem um runtime de agente compatível e revisão de licenças/dependências.

Fonte consultada: https://github.com/digitalinnovationone/dio-agent

## Inspeção local passiva

O repositório foi clonado apenas numa pasta isolada de inspeção, sem executar ficheiros ou instalar dependências. A árvore contém conteúdo Markdown, instruções de agente e skills, sem código de aplicativo iOS ou serviço de API. Não foi encontrado um ficheiro de licença no nível principal durante a inspeção da árvore; por isso, a implementação deve criar uma persona própria para o Super Tracker e não copiar os conteúdos do repositório. Os princípios educativos de conduzir o raciocínio, celebrar progresso e fazer uma pergunta por vez podem inspirar a experiência, sem reutilização textual direta.
