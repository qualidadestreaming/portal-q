# Portal Q

## Objetivo
Portal Q é um hub central de links: uma tela única que reúne, em forma de cartões clicáveis, todos os sistemas/sites que o usuário já construiu (principalmente ligados à área de Qualidade do Grupo Multilaser). Cada cartão abre seu link em nova aba. O objetivo é substituir "links espalhados" por um único ponto de acesso.

Não é um sistema de dados complexo — é essencialmente um catálogo de links com um painel de administração simples para mantê-lo atualizado.

## Contexto
- Autor/usuário: já criou outros sistemas próprios, incluindo **siges-app** e **Hisense Ações (site-web)**, que servem de referência visual (profissional, minimalista, sem cores fortes, sem animações exageradas).
- Este projeto começou vazio (pasta `portal-q` criada do zero).
- Prioridade explícita: usar apenas **ferramentas gratuitas** (Vercel free tier, GitHub, Google Sheets, Google Apps Script).
- Decisões já tomadas com o usuário (não reabrir sem motivo forte):
  - **Stack:** Next.js (React), deploy na Vercel, repositório no GitHub.
  - **Banco de dados:** Google Sheets. Sem banco relacional/SQL.
  - **Escrita no Sheets:** via **Google Apps Script Web App** publicado como endpoint HTTP (não usar Service Account/Google Cloud — mais simples e 100% grátis).
  - **Idiomas na v1:** Português e Inglês (seletor no topo).
  - **Ícones dos apps:** biblioteca de ícones prontos (Lucide), selecionável visualmente no painel admin — sem upload de imagem na v1.
  - **Autenticação admin:** senha única (não é sistema de contas de usuário). A senha inicial é definida fora do repositório (variável de ambiente na Vercel / valor na planilha) — nunca escrever o valor literal em nenhum arquivo versionado. O admin deve poder trocar a senha dentro do próprio modo admin.

## Estrutura da interface
- **Sem sidebar.** Apenas uma **top bar** fixa contendo:
  - Nome "Portal Q" bem visível/destacado.
  - Campo de busca (lupa) para filtrar aplicativos por nome.
  - Alternância de modo escuro/claro.
  - Seletor de idioma (PT/EN).
  - Opção "Entrar como administrador" (pede senha) → alterna para **modo admin**.
- **Tela inicial:** ao carregar, já exibe a grade completa de cartões de aplicativos (sem cliques extras, sem menus escondidos).
- **Modo normal (padrão para todos):** apenas visualiza e clica nos cartões.
- **Modo admin (após senha correta):**
  - Editar nome, link e ícone de cada aplicativo.
  - Adicionar/remover aplicativos.
  - Reordenar aplicativos (ordem de exibição).
  - Trocar a senha de administrador.

## Tecnologias
- **Framework:** Next.js (React), TypeScript.
- **Estilo:** CSS minimalista/profissional (Tailwind é aceitável), sem bibliotecas de UI "pesadas" ou visualmente carregadas. Inspiração de paleta e tom: siges-app e Hisense Ações.
- **Ícones:** Lucide React (ou equivalente gratuito).
- **Dados:** Google Sheets (planilha com uma aba de aplicativos: nome, link, ícone, ordem, categoria opcional; e uma aba/valor para a senha admin, se aplicável).
- **Integração de escrita:** Google Apps Script Web App (doGet/doPost) publicado a partir da própria planilha.
- **Hospedagem:** Vercel (free tier).
- **Repositório:** GitHub.
- **Sem servidor próprio, sem banco SQL, sem serviços pagos.**

## Etapas do projeto (ordem de execução)

> **Regra crítica de execução:** cada etapa abaixo deve ser realizada **separadamente**. Ao concluir uma etapa, pare e aguarde a autorização explícita do usuário antes de iniciar a próxima. Nunca avance etapas automaticamente, mesmo que pareça óbvio que a próxima é necessária. Se a etapa gerar dúvidas que mudam o resultado, pergunte antes de implementar.

1. **Setup do projeto** — criar app Next.js + TypeScript, repositório GitHub, projeto Vercel conectado, estrutura de pastas inicial.
2. **Planilha Google Sheets + Apps Script** — definir estrutura da planilha (colunas), publicar o Apps Script Web App como endpoint de leitura/escrita, testar manualmente os endpoints (GET/POST).
3. **Design system e layout base** — top bar, tipografia, paleta de cores (clara/escura), grid de cartões vazio, sem dados ainda.
4. **Camada de dados** — buscar aplicativos da planilha via endpoint do Apps Script, exibir na grade, tratar loading/erro.
5. **Busca (lupa)** — filtro de aplicativos por nome em tempo real.
6. **Modo escuro/claro** — alternância persistente (preferência salva no navegador).
7. **Internacionalização (PT/EN)** — seletor de idioma no topo, textos da interface traduzidos.
8. **Autenticação de administrador** — modal/tela de senha, sessão local de "modo admin", proteção das ações de escrita.
9. **Painel admin — CRUD de aplicativos** — adicionar, editar, remover aplicativos; seleção de ícone via biblioteca Lucide.
10. **Painel admin — reordenação** — drag-and-drop (ou setas) para definir a ordem de exibição, persistido na planilha.
11. **Painel admin — troca de senha** — fluxo para o admin alterar a senha padrão.
12. **Deploy e QA final** — variáveis de ambiente na Vercel, teste end-to-end em produção, checklist de aceite.
13. *(Opcional/futuro, só com pedido explícito)* — categorias/tags de apps, favoritos, contagem de cliques, múltiplos administradores.

## Modelo e nível de esforço recomendados por etapa

> **Antes de iniciar qualquer etapa, lembrar o usuário do modelo e do esforço recomendados em uma única linha, sem justificativa** (ex.: "Etapa 2 — Opus, esforço alto."). O usuário ajusta o modelo antes de autorizar.

Já validados e apresentados ao usuário no planejamento em chat (ver histórico da conversa). Resumo:
- **Decisões de arquitetura e segurança (etapas 1, 2, 8, 11):** Opus, esforço alto — decisões difíceis de reverter depois (estrutura de dados, senha, exposição de endpoints).
- **Construção de UI e integração mecânica (etapas 3, 4, 5, 6, 9, 10):** Sonnet, esforço médio/alto — bom equilíbrio custo/qualidade para código de produto.
- **Tarefas mecânicas/repetitivas (etapa 7 - traduções, textos):** Sonnet ou Haiku, esforço baixo.
- **Deploy/QA (etapa 12):** Sonnet, esforço médio; escalar para Opus se surgir bug difícil de diagnosticar.
- Trocar para Opus/esforço alto sempre que: envolver segurança (senha, endpoints públicos), uma decisão que será cara de desfazer depois, ou o Sonnet falhar 2x seguidas na mesma tarefa.

## Regras e restrições
- Não usar serviços pagos. Se uma ferramenta gratuita tiver limite relevante (ex.: cota do Apps Script), avisar o usuário antes de depender dela.
- Não introduzir banco de dados SQL/NoSQL adicional — Google Sheets é a única fonte de dados de aplicativos.
- Não adicionar sidebar, menus ocultos ou navegação por múltiplas páginas para o uso comum — a home deve mostrar tudo de imediato.
- Visual: manter minimalismo e sobriedade (sem cores vibrantes, sem animações chamativas, sem gradientes pesados). Antes de estilizar, é aceitável olhar rapidamente siges-app e Hisense Ações como referência, sem copiar código proprietário desses projetos.
- Senha de administrador nunca deve ficar hardcoded em texto visível no client-side final; tratar como segredo mesmo sendo um valor único.
- Push para o GitHub e deploy em produção na Vercel só devem ocorrer mediante confirmação explícita do usuário, etapa por etapa.
- Não iniciar uma etapa da lista acima sem autorização do usuário, mesmo que a etapa anterior tenha sido concluída com sucesso.

## Regras do framework
Ver também `AGENTS.md` na raiz: este projeto usa **Next.js 16.3.1**, que tem convenções diferentes de versões anteriores. Antes de escrever código de rota, layout ou API, consultar a documentação local em `node_modules/next/dist/docs/`.

## Padrões de trabalho
- Responder em português.
- Antes de codificar algo com impacto significativo (estrutura de dados, fluxo de auth, contrato do Apps Script), alinhar rapidamente com o usuário se houver ambiguidade.
- Preferir simplicidade: não construir abstrações para necessidades hipotéticas futuras.
- Cada etapa deve terminar com uma forma clara de verificação (visual no navegador, teste manual do endpoint, etc.) antes de ser considerada concluída.

## Critérios de conclusão do projeto (v1)
- Portal acessível publicamente via URL da Vercel.
- Tela inicial mostra todos os aplicativos como cartões clicáveis, cada um abrindo em nova aba.
- Busca por nome funcional.
- Modo escuro/claro funcional.
- Seletor PT/EN funcional.
- Login de admin funcional com a senha configurada.
- Admin consegue adicionar, editar, remover e reordenar aplicativos, e as mudanças persistem na planilha Google Sheets e refletem para todos os visitantes.
- Admin consegue trocar a senha padrão.
- Nenhuma credencial sensível exposta no código-fonte do repositório público.
