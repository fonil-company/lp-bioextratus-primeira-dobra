# Bio Nature — primeira dobra

Projeto independente com React, TanStack Start/Router e Tailwind CSS. Ele contém somente o cabeçalho e a primeira dobra da landing page original.

## Executar

```bash
npm install
npm run dev
```

Depois, abra a URL exibida pelo Vite (normalmente `http://localhost:3000`).

## Integração de leads

O servidor envia os cadastros ao Portal CRM e ao Supabase. Configure `CRM_WEBHOOK_URL`
e `BIONATURE_WEBHOOK_URL` no ambiente do servidor (veja `.env.example`). Os destinos
atuais permanecem como fallback no servidor e não entram no JavaScript público.

O CRM recebe nome, telefone e CNPJ normalizados, a etapa `Qualificado` já definida
no fluxo, todos os `utm_*` válidos, identificadores de campanha disponíveis,
`fbc`/`fbp` dos cookies Meta e a URL completa de entrada em `event_source_url`.
Não são enviados observações, aliases de URL ou campos de contato não coletados.
O Supabase mantém o payload interno, incluindo `landing_url`.

A origem é capturada ao abrir o formulário e preservada durante a sessão. Uma nova
entrada com campanha substitui a atribuição anterior, sem misturar IDs de campanhas.
Cookies são relidos no envio. Valores vazios e placeholders não resolvidos são omitidos.
O sucesso e o evento Meta `Lead` dependem da aceitação do CRM; o Pixel recebe um
`eventID` único por submissão, preservado nas tentativas após falha.

Validação local sem criar leads reais: `npm test`, `npx tsc --noEmit` e `npm run build`.
A exibição de Origem da campanha e Observações deve ser conferida no CRM após um
envio autorizado; os testes locais verificam o JSON efetivamente enviado com mocks.
