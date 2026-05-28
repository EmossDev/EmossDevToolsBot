import { Router } from "express";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const CONFIG_PATH = resolve(
  "/home/runner/workspace/telegram-bot/COMMAND_FILES/DATA_FILE/config.json",
);
const DATA_PATH = resolve(
  "/home/runner/workspace/telegram-bot/COMMAND_FILES/DATA_FILE/data.json",
);

const router = Router();

function readConfig() {
  return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
}
function readData() {
  return JSON.parse(readFileSync(DATA_PATH, "utf-8"));
}

router.get("/bot/status", async (_req, res) => {
  try {
    const config = readConfig();
    const token: string = config.bot.token;
    const [meRes, wbRes] = await Promise.all([
      fetch(`https://api.telegram.org/bot${token}/getMe`),
      fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`),
    ]);
    const me = await meRes.json();
    const wb = await wbRes.json();
    res.json({ ok: true, me: me.result, webhook: wb.result });
  } catch (e) {
    res.json({ ok: false, error: String(e) });
  }
});

router.post("/bot/webhook/set", async (_req, res) => {
  try {
    const config = readConfig();
    const { token, webhookUrl } = config.bot;
    const r = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}&allowed_updates=message,callback_query,my_chat_member`,
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.delete("/bot/webhook", async (_req, res) => {
  try {
    const config = readConfig();
    const token: string = config.bot.token;
    const r = await fetch(
      `https://api.telegram.org/bot${token}/deleteWebhook?drop_pending_updates=true`,
    );
    res.json(await r.json());
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/bot/config", (_req, res) => {
  const config = readConfig();
  const safe = JSON.parse(JSON.stringify(config));
  const t: string = safe.bot?.token ?? "";
  if (t) safe.bot.token = t.slice(0, 8) + "…" + t.slice(-4);
  res.json(safe.bot);
});

router.put("/bot/config", (req, res) => {
  try {
    const config = readConfig();
    const allowed = [
      "chat_id",
      "private_chat_id",
      "test_chat_id",
      "log_chat_id",
      "creator_id",
      "webhookUrl",
    ] as const;
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        config.bot[key] = req.body[key];
      }
    }
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), "utf-8");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

router.get("/bot/filters-detail", (_req, res) => {
  const data = readData();
  const filters = data.data.filters as Record<
    string,
    Record<string, { name: string; type: string; text: string; data_id: string }>
  >;
  const result: Record<
    string,
    Array<{ key: string; name: string; type: string; text: string }>
  > = {};
  for (const [cat, items] of Object.entries(filters)) {
    result[cat] = Object.entries(items).map(([key, v]) => ({
      key,
      name: v.name,
      type: v.type,
      text: v.text ?? "",
    }));
  }
  res.json(result);
});

router.put("/bot/filters/:category/:key", (req, res) => {
  try {
    const { category, key } = req.params;
    const { text } = req.body as { text: string };
    const data = readData();
    if (!data.data.filters[category]?.[key]) {
      res.status(404).json({ ok: false, error: "Filter not found" });
      return;
    }
    data.data.filters[category][key].text = text;
    writeFileSync(DATA_PATH, JSON.stringify(data, null, 4), "utf-8");
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

export default router;
