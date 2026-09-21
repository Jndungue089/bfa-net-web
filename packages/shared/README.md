# @bfa/shared

Contrato partilhado entre **web** e **mobile**: tudo o que tem de ser igual nas duas apps (e igual ao backend) vive aqui, uma só vez.
Consumido como **código-fonte TypeScript** (`main: src/index.ts`) — o Next usa `transpilePackages`, o Metro compila-o directamente. Não tem passo de *build*.

## O que contém (`src/`)

| Módulo | Função |
|---|---|
| `regex.ts` | Formatos de entrada (adesão, telemóvel, BI, NIF, IBAN, PIN, nomes, email, descrição…). Espelham `BfaNet.Application.Common.Patterns`; todas ancoradas e sem quantificadores aninhados (sem ReDoS) |
| `sanitize.ts` | `cleanText` (NFC, remove controlo/bidi/zero-width, colapsa espaços) e normalizadores (telefone, email, BI, IBAN) |
| `iban.ts` | Validação mod-97 sem `BigInt`, `formatIban`, `maskIban`, `isBfaIban` |
| `credentials.ts` | Política de palavra-passe/PIN (igual à do servidor) e medidor de força |
| `schemas.ts` | **Schemas Zod** dos formulários: login, registo, transferência, serviços, **recarga** (regras por fornecedor), **Estado**, **KWiK**, beneficiário, PIN, cartão… Cada campo higieniza *antes* de validar |
| `providers.ts` | Metadados dos fornecedores de recarga (rótulo, tipo, limites, montantes rápidos) |
| `qr.ts` | Parser **estrito** dos QR `BFAPAY:v1` / `BFAKWIK:v1` (chaves permitidas, sem duplicados, checksum do IBAN, ≤ 300 caracteres) + construtores |
| `period.ts` | Datas em hora de Luanda, predefinições (mês/30/90 dias) e `dateRangeSchema` |
| `format.ts` | Formatação determinística de montantes/datas/telefones (sem `Intl`: idêntica em V8, JSC e Hermes) e `parseMoneyInput` (rejeita `1.500` por ambíguo) |
| `types.ts` | Tipos do contrato (espelham os DTOs do backend), incluindo o assistente (`AssistantInsights`, `CreditOffer`, `Loan`…) |
| `api/client.ts` | `createApiClient`: `fetch` com *timeout*, `ApiError` normalizado, refresh **single-flight** em 401, corpo bruto/`FormData`, cabeçalho de cliente (`web`/`mobile`), `applyFieldErrors` para formulários |
| `api/bank.ts` | `createBankApi(client)`: superfície tipada de todos os endpoints (`assistant.insights/credit/simulate/accept/loans/repay`) |
| `uuid.ts` | UUID v4 com o CSPRNG da plataforma (chaves de idempotência) |

## Como as apps o usam

```ts
// web (cookies HttpOnly, mesma origem)          // mobile (Bearer em memória)
createApiClient({ baseUrl: "", clientKind: "web", refresh, onSessionExpired })
createApiClient({ baseUrl: API_URL, clientKind: "mobile", getAccessToken, refresh, userAgent })
const bankApi = createBankApi(client)
```

`useForm({ resolver: zodResolver(transferSchema) })` valida no cliente com os mesmos schemas nas duas apps; o servidor **repete sempre** a validação e devolve erros por campo que `applyFieldErrors` coloca no formulário.

## Regras de manutenção
1. **Paridade com o backend.** Alterar um regex/limite aqui implica alterar `Patterns`/`Validators` no backend (e vice-versa). Há vectores comuns nos testes (p. ex. o IBAN gerado pelo C# valida aqui).
2. Sem dependências de plataforma: nada de `react`, `react-native` ou DOM (o pacote é carregado por duas versões diferentes de React).
3. Formatação sempre pelas funções de `format.ts`; nunca `Intl`/`toLocaleString`.
4. Todo o texto de utilizador em português (pt-AO).

## Testes
`pnpm --filter @bfa/shared test` (Vitest) · `pnpm --filter @bfa/shared typecheck`. Cobrem IBAN, políticas, sanitização, dinheiro, schemas (recarga por fornecedor, Estado, KWiK…), parser de QR (rejeita esquemas estrangeiros, chaves desconhecidas, duplicados, marcação no nome…), períodos e o cliente HTTP (mapeamento de erros, refresh único para 401 paralelos, `FormData`).
