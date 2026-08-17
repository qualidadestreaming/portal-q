# Etapa 8 — Autenticação de administrador

Não é um sistema de contas: existe **uma** senha. Quem a digita certo entra em
"modo admin" e passa a ver os controles de edição na própria home.

## Como funciona

```
navegador                    servidor (Vercel)                planilha
---------                    -----------------                --------
digita a senha  ──▶  Server Action loginAdmin
                     │
                     ├─ freio por IP (5 tentativas / 10 min)
                     ├─ lê admin_password_hash  ──────────▶  aba `config`
                     │  (cacheado 60s: rajada não gasta cota)
                     ├─ scrypt(senha) == hash?
                     └─ sim ─▶ grava cookie assinado (HMAC-SHA256, 8h)
                                        │
        cookie HttpOnly  ◀──────────────┘
```

A cada carregamento, `layout.tsx` chama `isAdmin()`, que confere a assinatura e
a validade do cookie. O resultado desce pela árvore via `AdminProvider`.

## Peças

| Arquivo | Papel |
| --- | --- |
| `src/lib/admin-auth.ts` | `server-only`. Verifica senha e assina/valida a sessão. |
| `src/lib/admin-actions.ts` | Server Actions `loginAdmin` / `logoutAdmin`. |
| `src/lib/login-rate-limit.ts` | Freio por IP, em memória. |
| `src/components/AdminProvider.tsx` | Leva o estado de admin aos componentes cliente. |
| `src/components/AdminButton.tsx` | Alterna entre "Administrador" e o crachá + sair. |
| `src/components/AdminLoginDialog.tsx` | Modal da senha. |

## Definir ou trocar a senha (manual, até a Etapa 11)

```bash
npm run hash:password
```

O script pede a senha, imprime `scrypt$<salt>$<hash>` e **não** grava a senha em
lugar nenhum. Cole o valor impresso na planilha, aba `config`, na linha
`admin_password_hash`.

A troca vale em até 60 segundos (o hash fica cacheado nesse intervalo).

Com `admin_password_hash` vazio, ninguém entra — o portal não tem estado de
"primeiro acesso liberado".

## Variável de ambiente nova

`PORTAL_Q_SESSION_SECRET` — mínimo 32 caracteres, aleatória. Assina o cookie;
não é a senha do admin.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Trocar esse valor derruba na hora todas as sessões de admin abertas.** É o que
fazer se desconfiar que um cookie foi roubado. Falta configurar na Vercel
(Etapa 12).

## O que essa etapa garante

- A senha nunca vai ao navegador; o hash tampouco. Só o cookie assinado desce.
- O cookie é `HttpOnly` (JavaScript da página não lê), `SameSite=Lax` e
  `Secure` em produção.
- Cookie forjado ou adulterado não vira sessão: a assinatura não fecha
  (verificado no navegador, e mais 10 casos no teste de contrato).
- Comparações de senha e de assinatura usam `timingSafeEqual`.
- As Server Actions do Next verificam Origin/Host, o que cobre CSRF, e não
  expõem um endpoint público de login.

## Limites conhecidos (assumidos de propósito)

- **O freio de tentativas vive na memória do processo.** Na Vercel isso é "por
  instância" e se perde quando a função hiberna — não segura força bruta
  distribuída. Ele não está sozinho: scrypt custa ~100ms por tentativa e o hash
  cacheado impede que a rajada derrube a cota do Apps Script. Para um portal
  interno com uma senha só, é proporcional. Se um dia virar alvo real, o
  caminho é um limitador com estado compartilhado.
- **Ler o cookie no layout tornou as rotas dinâmicas** (antes a home era
  estática com ISR de 5 min). A alternativa era descobrir o modo admin no
  cliente, e os controles de edição piscariam na tela a cada carregamento. A
  cota do Apps Script não mudou: quem cacheia a leitura da planilha é
  `unstable_cache` em `getApps()`, não o cache de rota.
- **A sessão não é revogável uma por uma.** Sem estado no servidor, só existe
  o botão de sair (apaga o cookie) e a troca do segredo (derruba todas).

## Contrato para as Etapas 9 a 11

Toda ação que escreve na planilha **precisa** começar com `await requireAdmin()`.
O `AdminProvider` governa apenas o que aparece na tela — forjar aquele valor no
navegador rende botões inúteis, não permissão.
