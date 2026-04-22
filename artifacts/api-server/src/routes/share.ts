import { Router, type IRouter } from "express";
import { fetchGame, phaseName } from "../lib/contract";

const router: IRouter = Router();

const APP_URL = process.env.APP_URL ?? "";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

router.get("/share/g/:id", async (req, res) => {
  const game = await fetchGame(req.params.id);
  const origin =
    APP_URL || `${req.protocol}://${req.get("host")?.replace(/\/$/, "")}`;
  const ogUrl = `${origin}/api/og/game/${encodeURIComponent(req.params.id)}`;
  const targetUrl = `${origin}/game/${encodeURIComponent(req.params.id)}`;

  const phase = phaseName(game.phase);
  const title = game.exists
    ? `NEON RPS Match #${game.id} — ${game.betEth} ETH on the line`
    : "NEON RPS — Commit-Reveal Rock Paper Scissors";
  const description = game.exists
    ? `${phase}. Players ${game.player1} vs ${game.player2}. Winner takes the pot.`
    : "Front-running-resistant on-chain Rock Paper Scissors. Commit. Reveal. Win.";

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=30");
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${escape(title)}</title>
    <meta name="description" content="${escape(description)}" />
    <meta property="og:title" content="${escape(title)}" />
    <meta property="og:description" content="${escape(description)}" />
    <meta property="og:image" content="${escape(ogUrl)}" />
    <meta property="og:url" content="${escape(targetUrl)}" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(title)}" />
    <meta name="twitter:description" content="${escape(description)}" />
    <meta name="twitter:image" content="${escape(ogUrl)}" />
    <meta http-equiv="refresh" content="0; url=${escape(targetUrl)}" />
    <style>body{background:#0a0a1a;color:#ff00ff;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}</style>
  </head>
  <body>
    <p>Redirecting to <a style="color:#00ffff" href="${escape(targetUrl)}">${escape(targetUrl)}</a>…</p>
    <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
  </body>
</html>`);
});

export default router;
