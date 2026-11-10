# reav.website

Catalogo pubblico dei gestionali reav. La sezione Logistica presenta DoganaTools e LogiFlow.

```sh
npm ci
npm test
```

La build genera HTML statico, sitemap e robots.txt in `dist/`. Il progetto Vercel usa il branch `main` di `reavscripts/reav-space` e pubblica quella cartella.

Per aggiungere un gestionale o un settore, modifica `src/catalog.mjs`. La build genera automaticamente le schede, i collegamenti e le voci della sitemap. Gli URL pubblicati vanno conservati o reindirizzati in `vercel.json` se cambiano.
