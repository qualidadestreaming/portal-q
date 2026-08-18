/**
 * Portal Q — gera o hash da senha de administrador.
 *
 * Uso:
 *   npm run hash:password
 *
 * Serve para o primeiro acesso (bootstrap) ou para recuperação, se a senha
 * for esquecida. No dia a dia, quem já está logado troca a própria senha
 * pelo ícone de chave ao lado de "Modo administrador" (Etapa 11) — sem
 * precisar deste script nem editar a planilha à mão.
 *
 * O valor impresso vai na planilha, aba `config`, chave `admin_password_hash`.
 * A senha em texto puro não é gravada em nenhum arquivo nem no repositório.
 *
 * Formato: scrypt$<salt-hex>$<hash-hex>  (N=16384, r=8, p=1, 32 bytes)
 * O mesmo formato é lido pela verificação de senha (Etapa 8) e gerado pela
 * troca de senha pela UI (Etapa 11, ver MIN_PASSWORD_LENGTH em admin-auth.ts).
 */

import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline';

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 32 };

function hash(password) {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question('Senha de administrador: ', (password) => {
  rl.close();
  const senha = password.trim();

  if (senha.length < 8) {
    console.error('\nSenha muito curta: use ao menos 8 caracteres.\n');
    process.exit(1);
  }

  console.log('\nCole este valor na planilha (aba config, chave admin_password_hash):\n');
  console.log(hash(senha));
  console.log('\nNão guarde a senha em texto puro em nenhum arquivo do projeto.\n');
});
