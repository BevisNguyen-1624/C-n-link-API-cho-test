import type { VercelRequest, VercelResponse } from "@vercel/node";

const GAS_URL = "https://script.google.com/a/macros/yody.vn/s/AKfycby2IKa1UBLfR5Jv4nnE19rbe01_PG4qhSpZGpQfECFcPyrrclZTx5WSz-7wT_EV9HY8/exec";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    let params: Record<string, string> = {};

    if (req.method === "GET") {
      params = req.query as Record<string, string>;
    } else {
      // POST → flatten body thành GET params
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      params = Object.fromEntries(
        Object.entries(body).map(([k, v]) => [k, String(v)])
      );
    }

    const url = `${GAS_URL}?${new URLSearchParams(params)}`;
    const gasRes = await fetch(url, { redirect: "follow" });
    const text = await gasRes.text();

    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      console.error("GAS non-JSON:", text.slice(0, 300));
      return res.status(502).json({ ok: false, error: "GAS returned non-JSON" });
    }

  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ ok: false, error: "Proxy error" });
  }
}