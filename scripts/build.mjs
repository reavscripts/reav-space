
import { cpSync, existsSync, lstatSync, mkdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { catalog, site } from "../src/catalog.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = resolve(root, "dist");
const paths = [];
const clean = value => String(value).replace(/[&<>"']/g, char =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const categoryPath = sector => `/${sector.slug}/`;
const productPath = (sector, product) => `${categoryPath(sector)}${product.slug}/`;
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const external = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M8 6h10v10"/></svg>';
const brand = '<a class="brand" href="/" aria-label="reav.website, home"><span class="brand-symbol" aria-hidden="true"><i></i><i></i><i></i></span><span>reav<span class="brand-dot">.</span></span></a>';
const icons = {
  container: '<rect x="3" y="6" width="18" height="12" rx="1"/><path d="M7 9v6m5-6v6m5-6v6"/>',
  folder: '<path d="M3 7h7l2 2h9v10H3zM3 7V5h7l2 2h6"/><path d="M7 13h10m-10 3h7"/>'
};
const productIcon = product => `<span class="product-icon tone-${product.color}"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[product.icon]}</svg></span>`;

function navigation(path) {
  return `
    <header class="masthead shell">
      ${brand}
      <nav aria-label="Navigazione principale">
        <a href="/#catalogo"${path === "/" ? ' aria-current="page"' : ""}>Catalogo</a>
        ${catalog.map(sector => `<a href="${categoryPath(sector)}"${path === categoryPath(sector) ? ' aria-current="page"' : ""}>${clean(sector.name)}</a>`).join("")}
      </nav>
      <span class="mast-label">GESTIONALI WEB</span>
    </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <div class="shell footer-inner">
      ${brand}
      <div><strong>Gestionali reav</strong><p>© 2026 reav.website</p></div>
      <nav aria-label="Settori">${catalog.map(sector => `<a href="${categoryPath(sector)}">${clean(sector.name)} ${arrow}</a>`).join("")}</nav>
    </div>
  </footer>`;
}

function breadcrumbs(items) {
  return `<nav class="crumbs" aria-label="Percorso"><ol>${items.map(({ path, name }, index) =>
    `<li>${index === items.length - 1 ? `<span aria-current="page">${clean(name)}</span>` : `<a href="${path}">${clean(name)}</a>`}</li>`
  ).join("")}</ol></nav>`;
}

function breadcrumbData(items) {
  return { "@type": "BreadcrumbList", itemListElement: items.map(({ path, name }, index) =>
    ({ "@type": "ListItem", position: index + 1, name, item: site.url + path })) };
}

function itemList(items) {
  return { "@type": "ItemList", itemListElement: items.map(({ path, name }, index) =>
    ({ "@type": "ListItem", position: index + 1, name, url: site.url + path })) };
}

function document({ path, title, description, body, data = [], noindex = false }) {
  const fullTitle = `${title} | ${site.name}`;
  const url = site.url + path;
  const schema = JSON.stringify({ "@context": "https://schema.org", "@graph": data }).replaceAll("<", "\\u003c");
  return `<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${clean(fullTitle)}</title>
  <meta name="description" content="${clean(description)}">
  <meta name="theme-color" content="#f7f6ef">
  ${noindex ? '<meta name="robots" content="noindex">' : `
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="it_IT">
  <meta property="og:site_name" content="${site.name}">
  <meta property="og:title" content="${clean(fullTitle)}">
  <meta property="og:description" content="${clean(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${site.url}/assets/reav-social.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="reav.website, catalogo dei gestionali">
  <meta name="twitter:card" content="summary_large_image">
  <script type="application/ld+json">${schema}</script>`}
  <link rel="icon" href="/assets/reav.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/hub.css">
</head>
<body>
  <a class="skip" href="#contenuto">Vai al contenuto</a>
  ${navigation(path)}
  <main id="contenuto">${body}</main>
  ${footer()}
</body>
</html>`;
}

function productRows(sector, heading = "h3") {
  return `<ol class="product-list" role="list">${sector.products.map(product => `
    <li class="product-row">
      <div class="row-visual"><span class="row-number">${sector.number}.${product.number}</span>${productIcon(product)}</div>
      <div class="row-title"><p class="eyebrow">${clean(product.label)}</p><${heading}><a href="${productPath(sector, product)}">${clean(product.name)}</a></${heading}></div>
      <p class="row-copy">${clean(product.summary)}</p>
      <div class="row-actions">
        <a class="detail-link" href="${productPath(sector, product)}" aria-label="Scopri ${clean(product.name)}">Scopri ${arrow}</a>
        <a class="launch-link" href="${product.url}" aria-label="Apri ${clean(product.name)}">Apri ${external}</a>
      </div>
    </li>`).join("")}</ol>`;
}

function home() {
  const [first] = catalog;
  return {
    path: "/",
    title: "Gestionali web per il lavoro operativo",
    description: site.description,
    data: [
      { "@type": "WebSite", name: site.name, url: site.url, inLanguage: "it" },
      itemList(catalog.map(sector => ({ name: sector.name, path: categoryPath(sector) })))
    ],
    body: `
      <section class="home-hero shell">
        <div class="hero-copy">
          <p class="eyebrow"><span class="signal"></span> SOFTWARE OPERATIVI REAV</p>
          <h1>Gestionali per il<br class="wide-break"> lavoro operativo<span>.</span></h1>
          <p class="lead">Dal controllo dei container alla gestione dei documenti e delle uscite. Scopri i gestionali web di reav.website, organizzati per settore.</p>
          <a class="action action-dark" href="#catalogo">Esplora il catalogo ${arrow}</a>
        </div>
        <aside class="quick-access" aria-labelledby="quick-title">
          <div class="quick-head"><p class="eyebrow">${clean(first.name)}</p><h2 id="quick-title">Accesso rapido</h2></div>
          <ul role="list">${first.products.map(product => `
            <li><a class="quick-link" href="${product.url}" aria-label="Apri ${clean(product.name)}">
              ${productIcon(product)}
              <span class="quick-copy"><strong>${clean(product.name)}</strong><span>${clean(product.access || product.label)}</span></span>
              ${external}
            </a></li>`).join("")}</ul>
          <a class="quick-sector" href="${categoryPath(first)}">Scopri il settore ${clean(first.name)} ${arrow}</a>
        </aside>
      </section>
      <section class="catalog shell" id="catalogo" aria-labelledby="catalog-title">
        <div class="section-cap"><p class="eyebrow"><span class="signal"></span> INDICE DEI SETTORI</p><span>${String(catalog.length).padStart(2,"0")} ${catalog.length === 1 ? "SETTORE" : "SETTORI"}</span></div>
        <h2 id="catalog-title">Catalogo gestionali</h2>
        ${catalog.map(sector => `<section class="sector" aria-labelledby="sector-${sector.slug}">
          <div class="sector-head">
            <span class="sector-number" aria-hidden="true">${sector.number}</span>
            <div><h3 id="sector-${sector.slug}">${clean(sector.name)}</h3><p>${clean(sector.description)}</p></div>
            <a class="detail-link" href="${categoryPath(sector)}">Esplora il settore ${arrow}</a>
          </div>
          ${productRows(sector, "h4")}
        </section>`).join("")}
      </section>`
  };
}

function sectorPage(sector) {
  const path = categoryPath(sector);
  const crumbs = [{ path: "/", name: "Catalogo" }, { path, name: sector.name }];
  return {
    path, title: sector.title, description: sector.description,
    data: [
      { "@type": "CollectionPage", name: sector.name, url: site.url + path, description: sector.description, inLanguage: "it" },
      breadcrumbData(crumbs), itemList(sector.products.map(product => ({ path: productPath(sector, product), name: product.name })))
    ],
    body: `<section class="shell subpage">
      ${breadcrumbs(crumbs)}
      <header class="section-hero">
        <div><p class="eyebrow"><span class="signal"></span> SETTORE ${sector.number}</p><h1>${clean(sector.name)}<span>.</span></h1><p class="lead">${clean(sector.description)}</p></div>
      </header>
      <h2 class="section-title">${clean(sector.title)}</h2>
      ${productRows(sector)}
    </section>`
  };
}

function productPage(sector, product) {
  const path = productPath(sector, product);
  const crumbs = [{ path: "/", name: "Catalogo" }, { path: categoryPath(sector), name: sector.name }, { path, name: product.name }];
  return {
    path, title: `${product.name}, ${product.subtitle.toLowerCase()}`, description: product.description,
    data: [
      { "@type": "SoftwareApplication", name: product.name, description: product.description,
        url: site.url + path, sameAs: product.url, applicationCategory: "BusinessApplication", operatingSystem: "Web", inLanguage: "it" },
      breadcrumbData(crumbs)
    ],
    body: `<article class="shell subpage">
      ${breadcrumbs(crumbs)}
      <header class="product-hero">
        <div><p class="eyebrow"><span class="signal"></span> ${clean(sector.name)} / ${sector.number}.${product.number}</p>
          <h1>${clean(product.name)}<span>.</span></h1>
          <p class="product-subtitle">${clean(product.subtitle)}</p>
          <p class="lead">${clean(product.intro)}</p>
          <a class="action action-dark" href="${product.url}">Apri ${clean(product.name)} ${external}</a>
        </div>
        <div class="product-plate tone-${product.color}">
          <p class="eyebrow">SCHEDA / ${sector.number}.${product.number}</p>${productIcon(product)}
          <strong>${clean(product.label)}</strong><span>${clean(new URL(product.url).hostname)}</span>
        </div>
      </header>
      <section class="features" aria-labelledby="features-title">
        <div><p class="eyebrow"><span class="signal"></span> OPERATIVITÀ</p><h2 id="features-title">Cosa puoi fare</h2></div>
        <ol role="list">${product.features.map((feature, index) => `<li><span aria-hidden="true">0${index + 1}</span><div><h3>${clean(feature.title)}</h3><p>${clean(feature.text)}</p></div></li>`).join("")}</ol>
      </section>
      <div class="product-note"><p>${clean(product.note)}</p><a class="detail-link" href="${categoryPath(sector)}">Torna a ${clean(sector.name)} ${arrow}</a></div>
    </article>`
  };
}

function write(relative, content) {
  const destination = resolve(output, relative);
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, content);
}

if (existsSync(output)) {
  if (!lstatSync(output).isDirectory() || realpathSync(output) !== output) throw new Error("Cartella di build non valida");
  rmSync(output, { recursive: true });
}
mkdirSync(output);
cpSync(resolve(root, "src/assets"), resolve(output, "assets"), { recursive: true });
for (const page of [home(), ...catalog.flatMap(sector => [sectorPage(sector), ...sector.products.map(product => productPage(sector, product))])]) {
  write(page.path.slice(1) + "index.html", document(page));
  paths.push(page.path);
}
write("404.html", document({
  path: "/404.html", title: "Pagina non trovata", description: "Torna al catalogo dei gestionali di reav.website.", noindex: true,
  body: `<section class="shell subpage missing"><p class="eyebrow">ERRORE 404</p><h1>Pagina non trovata<span>.</span></h1><a class="action action-dark" href="/">Torna al catalogo ${arrow}</a></section>`
}));
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path => `  <url><loc>${site.url}${path}</loc></url>`).join("\n")}\n</urlset>\n`);
console.log(`Generate ${paths.length} pagine del catalogo.`);
