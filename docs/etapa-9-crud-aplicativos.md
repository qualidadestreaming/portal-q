# Etapa 9 — CRUD de aplicativos

O admin adiciona, edita e remove aplicativos **na própria home**: não há rota
`/admin`. Ligada a sessão, os cartões ganham dois botões no canto e aparece
"Adicionar aplicativo" acima da grade.

## Onde está o portão

```
navegador                       servidor
---------                       --------
clica em Salvar  ──▶  saveAppAction (Server Action)
                      │
                      ├─ 1. valida os campos (mensagem imediata, sem ir à planilha)
                      ├─ 2. requireAdmin()   ◀── AQUI. Antes de qualquer escrita.
                      ├─ 3. createApp / updateApp  ──▶  Apps Script  ──▶  planilha
                      └─ 4. updateTag("apps")
```

Os botões de editar/remover são enfeite. Quem decide é o `requireAdmin()`:
forjar o estado de admin no navegador rende botões que não gravam nada.

**Regra para as próximas etapas:** toda ação que escreve começa com
`await requireAdmin()`. Sem exceção.

## Por que `updateTag` e não `revalidateTag`

`getApps()` é cacheado por 5 minutos. Depois de gravar, o cache precisa cair,
senão o admin salva e continua vendo o valor antigo.

- `revalidateTag("apps", "max")` serve o dado velho enquanto busca o novo por
  trás. Ótimo para catálogo público, péssimo para quem acabou de salvar.
- `updateTag("apps")` faz a requisição seguinte esperar o dado fresco. É o
  caso "ler a própria escrita", que é o nosso. Só vale dentro de Server Action.

## Peças

| Arquivo | Papel |
| --- | --- |
| `src/lib/app-schema.ts` | Tipos, limites e validação. **Sem** `server-only`: o formulário usa os limites nos `maxLength`. |
| `src/lib/app-actions.ts` | Server Actions `saveAppAction` / `deleteAppAction`. |
| `src/lib/icon-catalog.ts` | 92 ícones Lucide em 7 grupos, gerado com validação contra os exports reais. |
| `src/components/AppFormDialog.tsx` | Formulário único de criar/editar (com `id` = editar). |
| `src/components/IconPicker.tsx` | Escolha visual do ícone, com filtro. |
| `src/components/AppCardAdminControls.tsx` | Editar/remover + confirmação de remoção. |
| `src/components/AddAppButton.tsx` | "Adicionar aplicativo"; some para visitantes. |

## Detalhes que custaram bug

**Ícone não atravessa a fronteira servidor → cliente.** `AppCard` (servidor)
resolve o ícone e passa o **elemento já renderizado**, não o componente:
funções não são serializáveis. Passar o componente lança
`Functions cannot be passed directly to Client Components`. Esse defeito ficou
latente desde a Etapa 7 — com a planilha vazia, nenhum cartão era renderizado,
então nada acusava. O primeiro app cadastrado revelou.

**Os controles ficam fora do `<a>`.** Aninhados dentro dele, clicar em "editar"
abriria também o link do cartão. Ficam como irmãos, posicionados sobre o
cartão.

**Validação duplicada, de propósito.** `app-schema.ts` repete as regras do
Apps Script para dar erro na hora, em vez de uma ida de ~2s à planilha para
ouvir não. O Apps Script continua sendo a defesa; a daqui é conveniência.

**Erros são códigos, não texto.** As actions devolvem `AppErrorCode`; a
tradução acontece no cliente, no idioma ativo. Retornar texto pronto mostraria
português numa sessão em inglês.

## Só 92 ícones

O Lucide tem 2025. Um seletor com dois mil ícones não ajuda ninguém a decidir,
e imports estáticos de um conjunto fechado evitam 92 carregamentos preguiçosos
ao abrir o formulário. Para acrescentar um ícone, edite `ICON_GROUPS` e
`ICON_CATALOG` — o nome precisa existir no `lucide-react` e estar em kebab-case
(é o formato que o `normalizeIcon_` do Apps Script aceita).

## O que foi verificado

Ciclo completo contra a planilha real: criar (gravou com ícone e `order`
certos), ler (cartão com ícone, link em nova aba, `noopener`, descrição),
editar (nome e ícone trocados, refletiu **sem recarregar** — prova do
`updateTag`), remover (confirmação nomeia o app; cancelar não remove; confirmar
apaga da planilha e da grade).

No nível do protocolo, 7 verificações de quem o servidor considera admin:
cookie válido entrega a interface de admin; ausente, assinatura forjada, token
expirado, assinado com outro segredo, vazio e lixo entregam a de visitante.

Com o app real na planilha, o HTML confirma a separação: visitante recebe o
cartão sem os botões de admin; admin recebe os mesmos dados com eles.

**Não verificado:** uma chamada HTTP crua à Server Action devolvendo
`sessionExpired`. O servidor de desenvolvimento recusa invocação externa de
action ("Server action not found") mesmo com o id correto, então o teste não
fecha por esse caminho. O que sustenta o portão é o item anterior (as 7
verificações do `isAdmin()`, que é a função que o `requireAdmin()` chama) mais
a posição da chamada no código.
