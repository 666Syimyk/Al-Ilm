import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

test("activation removes only this application's obsolete caches", async () => {
  const handlers = {};
  const removed = [];
  const cacheNames = ["unrelated-app-v1", "al-ilm-v7", "al-ilm:/Al-Ilm:v8", "al-ilm:/Other:v8"];
  vm.runInNewContext(source, {
    URL,
    self: {
      registration: { scope: "https://example.test/Al-Ilm/" },
      addEventListener: (name, fn) => { handlers[name] = fn; },
      clients: { claim() {} }, skipWaiting() {}
    },
    caches: { keys: async () => cacheNames, delete: async (key) => { removed.push(key); } }
  });
  let work;
  handlers.activate({ waitUntil(promise) { work = promise; } });
  await work;
  assert.deepEqual(removed.sort(), ["al-ilm-v7", "al-ilm:/Al-Ilm:v8"].sort());
});

test("cached asset works offline and the refresh rejection is handled", async () => {
  const handlers = {};
  const cached = new Response("cached");
  vm.runInNewContext(source, {
    URL, Response,
    location: { origin: "https://example.test" },
    self: { registration: { scope: "https://example.test/Al-Ilm/" }, addEventListener: (name, fn) => { handlers[name] = fn; } },
    caches: { match: async () => cached, open: async () => ({ put: async () => {} }) },
    fetch: async () => { throw new Error("offline"); }
  });
  const tasks = [];
  let response;
  handlers.fetch({ request: { method: "GET", url: "https://example.test/Al-Ilm/assets/app.js", mode: "cors" }, waitUntil: (p) => tasks.push(p), respondWith: (p) => { response = p; } });
  assert.equal(await (await response).text(), "cached");
  await Promise.all(tasks);
});
