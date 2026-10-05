# Restaurante Kaipira Piracicaba - App Delivery Oficial

Aplicativo web de delivery para o **Restaurante Kaipira Piracicaba**, localizado na **Av. Pompéia, 1018 - Piracicamirim, Piracicaba - SP** (Telefone: `(19) 3302-9515`).

## Como rodar localmente no desenvolvimento

```bash
npm install
npm run dev
```
O servidor de desenvolvimento do Vite iniciará em `http://localhost:3000`.

## Como gerar o build de produção

```bash
npm run build
```
Os arquivos otimizados prontos para publicação estarão na pasta `dist/`.

## Hospedagem no GitHub Pages

O projeto já inclui o arquivo de automação `.github/workflows/deploy.yml`.

1. Suba o código para o seu repositório no GitHub.
2. No seu repositório no GitHub, acesse **Settings** > **Pages**.
3. Em **Build and deployment** > **Source**, selecione **GitHub Actions**.
4. A cada commit na branch `main`, o GitHub Actions irá rodar `npm run build` e publicar automaticamente a pasta `dist/` no seu link do GitHub Pages, sem erros de 404 para `main.tsx` ou `favicon.ico`.
