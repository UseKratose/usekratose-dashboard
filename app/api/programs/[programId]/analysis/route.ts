import { backendUrl, requireDashboardSession } from "@/lib/backend";

export const maxDuration = 120;

export async function POST(
  _request: Request,
  context: { params: Promise<{ programId: string }> },
): Promise<Response> {
  const { accessToken } = await requireDashboardSession();
  const { programId } = await context.params;
  try {
    const response = await fetch(
      backendUrl(`/api/v1/dashboard/programs/${programId}/analysis`),
      {
        cache: "no-store",
        headers: { authorization: `Bearer ${accessToken}` },
        method: "POST",
      },
    );
    const body = await response.text();
    if (!response.ok) {
      console.error("[dashboard-analysis-proxy] backend failed", {
        body: body.slice(0, 500),
        programId,
        status: response.status,
      });
    }
    return new Response(body, {
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
      },
      status: response.status,
    });
  } catch (error) {
    console.error("[dashboard-analysis-proxy] request failed", {
      error: error instanceof Error ? error.message : String(error),
      programId,
    });
    return Response.json(
      {
        error: {
          code: "AI_ANALYSIS_UNAVAILABLE",
          message: "AI analysis could not reach the analysis service. Try again.",
        },
      },
      { status: 502 },
    );
  }
}
