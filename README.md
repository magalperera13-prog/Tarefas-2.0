# Minhas Tarefas

Painel pessoal de tarefas com histórico mensal automático, com **acesso restrito a um único proprietário**. Next.js + TypeScript + Tailwind CSS + Supabase, pronto para deploy na Vercel.

## O que o sistema faz

- **Tarefas do dia**: adicione, conclua, edite e exclua tarefas do dia atual. Cada tarefa registra automaticamente data e horário de criação e de conclusão.
- **Virada de dia automática**: não existe nenhuma tarefa agendada (cron) para "mover" dados. Cada tarefa guarda o dia (`task_date`) ao qual pertence, calculado no fuso **America/Sao_Paulo**. A tela inicial mostra apenas as tarefas de `task_date = hoje`; assim que o dia vira, essas mesmas tarefas passam a aparecer automaticamente no histórico — concluídas ou não. Nada é apagado.
- **Pendências atrasadas**: tarefas não concluídas de dias anteriores continuam aparecendo na tela Hoje, numa área separada "Pendentes", até serem concluídas — mesmo assim, elas continuam registradas no histórico do dia original.
- **Descrição opcional por tarefa**: clique numa tarefa (ou no ícone de lápis) para anotar, por exemplo, por que ela ainda não foi feita.
- **Histórico mensal**: navegação entre meses, agrupado por dia, com pesquisa por texto (título e descrição) e filtro por status (todas / concluídas / pendentes).
- **Gastos**: uma aba separada para registrar despesas do dia, com total de hoje, total do mês e média de gasto por dia, também navegável por mês.
- **Acesso restrito a um único proprietário** (veja a seção de segurança abaixo) — não há cadastro público, nem rota `/register`, nem convite de usuários.
- **Atalho `Ctrl+K`** foca a pesquisa na tela de histórico.

## Estrutura do projeto

```
app/
  page.tsx                → tela "Hoje" (protegida, só o proprietário)
  login/page.tsx           → tela de login (e-mail + senha, sem cadastro)
  reset-password/page.tsx  → definir nova senha a partir do link de recuperação
  history/page.tsx         → tela de histórico (protegida)
  expenses/page.tsx        → tela de Gastos (protegida)
  layout.tsx               → layout raiz, fontes, ToastProvider
components/
  LoginForm.tsx             → formulário de login e "esqueci minha senha"
  ...                        → demais componentes de tarefas e histórico
lib/
  date.ts                   → toda a lógica de fuso horário (America/Sao_Paulo)
  types.ts                  → tipos compartilhados
  authorized-email.ts        → checagem "este e-mail é o do proprietário?"
  auth.ts                    → requireOwner(), usado nas páginas protegidas
  supabase/                  → clients Supabase (browser, server, middleware)
proxy.ts                     → protege rotas e derruba sessões não autorizadas
supabase/schema.sql          → script completo do banco (tabela, índices, RLS)
```

## Segurança de acesso — como o "somente eu" é aplicado

Este não é apenas um botão de cadastro escondido. Há três camadas independentes:

1. **Sem rota de cadastro**: a aplicação nunca chama `supabase.auth.signUp()` e não existe página `/register`. A única forma de criar a conta é manualmente no painel do Supabase (passo 1 abaixo).
2. **Cadastro público desligado no próprio Supabase**: mesmo que alguém chame a API do Supabase diretamente (fora da interface), o próprio servidor de autenticação recusa a criação de novos usuários, porque essa opção fica desligada no projeto (passo 1 abaixo).
3. **Allowlist de e-mail no servidor**: o e-mail autorizado fica em `AUTHORIZED_EMAIL`, uma variável de ambiente **sem** o prefixo `NEXT_PUBLIC_` — portanto nunca é enviada ao navegador nem aparece em nenhum arquivo do código-fonte. Toda requisição passa pelo `proxy.ts` (middleware) e por `requireOwner()` nas páginas, que comparam o e-mail da sessão autenticada com `AUTHORIZED_EMAIL`. Se alguém, de algum jeito, conseguisse autenticar com outro e-mail, a sessão é encerrada automaticamente e a pessoa volta para `/login` com a mensagem "Este acesso não está autorizado."

Além disso, o **Row Level Security** do Supabase (em `supabase/schema.sql`) garante que, mesmo que a checagem de e-mail falhasse, ninguém além do dono da tarefa conseguiria ler, criar, editar ou excluir tarefas — essa regra vive no banco, não na interface.

A senha nunca é comparada no código (nada como `if (senha === "...")`); toda a validação de senha é feita pelo Supabase Auth.

## Atualizando um projeto Supabase que você já criou

Se você já rodou uma versão anterior de `supabase/schema.sql`, é só rodar o arquivo atual de novo no SQL Editor — ele é seguro de repetir (idempotente) e vai só adicionar o que falta: a coluna `description` em `tasks` e a tabela `expenses` com suas políticas de segurança.

## 1. Criar o projeto no Supabase e a conta do proprietário

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto (grátis).
2. No painel do projeto, vá em **SQL Editor** → **New query**, cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
   - Isso cria a tabela `tasks`, os índices, o trigger de `updated_at` e as políticas de Row Level Security.
3. **Desligue o cadastro público**: vá em **Authentication → Providers → Email** (em alguns painéis: **Authentication → Sign In / Providers**) e desative a opção **"Allow new users to sign up"** (também pode aparecer como "Enable Sign ups"). Salve.
4. **Crie a sua conta manualmente**: vá em **Authentication → Users → Add user → Create new user**. Preencha com o seu e-mail e uma senha.
   - Se você usou a senha que compartilhou nesta conversa para criar a conta agora, troque-a assim que possível pela tela "Esqueci minha senha" do próprio app — como ela foi escrita em texto simples aqui, é mais seguro não mantê-la como definitiva.
   - Marque a opção de "Auto Confirm User" (ou equivalente) se disponível, para não depender de e-mail de confirmação.
5. Vá em **Authentication → URL Configuration** e configure:
   - **Site URL**: a URL do seu site (ex.: `https://seu-projeto.vercel.app`; use `http://localhost:3000` em desenvolvimento).
   - **Redirect URLs**: adicione `http://localhost:3000/reset-password` (dev) e `https://seu-projeto.vercel.app/reset-password` (produção) — necessário para o link de "esqueci minha senha" funcionar.
6. Vá em **Project Settings → API** e copie a **Project URL** e a **anon public key**.

## 2. Configurar as variáveis de ambiente

Copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

Preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
AUTHORIZED_EMAIL=seu-email@exemplo.com
NEXT_PUBLIC_OWNER_NAME=Magal
```

`AUTHORIZED_EMAIL` precisa ser exatamente o e-mail da conta criada no passo 1.4. `NEXT_PUBLIC_OWNER_NAME` só controla a saudação "Olá, Magal 👋" no painel — não é sensível.

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) e entre com o e-mail e a senha da conta criada no Supabase.

## 4. Deploy na Vercel

1. Suba este projeto para um repositório no GitHub (ou GitLab/Bitbucket) — o `.gitignore` já exclui `.env.local`, então nenhum segredo vai para o repositório.
2. Em [vercel.com](https://vercel.com), clique em **Add New → Project** e importe o repositório.
3. A Vercel detecta Next.js automaticamente.
4. Em **Environment Variables**, adicione as quatro variáveis do `.env.local` (incluindo `AUTHORIZED_EMAIL`, sem prefixo `NEXT_PUBLIC_`).
5. Clique em **Deploy**.
6. Volte no Supabase (**Authentication → URL Configuration**) e confirme que a **Site URL** e as **Redirect URLs** apontam para o domínio real da Vercel.
7. Acesse a URL gerada e entre com a conta do proprietário.

## Sobre o fuso horário

Toda a lógica de "qual é o dia de hoje" e de formatação de datas/horários vive em `lib/date.ts` e usa `America/Sao_Paulo` fixo. Está isolado em um único arquivo.

## Sobre a persistência

Todos os dados ficam no Postgres do Supabase, não no navegador. Você pode fechar o site por dias e, ao voltar, o sistema recalcula corretamente o que é "hoje", o que ficou pendente e o que foi concluído — sem nenhum processo manual. A sessão de login também persiste entre visitas (cookies gerenciados pelo Supabase Auth) até que você clique em "Sair".
