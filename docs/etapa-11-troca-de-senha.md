# Etapa 11 — Troca de senha

O admin troca a própria senha sem sair do portal: ícone de chave ao lado do
crachá "Modo administrador", pede a senha atual e a nova (duas vezes).

## Como funciona

```
clica no ícone de chave  ──▶  ChangePasswordDialog abre
digita atual + nova + confirmação
                    │
                    ▼
        changePasswordAction (Server Action)
                    │
                    ├─ requireAdmin() — precisa já estar logado
                    ├─ valida forma (campos vazios, senha nova curta,
                    │  confirmação bate) — tudo isso sem tocar a planilha
                    ├─ freio de tentativas (5/10min, chave "changepw:<ip>",
                    │  independente do freio de login)
                    ├─ confere a senha ATUAL contra o hash de agora
                    ├─ grava o novo hash via setConfig
                    └─ updateTag("admin-config") — invalida o cache de 60s
                       na hora, senão a senha nova só valeria depois desse
                       intervalo
```

## Por que pedir a senha atual, se a sessão já prova quem é admin

Um cookie de sessão comprometido — aba esquecida aberta numa máquina
compartilhada, valor do cookie vazado — não deveria bastar sozinho para
sequestrar o portal. Exigir a senha atual é a defesa específica contra esse
cenário: quem só tem o cookie, sem saber a senha, não consegue trocá-la.

Por isso também o freio de tentativas tem chave própria (`changepw:<ip>`),
independente do freio de login: sem ele, um cookie roubado viraria uma via de
força bruta contra a senha atual sem precisar logar de novo a cada tentativa.

## Peças

| Arquivo | Papel |
| --- | --- |
| `src/lib/admin-auth.ts` | Ganhou `hashPassword()` (mesmo formato/parâmetros de `verifyPassword`) e `MIN_PASSWORD_LENGTH`. |
| `src/lib/admin-password-actions.ts` | `changePasswordAction`. |
| `src/lib/client-key.ts` | `clientKey()` extraído de `admin-actions.ts` — login e troca de senha usam o mesmo identificador de IP. |
| `src/components/ChangePasswordDialog.tsx` | Formulário + confirmação de sucesso. |
| `src/components/AdminButton.tsx` | Ícone de chave, só em modo admin. |

## O que muda para quem já estava logado

Trocar a senha **não** desconecta a sessão atual — o cookie de sessão não
deriva da senha, só do `PORTAL_Q_SESSION_SECRET`. A sessão em uso continua
válida até expirar (até 8h); a senha nova só é exigida no **próximo** login.
Isso é dito explicitamente na tela de sucesso, para não surpreender ninguém.

Continua valendo a limitação já documentada na Etapa 8: não existe revogação
de sessão por sessão. Se uma sessão específica precisar ser derrubada na
hora, o único jeito é trocar `PORTAL_Q_SESSION_SECRET`, o que invalida
**todas** as sessões abertas — inclusive a de quem está trocando a senha.

## Como isto foi verificado sem tocar a senha real

Trocar senha é sensível demais para testar direto em produção: se algo
falhasse entre gravar um valor temporário e restaurar o original, a senha
real ficaria substituída por um valor desconhecido, trancando o admin fora do
próprio portal. Nada disto foi feito. Em vez disso:

- **Validação de forma** (senha nova curta, confirmação divergente): essas
  checagens rodam **antes** de qualquer consulta à planilha, então testá-las
  não arrisca nada. Confirmado que o servidor recusa mesmo contornando o
  `minlength` do HTML (defesa em profundidade: a Server Action é um POST
  alcançável direto, formulário ou não).
- **Senha atual errada**: testada com valores certamente incorretos.
  Confirmado que a planilha não foi tocada (hash antes/depois idêntico,
  104 caracteres, mesmo prefixo `scrypt`) e que o freio de tentativas
  dispara na 6ª tentativa errada — com chave própria, sem interferir no
  freio do login.
- **Caminho de escrita** (`setConfig`): testado de ponta a ponta — rede,
  token, cota — contra uma chave de configuração isolada
  (`_etapa11_teste_escrita`, depois esvaziada), nunca `admin_password_hash`.
- **Contrato de criptografia**: 8 verificações isoladas de `hashPassword()`
  contra `verifyPassword()` (formato do hash, salt aleatório a cada chamada,
  sensibilidade a maiúsculas/espaços, cadeia de 5 trocas sucessivas
  invalidando sempre a anterior).
- Confirmado que a sessão de teste seguiu ativa depois de todas as
  tentativas malsucedidas, e que o visitante (sem cookie) não recebe o botão
  de trocar senha no HTML.

**Não verificado:** uma troca de senha bem-sucedida de ponta a ponta contra a
planilha real. Isso só você pode fazer com segurança, porque só você sabe a
senha atual de verdade.
