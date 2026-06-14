import { Router } from "express";
import express from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { exec } from "node:child_process";

const CONFIG_PATH = resolve(
  process.cwd(),
  "telegram-bot/COMMAND_FILES/DATA_FILE/config.json",
);

const router = Router();

function readConfig() {
  return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
}

function ensureSecret(): string {
  const config = readConfig();
  if (!config.bot?.githubWebhookSecret) {
    const secret =
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2);
    config.bot.githubWebhookSecret = secret;
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4), "utf-8");
    return secret;
  }
  return config.bot.githubWebhookSecret as string;
}

/** GET /github-webhook/info — panele secret + webhook URL bilgisi döndürür */
router.get("/github-webhook/info", (_req, res) => {
  const secret = ensureSecret();
  const config = readConfig();
  // config.json'da bot.webhookUrl = "https://xxx.lhr.life/bot/"
  const stored: string = config.bot?.webhookUrl ?? "";
  const baseUrl = stored.replace(/\/bot\/?$/, "").replace(/\/$/, "");
  const webhookUrl = baseUrl ? `${baseUrl}/api/github-webhook` : "";
  res.json({ ok: true, secret, webhookUrl });
});

/** POST /github-webhook — GitHub push event, git güncelle + node yeniden başlat */
router.post(
  "/github-webhook",
  express.raw({ type: "*/*" }),
  (req, res) => {
    res.json({ ok: true });
    try {
      const config = readConfig();
      const secret: string = config.bot?.githubWebhookSecret ?? "";
      const rawBody = req.body as Buffer;
      const sig = (req.headers["x-hub-signature-256"] as string) ?? "";

      if (secret && sig) {
        const expected =
          "sha256=" +
          createHmac("sha256", secret).update(rawBody).digest("hex");
        try {
          if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
            console.error("[github-webhook] Geçersiz imza — istek reddedildi");
            return;
          }
        } catch {
          return;
        }
      }

      const event = req.headers["x-github-event"] as string;
      if (event !== "push") return;

      const body = JSON.parse(rawBody.toString()) as { ref?: string };
      const ref = body.ref ?? "";
      if (!ref.endsWith("/main") && !ref.endsWith("/master")) return;

      const root = resolve(process.cwd());
      exec(
        `cd "${root}" && git fetch github && git reset --hard github/main`,
        (err, stdout, stderr) => {
          if (err) {
            console.error("[github-webhook] Git pull hatası:", stderr);
            return;
          }
          console.log("[github-webhook] Güncellendi:", stdout.trim());
          // Watchdog yeniden başlatacak
          setTimeout(() => process.exit(0), 1500);
        },
      );
    } catch (e) {
      console.error("[github-webhook] Hata:", e);
    }
  },
);

export default router;
