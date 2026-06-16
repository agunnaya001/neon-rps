import { Router, type IRouter } from "express";
import { Resvg } from "@resvg/resvg-js";
import { fetchGame, phaseName } from "../lib/contract";

const router: IRouter = Router();

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSvg(game: {
  id: string;
  player1: string;
  player2: string;
  betEth: string;
  phase: number;
  winner: string;
  exists: boolean;
}): string {
  const W = 1200;
  const H = 630;
  const phase = phaseName(game.phase);
  const subtitle = game.exists
    ? phase.toUpperCase()
    : "GAME NOT FOUND";

  const winnerLine =
    game.phase === 3
      ? `WINNER  ${escape(game.winner)}`
      : game.phase === 4
        ? `TIE  —  REFUNDED`
        : game.phase === 5
          ? `CANCELLED`
          : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a1a"/>
      <stop offset="100%" stop-color="#1a0a2e"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>

  <!-- grid lines -->
  ${Array.from({ length: 12 })
    .map(
      (_, i) =>
        `<line x1="0" y1="${(i + 1) * 52}" x2="${W}" y2="${(i + 1) * 52}" stroke="#ff00ff" stroke-opacity="0.06"/>`,
    )
    .join("")}
  ${Array.from({ length: 24 })
    .map(
      (_, i) =>
        `<line x1="${(i + 1) * 50}" y1="0" x2="${(i + 1) * 50}" y2="${H}" stroke="#00ffff" stroke-opacity="0.04"/>`,
    )
    .join("")}

  <!-- border -->
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="none" stroke="#ff00ff" stroke-width="3" stroke-opacity="0.8" filter="url(#glow)"/>

  <!-- brand -->
  <text x="60" y="100" font-family="monospace" font-size="36" font-weight="bold" fill="#ff00ff" filter="url(#glow)" letter-spacing="6">NEON RPS</text>
  <text x="60" y="138" font-family="monospace" font-size="20" fill="#00ffff" letter-spacing="3">COMMIT · REVEAL · WIN</text>

  <!-- match id -->
  <text x="60" y="270" font-family="monospace" font-size="120" font-weight="900" fill="#ffffff" filter="url(#glow)">MATCH #${escape(game.id)}</text>

  <!-- subtitle -->
  <text x="60" y="330" font-family="monospace" font-size="32" fill="#00ffff" letter-spacing="4" filter="url(#glow)">${escape(subtitle)}</text>

  <!-- bet -->
  <text x="60" y="450" font-family="monospace" font-size="28" fill="#888888" letter-spacing="2">POT</text>
  <text x="60" y="510" font-family="monospace" font-size="72" font-weight="bold" fill="#ffff00" filter="url(#glow)">${escape(game.betEth)} ETH</text>

  <!-- players -->
  <text x="700" y="450" font-family="monospace" font-size="22" fill="#ff00ff" letter-spacing="2">PLAYER 1</text>
  <text x="700" y="485" font-family="monospace" font-size="32" font-weight="bold" fill="#ffffff">${escape(game.player1)}</text>

  <text x="700" y="540" font-family="monospace" font-size="22" fill="#00ffff" letter-spacing="2">PLAYER 2</text>
  <text x="700" y="575" font-family="monospace" font-size="32" font-weight="bold" fill="#ffffff">${escape(game.player2)}</text>

  ${winnerLine ? `<text x="60" y="585" font-family="monospace" font-size="26" fill="#ffff00" letter-spacing="3" filter="url(#glow)">${winnerLine}</text>` : ""}
</svg>`;
}

router.get("/og/game/:id", async (req, res) => {
  try {
    const game = await fetchGame(req.params.id);
    const svg = buildSvg(game);
    const resvg = new Resvg(svg, {
      fitTo: { mode: "width", value: 1200 },
      font: { loadSystemFonts: true, defaultFontFamily: "monospace" },
    });
    const png = resvg.render().asPng();
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=60, s-maxage=60");
    res.send(png);
  } catch (err) {
    res.status(500).send("OG render failed");
  }
});

export default router;
