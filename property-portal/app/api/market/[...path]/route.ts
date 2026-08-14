const JAVA_API_URL = (process.env.JAVA_API_URL || "http://127.0.0.1:8080").replace(/\/$/, "");
const allowed = /^(properties(?:\/\d+)?|market\/(?:summary|segments|what-if))$/;

async function proxy(request: Request, context: RouteContext<"/api/market/[...path]">) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  if (!allowed.test(endpoint)) return Response.json({ message: "Unknown market endpoint" }, { status: 404 });

  const incoming = new URL(request.url);
  const target = new URL(`/api/${endpoint}`, JAVA_API_URL);
  target.search = incoming.search;
  try {
    const body = ["POST", "PUT", "PATCH"].includes(request.method) ? await request.text() : undefined;
    const upstream = await fetch(target, {
      method: request.method,
      body,
      cache: "no-store",
      headers: body ? { "content-type": "application/json" } : undefined,
      signal: AbortSignal.timeout(12000),
    });
    if (upstream.status === 204) return new Response(null, { status: 204 });
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch {
    return Response.json({ message: "Market data is temporarily unavailable. Please try again in a moment." }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
