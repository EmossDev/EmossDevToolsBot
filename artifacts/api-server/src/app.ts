import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { resolve } from "node:path";
import { createProxyMiddleware } from "http-proxy-middleware";
import router from "./routes";
import adminRouter from "./routes/admin";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/static", express.static(resolve(process.cwd(), "public")));
app.use("/admin", adminRouter);
app.use("/api", router);

// TWA Digital Asset Links - URL bar'ı gizlemek için gerekli
app.get("/.well-known/assetlinks.json", (_req, res) => {
  const packageName = process.env.TWA_PACKAGE_NAME || "com.emossdevtoolsbot.twa";
  const fingerprint = process.env.TWA_FINGERPRINT || "";
  if (!fingerprint) {
    res.status(404).json({ error: "TWA_FINGERPRINT env var not set" });
    return;
  }
  res.json([{
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: packageName,
      sha256_cert_fingerprints: [fingerprint],
    },
  }]);
});

// Railway/Render'da PHP botu aynı container'da port 8000'de çalışır
// Replit'te ayrı servis olarak çalışır, bu proxy sadece production için gerekli
if (process.env.RAILWAY_ENVIRONMENT || process.env.RENDER_ENVIRONMENT) {
  app.use(
    "/bot",
    createProxyMiddleware({
      target: "http://localhost:8000",
      changeOrigin: false,
    }),
  );
}

export default app;
