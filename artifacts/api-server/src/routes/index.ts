import { Router, type IRouter } from "express";
import healthRouter from "./health";
import botRouter from "./bot";
import githubWebhookRouter from "./github-webhook";

const router: IRouter = Router();

router.use(healthRouter);
router.use(botRouter);
router.use(githubWebhookRouter);

export default router;
