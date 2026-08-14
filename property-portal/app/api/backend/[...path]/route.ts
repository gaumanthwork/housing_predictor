const API_URL = (process.env.FASTAPI_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const allowed = new Set(["health", "model-info", "predict"]);

async function proxy(request: Request, context: RouteContext<"/api/backend/[...path]">) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  if (!allowed.has(endpoint)) return Response.json({ detail: "Unknown endpoint" }, { status: 404 });
  try {
    const body = request.method === "POST" ? await request.text() : undefined;
    const upstream = await fetch(`${API_URL}/${endpoint}`, { method: request.method, body, cache: "no-store", headers: body ? { "content-type": "application/json" } : undefined, signal: AbortSignal.timeout(12000) });
    const text = await upstream.text();
    return new Response(text, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") || "application/json" } });
  } catch {
    return Response.json(
      { detail: "Our valuation service is temporarily unavailable. Please try again in a moment." },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
