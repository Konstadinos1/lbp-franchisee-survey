// Minimal CDP client: measure layout overflow at mobile width
const http = require("http");

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => resolve(JSON.parse(d)));
    }).on("error", reject);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const url = process.argv[2];
  const targets = await getJson("http://127.0.0.1:9222/json");
  const page = targets.find((t) => t.type === "page");
  if (!page) throw new Error("no page target");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params }));
    });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
    }
  };
  await new Promise((r) => (ws.onopen = r));
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 420, height: 900, deviceScaleFactor: 2, mobile: true,
  });
  await send("Page.navigate", { url });
  await sleep(4500);
  const expr = `(() => {
    const vw = document.documentElement.clientWidth;
    const bad = [];
    document.querySelectorAll('body *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > vw + 1) {
        const cls = typeof el.className === 'string' && el.className ? el.className.split(' ')[0] : el.tagName;
        bad.push(el.tagName + '.' + cls + ':' + Math.round(r.width));
      }
    });
    return JSON.stringify({ vw, scrollW: document.documentElement.scrollWidth, bad: bad.slice(0, 8) });
  })()`;
  const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
  console.log(res.result.value);
  ws.close();
  process.exit(0);
}

main().catch((e) => { console.error("ERR", e.message); process.exit(1); });
