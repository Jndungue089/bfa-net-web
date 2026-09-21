# BFA NET — Web (Next.js 16)

App web do internet banking. **Só fala com a API através dos `rewrites` do Next**: o browser vê uma única origem, o backend nunca é exposto e não há CORS.
Stack: Next 16 (App Router, React 19 + React Compiler), TypeScript, Tailwind CSS v4, **React Hook Form + Zod**, **zustand**, **TanStack Query**, `lucide-react`.

> Esta versão do Next tem mudanças de rotura (p. ex. `middleware` → `proxy.ts`). A documentação da versão instalada está em `node_modules/next/dist/docs/` — ler antes de mexer em convenções do framework.

## Como as peças encaixam

```
Browser ──► Next (proxy.ts: CSP com nonce + porta optimista de sessão)
   │            ├─ páginas (RSC + client components)
   │            └─ rewrites  /api/:path*  ──►  BACKEND_URL/api/:path*   (.NET)
   └─ cookies HttpOnly (bfa_at · bfa_rt · bfa_sess) ─ nunca legíveis por JavaScript
```

- **`next.config.ts`** — `rewrites` para o backend, `redirects` das rotas antigas (`/transfers`, `/payments`), `turbopack.root` no monorepo (necessário porque `apps/web` pode ter o seu próprio `.git`), cabeçalhos de segurança (X-Frame-Options, HSTS, Permissions-Policy (câmara desligada), COOP), `Cache-Control: no-store` em `/api/*`, `productionBrowserSourceMaps: false`, `poweredByHeader: false`, `transpilePackages: ["@bfa/shared"]`.
- **`src/proxy.ts`** — (1) gera um **nonce por pedido** e aplica a CSP (`script-src 'self' 'nonce-…' 'strict-dynamic'`, sem `unsafe-inline` em scripts); (2) **porta optimista**: sem o cookie-sinal `bfa_sess` redireciona para `/login`; com sessão, `/login` e `/register` redirecionam para `/dashboard`. É só UX — o backend valida o JWT em cada chamada. Ignora `/api`, `_next` e ficheiros de imagem. O `RootLayout` lê `headers()` para forçar render dinâmico (necessário para o nonce).
- **Sessão**: cookies definidos pelo backend — `bfa_at` (10 min, `Path=/api`), `bfa_rt` (`Path=/api/v1/auth`), `bfa_sess` (`Path=/`, sem conteúdo). O `store/session` guarda só o perfil (não secreto).
- **CSRF**: o cliente envia `X-BFA-Client: web`; o backend exige-o (e um `Origin` permitido) em pedidos com cookies.
- **Inactividade**: `IdleGuard` termina a sessão após 5 min sem input, com aviso de 30 s (usa relógio real, imune ao *throttling* de separadores em segundo plano).
- **Refresh**: `lib/api.ts` — em 401 o `@bfa/shared` faz **um** refresh (single-flight) e repete; se falhar, `handleExpired` limpa stores/cache e vai a `/login?expired=1`.

## Organização (`src/`)

```
app/
  (auth)/   login · register            layout dividido com o BrandLockup por cima do formulário
  (app)/    layout → AppShell (barra lateral em ≥ lg, barra inferior em telemóvel)
    dashboard/  services/  assistant/  cards/  statement/  transactions/[id]/  profile/(security)  beneficiaries/  contacts/  about/
    services/ payments/(reference) · state · recharges/[provider] · transfers/(iban · kwik/key)
components/
  ui/          primitivas pequenas: Button, TextField, DigitsField, MoneyField, PinField, PasswordField, SelectField,
               Card, Alert, Badge, Modal, Sheet (gaveta inferior), Toggle, Skeleton, Icon (lucide)
  features/    AppShell, BankCard, BalancePanel, ServiceTile/ProviderTile, Receipt/FlowShell, PinConfirmDialog, CardSettingsSheet,
               StatementList, Avatar, BrandLockup, … e forms/ (um formulário por operação)
hooks/         useAuth · useBank (dados + mutações de dinheiro) · useAvatar · useIdleTimeout    ← "hooks first"
lib/           api (cliente), query (QueryClient), about (texto do site, servidor), cn
stores/        session (perfil) · privacy (ocultar saldos, persistido)
proxy.ts
```

### Padrões
- **Formulários**: `useForm` + `zodResolver(schema de @bfa/shared)`; erros do servidor entram por `applyFieldErrors`. Campos numéricos (`DigitsField`) **higienizam ao escrever/colar** (`1234 5678` → `12345678`) em vez de usar `maxlength`.
- **Operações de dinheiro**: formulário → resumo + **PIN** (`PinConfirmDialog`) → mutação com **uma chave de idempotência por intenção** (`useIdempotencyKey`): repetir a mesma confirmação (duplo clique, rede instável) nunca executa duas vezes; a chave roda após veredicto definitivo (4xx). `FlowShell` mostra o recibo e volta a `/services`.
- **Estado do servidor** em TanStack Query (`useBank`); estado de cliente em zustand. Ao sair, `queryClient.clear()` descarta os dados financeiros.
- **Componentes pequenos** e sem lógica de dados; a lógica está nos hooks.
- **Responsivo com `dvh`**: `min-h-dvh` nos layouts, `h-dvh` na barra lateral, gaveta/modais com `max-h-[88dvh]`, `safe-area-inset` na barra inferior, `grid-cols-1` (= `minmax(0,1fr)`) em grelhas com conteúdo truncável para evitar scroll horizontal. Verificado em 390, 820 e 1280 px.
- **Acessibilidade**: `Field` liga `id`/`aria-invalid`/`aria-describedby`; botões só com ícone têm `aria-label`; `<dialog>` nativo (focus trap, Esc).
- **Tipografia**: Times New Roman (raiz a 106,25 % porque a serifada parece pequena); ícones em vez de palavras nas acções secundárias.

### Funcionalidades específicas da web
- **Serviços**: cartão + `BalancePanel` (painel de saldo com ocultar/mostrar) e grelha (serviços, Estado, carregamentos com logos, transferências IBAN/KWiK por chave). **Sem pagamentos por QR na web** (só na app móvel).
- **Cartões**: `BankCard` (CSS, cor primária do BFA) + `CardSettingsSheet` (gaveta que sobe de baixo): canais, limite e bloqueio. **Atualização otimista** (`useUpdateCard`): o controlo tocado muda logo, sem refetch nem desativar os outros; se o pedido falhar, só os campos dessa chamada são revertidos (mudanças concorrentes noutros controlos sobrevivem) e aparece o aviso.
- **Comprovativo**: o recibo e o detalhe da transação descarregam o **PDF emitido pelo backend** (`GET /api/v1/transactions/{id}/receipt.pdf`, ligação `<a download>` autenticada pelo cookie e servida pelo mesmo proxy).
- **Extracto** (`/statement?account=<id>`): conta, período (mês/30/90/personalizado validado com `dateRangeSchema`), sumário e o botão **PDF**, que descarrega o extracto **emitido pelo backend** (`GET /api/v1/accounts/{id}/statement.pdf`). Nada é gerado no browser (sem CSV/impressão). Layout a 2 colunas em telemóvel (3 números não cabiam a 360 px).
- **Valores**: nas listas de movimentos/extracto levam sinal (+/−); no recibo e no detalhe só o valor e o tipo de operação. "Terminar sessão" está a vermelho.
- **Assistente** (`/assistant`): saúde financeira (anel + 4 factores), indicadores (gasto, orçamento diário, taxa de poupança), alertas/sugestões, gráfico de rendimento vs gastos (2 séries validadas, legenda, *tooltip* e vista em tabela), categorias, recorrentes, **Poupar agora** (`SaveDialog`: transferência com PIN) e `CreditPanel` (simulador com RHF + `makeCreditSchema`, simulação no servidor, PIN, plano e pagamento de prestação). Respeita «ocultar saldos». Componentes em `components/features/assistant/`.
- **Fotografia**: envia o ficheiro **original** por `multipart` ao backend, que valida, recorta, redimensiona e re-codifica (`hooks/useAvatar`).
- **Sobre**: *server component* que obtém o "Quem somos" do bfa.ao e mantém **só texto** (nada de HTML de terceiros é renderizado); lista de permissões de origem e *timeout*. **Contactos** vêm da API; só se aceitam ligações `tel:`, `mailto:` e `https://www.bfa.ao`.
- Sem login biométrico na web (exigiria WebAuthn).

## Configuração e scripts

| | |
|---|---|
| `BACKEND_URL` | destino dos `rewrites` (servidor; `http://localhost:5080` por omissão; em produção `https://bfa-api.josemarsilva.me`). **Lido no `next build`** — mudar exige novo build. Ver `.env.example` |
| `pnpm dev` / `build` / `start` | `next dev` · `next build` · `next start` |
| `pnpm typecheck` · `pnpm lint` | `tsc --noEmit` · ESLint |

Da raiz: `pnpm dev:web`, `pnpm build:web`. Em produção servir por HTTPS (cookies `Secure`, HSTS) e pôr o Next e a API na mesma rede privada (o Next é o único *proxy* de confiança, `TrustedProxies` no backend).

**Source maps**: nenhum é servido ao browser (`.next/static` sem `.map`). O `next build` deixa `.map` do servidor em `.next/server` (nunca expostos); excluí-los da imagem de deploy.
