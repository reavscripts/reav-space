
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { catalog, site } from "../src/catalog.mjs";

const read = path => readFileSync(new URL("../dist/" + path, import.meta.url), "utf8");
const fileFor = path => path.slice(1) + (path.endsWith("/") ? "index.html" : "");
const paths = ["/", ...catalog.flatMap(sector => [
  "/" + sector.slug + "/",
  ...sector.products.map(product => "/" + sector.slug + "/" + product.slug + "/")
])];
assert.equal(new Set(paths).size, paths.length);
const sitemap = [...read("sitemap.xml").matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.deepEqual(sitemap, paths.map(path => site.url + path));
assert.ok(read("robots.txt").includes("Sitemap: " + site.url + "/sitemap.xml"));

const titles = new Set();
for (const path of paths) {
  const html = read(fileFor(path));
  assert.ok(html.includes('<html lang="it">'));
  assert.equal([...html.matchAll(/<h1[\s>]/g)].length, 1, path);
  const [, title] = html.match(/<title>([^<]+)<\/title>/);
  assert.ok(!titles.has(title), path + " ha un titolo duplicato");
  titles.add(title);
  assert.ok(html.includes('rel="canonical" href="' + site.url + path + '"'), path);
  assert.ok(html.includes('property="og:url" content="' + site.url + path + '"'), path);
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
  assert.ok(graph["@graph"].length, path);
  for (const [, ref] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const target = fileFor(ref.split("#")[0]);
    assert.ok(existsSync(new URL("../dist/" + target, import.meta.url)), path + " collega " + ref);
  }
}
const social = readFileSync(new URL("../dist/assets/reav-social.png", import.meta.url));
assert.deepEqual([social.readUInt32BE(16), social.readUInt32BE(20)], [1200, 630]);
assert.ok(read("404.html").includes('name="robots" content="noindex"'));
console.log("Pagine, collegamenti, canonical, sitemap, metadati e immagine sociale verificati.");
