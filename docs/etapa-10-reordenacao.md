# Etapa 10 — Reordenação

Setas de mover para cima/baixo em cada cartão, visíveis só em modo admin.
Escolhi setas em vez de arrastar-e-soltar: mesmo resultado, sem biblioteca
nova e com acessibilidade de teclado de graça — coerente com o restante do
projeto, que evita UI pesada.

## Como funciona

```
clica na seta  ──▶  moveApp(id, "up"|"down")   (ReorderProvider, client)
                     │
                     ├─ troca o item com o vizinho na lista de ids em memória
                     └─ reorderAppsAction(ids)  (Server Action)
                            │
                            ├─ valida a forma do array (entrada não confiável:
                            │  a action é chamada por onClick, não por <form>)
                            ├─ requireAdmin()
                            ├─ reorderApps(ids)  ──▶  Apps Script  ──▶  planilha
                            └─ updateTag("apps")
```

`reorderApps_` no Apps Script (Etapa 2) já aceita a lista completa de ids na
ordem desejada e grava 1..n — esta etapa só precisava do lado do Next.

## Por que sem estado otimista

`updateTag("apps")` já traz a UI atualizada no mesmo round-trip da Server
Action (confirmado na doc local: "the response... includes both the action's
return value... and a newly rendered RSC Payload"). Adicionar estado otimista
por cima duplicaria o que o framework resolve sozinho, com risco de os dois
divergirem caso a escrita falhe depois do otimismo já ter mudado a tela.

## Chamada direta, não por formulário

Diferente de salvar/editar/remover (que usam `<form action={...}>`), mover é
`onClick` chamando a Server Action diretamente, dentro de `useTransition`. É
um padrão documentado (Event Handlers, em app/getting-started/mutating-data),
mas muda o que a action pode confiar: sem `FormData`, o `ids: unknown` chega
exatamente como veio da rede. `reorderAppsAction` valida a forma (array de
strings não vazias, com teto de sanidade) antes de tocar em qualquer coisa —
a doc de segurança dos Server Actions é explícita: toda action é um endpoint
POST alcançável direto, formulário ou não.

## O que foi verificado

Ciclo completo contra a planilha real, com dois apps: mover "para baixo"
trocou a ordem na tela **e** persistiu na planilha (`order=1`/`order=2`
confirmados por leitura direta do endpoint); os limites (seta desabilitada no
primeiro/último item) recalcularam certo depois da troca. Visitante recebe o
HTML sem nenhum botão de mover, editar ou remover — só admin os vê.

**Não verificado por chamada HTTP crua:** mesma limitação da Etapa 9 (o
servidor de dev recusa invocação externa de Server Action mesmo com o id
certo). O portão desta action é literalmente o mesmo `requireAdmin()` já
verificado 7 vezes na Etapa 8 e reusado sem alteração aqui.
