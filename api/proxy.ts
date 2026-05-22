// api/proxy.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const GAS_URL = "https://script.google.com/a/macros/yody.vn/s/AKfycbyK9kfonWNu6bwXPn3A9etQ3Zh252NlDlkHHNmGTvrgRLUrlr0A1EUoC5d3-ZwK0Q_4/exec";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    let gasRes;

    if (req.method === "GET") {
      const params = new URLSearchParams(req.query as Record<string, string>);
      gasRes = await fetch(`${GAS_URL}?${params}`);
    } else {
      gasRes = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
    }

    const data = await gasRes.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Proxy error" });
  }
}