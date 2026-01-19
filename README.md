# appointmentChat-web

Frontend em TypeScript para um chatbot que simula um paciente e ajuda alunos de medicina a treinar habilidades de diagnóstico. O projeto usa `tsc` para gerar o JavaScript em `dist/` e `lite-server` para servir os arquivos estáticos presentes em `public/`.

## Estrutura
- `web/public/`: HTML e CSS estáticos (`index.html`, `styles.css`).
- `web/src/main.ts`: lógica do chat, integração com o backend e utilidades.
- `web/bs-config.js`: configurações do `lite-server`.
- `web/tsconfig.json`: opções do compilador TypeScript.

## Pré-requisitos
- Node.js 18+ (recomendado) e npm.

## Instalação
```bash
cd web
npm install
```

## Passo a Passo de Build
```bash
cd /home/danilo/Desktop/ITA/CSI-28/appointmentChat-web/web
npm install
npm run build
npm start
```

## Scripts
- `npm run build`: compila `src/` para `dist/`.
- `npm run watch`: recompila automaticamente ao editar `src/`.
- `npm start`: executa `build` e sobe o `lite-server` (porta padrão `3000`).

## Configuração do Backend
O backend é acessado por meio do endpoint no arquivo `web/src/main.ts`, esse endpoint será interceptado pelo proxy definido em `web/bs-config.js`, que redirecionará para a URL correta. O endpoint do backend é definido na constante `BACKEND_URL` em `web/src/main.ts`. Altere o valor para apontar para o host desejado, por exemplo:

```ts
const BACKEND_URL = "/api/chat/chat";
```
A URL do backend está definida no arquivo `web/bs-config.js`, no atributo target do middleware, por exemplo:

```js
target: "http://localhost:8000"
```

Após ajustar:
1. Rode `npm run build` (ou mantenha `npm run watch` ativo) para atualizar `dist/main.js`.
2. Reinicie `npm start` se o servidor de desenvolvimento estiver em execução.

## Fluxo de Desenvolvimento
1. Instale dependências (`npm install`).
2. Em um terminal, rode `npm run watch` para compilar continuamente.
3. Em outro terminal, use `npm start` para servir `public/` + `dist/`.
4. Edite `web/src/main.ts` e os estilos em `web/public/styles.css`.
