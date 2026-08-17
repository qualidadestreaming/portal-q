# Etapa 2 — Planilha Google Sheets + Apps Script

Documento de referência da camada de dados do Portal Q: como a planilha é
organizada, como o endpoint funciona e como publicá-lo. Guarde este arquivo —
ele é o que permite recriar o backend do zero se a planilha for perdida.

---

## 1. Estrutura da planilha

Uma única planilha, chamada por exemplo **`Portal Q — Dados`**, com duas abas.

### Aba `apps`

| Coluna | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | texto | gerado | UUID criado pelo script. Nunca editar à mão. |
| `name` | texto (≤60) | sim | Nome do aplicativo no cartão. Não é traduzido (é nome próprio: SIGES, Hisense Ações…). |
| `url` | texto (≤500) | sim | Link de destino. Só `http://` ou `https://`. |
| `icon` | texto (≤40) | não | Nome do ícone Lucide em kebab-case (ex.: `layout-dashboard`). Vazio vira `app-window`. |
| `description_pt` | texto (≤120) | não | Legenda curta do cartão em português. |
| `description_en` | texto (≤120) | não | Mesma legenda em inglês. |
| `category` | texto (≤40) | não | Reservado para agrupamento futuro (etapa 13). Não usado na v1. |
| `order` | número | gerado | Posição de exibição, base 1. Gerenciado pela ação `reorderApps`. |
| `active` | TRUE/FALSE | gerado | `FALSE` esconde o app sem apagar o registro. |
| `updated_at` | texto | gerado | Data/hora ISO da última alteração. Coluna formatada como texto puro. |

**Por que o nome não é traduzido e a descrição é:** os sistemas têm nomes
próprios, que não mudam com o idioma. O que muda é a frase explicativa.

### Aba `config`

Duas colunas, `key` e `value`:

| `key` | `value` |
|---|---|
| `admin_password_hash` | Hash scrypt da senha de admin (ver seção 5). |
| `schema_version` | Versão do formato de dados (`1.0.0`). |

> **A planilha precisa ficar privada.** A aba `config` guarda o hash da senha.
> Não compartilhe com "qualquer pessoa com o link" e não use
> *Arquivo > Compartilhar > Publicar na web*.

---

## 2. Contrato do endpoint

Um único Web App atende tudo. **Toda operação é `POST`** com corpo JSON:

```json
{ "token": "<segredo>", "action": "<nome>", "payload": { } }
```

Resposta sempre em JSON:

```json
{ "ok": true,  "data": { } }
{ "ok": false, "error": "mensagem" }
```

> O Apps Script sempre responde **HTTP 200**, inclusive em erro. Quem consome
> deve checar o campo `ok`, nunca o status HTTP.

### Ações

| `action` | `payload` | Retorno |
|---|---|---|
| `health` | — | `{ service, version }` |
| `listApps` | `{ includeInactive?: boolean }` | `{ apps: App[] }` já ordenado por `order` |
| `createApp` | `{ name, url, icon?, description_pt?, description_en?, category?, active? }` | `{ app }` |
| `updateApp` | `{ id, ...campos a alterar }` | `{ app }` — campos omitidos são preservados |
| `deleteApp` | `{ id }` | `{ id }` |
| `reorderApps` | `{ ids: string[] }` | `{ apps }` — a posição no array vira o `order` |
| `getConfig` | `{ key }` | `{ value }` |
| `setConfig` | `{ key, value }` | `{ key }` |

Além disso, existe **um** `GET` sem token, para teste de vida:
`<URL>?action=health`. Qualquer outro `GET` é recusado.

### Decisões de segurança

- **O Web App é público** ("Qualquer pessoa"), porque o servidor da Vercel
  chama sem login Google. Por isso o token é obrigatório em toda ação — sem
  ele, o endpoint não faz nada.
- **O token vai no corpo do POST, não em cabeçalho.** O Apps Script responde
  com redirect para `script.googleusercontent.com`, e cabeçalhos de autorização
  são descartados no caminho.
- **O token nunca chega ao navegador.** Só o servidor do Next.js (Server
  Components e API Routes) fala com o Apps Script. Nenhuma variável usa o
  prefixo `NEXT_PUBLIC_`.
- **Chamada direta do navegador não funciona** — o Apps Script não envia
  cabeçalhos CORS. Isso é intencional: reforça que todo acesso passa pelo
  servidor.
- **URLs são validadas na escrita:** `javascript:`, `data:` e afins são
  recusados, porque o valor termina em um `href` renderizado no cartão.
- **Nomes de ícone são validados** (`^[a-z0-9-]{1,40}$`), já que o valor é usado
  como chave de busca na biblioteca de ícones.
- **Escritas são serializadas** com `LockService`, evitando que dois salvamentos
  simultâneos corrompam linhas.

---

## 3. Publicação do Apps Script (passo a passo)

1. Crie a planilha no Google Sheets e dê o nome **`Portal Q — Dados`**.
2. Na planilha: **Extensões > Apps Script**. Isso cria um script *vinculado* à
   planilha — é o que permite ao código usar `SpreadsheetApp.getActive()`.
3. Apague o conteúdo do arquivo `Código.gs` e cole todo o conteúdo de
   [`google-apps-script/Code.gs`](../google-apps-script/Code.gs). Salve.
4. Gere o token, rodando no terminal do projeto:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. No editor do Apps Script: **⚙ Configurações do projeto > Propriedades do
   script > Adicionar propriedade**
   - Propriedade: `PORTAL_Q_TOKEN`
   - Valor: o token gerado no passo 4

   *(O token fica só aqui e na Vercel — nunca no código.)*
6. Volte ao editor, selecione a função **`setup`** na lista e clique em
   **Executar**. Autorize o acesso quando o Google pedir (é sua própria
   planilha; a tela de "app não verificado" é esperada — avance em *Avançado >
   Ir para…*). Isso cria as abas `apps` e `config` com os cabeçalhos.
7. **Implantar > Nova implantação > Tipo: App da Web**
   - Descrição: `v1`
   - **Executar como: Eu**
   - **Quem tem acesso: Qualquer pessoa**
   - Clique em *Implantar* e copie a **URL do app da Web** (termina em `/exec`).

> **A cada alteração no `Code.gs`**, use *Implantar > Gerenciar implantações >
> ✏️ editar > Versão: Nova versão*. Se você criar uma implantação nova em vez de
> versionar a existente, a URL muda e é preciso atualizar a variável de
> ambiente.

---

## 4. Configuração local e teste

1. Copie `.env.example` para `.env.local` e preencha:

   ```
   PORTAL_Q_SHEETS_ENDPOINT=https://script.google.com/macros/s/.../exec
   PORTAL_Q_SHEETS_TOKEN=<o mesmo token do passo 4 acima>
   ```

2. Teste só a leitura (não altera a planilha):

   ```bash
   npm run test:endpoint
   ```

3. Teste o ciclo completo de escrita. Ele cria um app `[TESTE] Portal Q`,
   edita, reordena, apaga e restaura a ordem original:

   ```bash
   npm run test:endpoint -- --write
   ```

O teste também verifica o que **deve** falhar: token errado, ausência de token,
ação inexistente, URL `javascript:`, app sem nome e ícone com formato inválido.

---

## 5. Senha de administrador

A senha **não** fica no código nem em variável de ambiente — ela precisa ser
trocável pelo próprio admin (etapa 11), então mora na planilha, como hash.

1. Gere o hash:

   ```bash
   npm run hash:password
   ```

2. Cole o valor na aba `config`, linha `admin_password_hash`.

Formato: `scrypt$<salt-hex>$<hash-hex>` (N=16384, r=8, p=1, 32 bytes). A
verificação acontece no servidor na etapa 8; a senha em texto puro nunca é
gravada em arquivo nem enviada ao navegador.

---

## 6. Limites do plano gratuito

O Apps Script em conta Google comum tem cotas diárias. As relevantes aqui:

- **~20.000 chamadas/dia** ao Web App
- **90 minutos/dia** de tempo total de execução
- **6 minutos** por execução (irrelevante: nossas chamadas levam ~1s)

Para um portal interno isso é folgado, **desde que a leitura seja cacheada**.
Sem cache, uma página vista 50 vezes por dia por 30 pessoas já são 1.500
chamadas. Na etapa 4 a leitura será cacheada no servidor do Next.js
(revalidação por tempo), o que derruba isso para poucas chamadas por hora.
Escritas (painel admin) são raras e vão sempre direto ao endpoint.

Se a cota for excedida, o endpoint passa a responder erro até o dia seguinte —
motivo pelo qual a etapa 4 precisa tratar falha de leitura sem quebrar a tela.
