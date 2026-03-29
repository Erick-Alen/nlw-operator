import { ImageResponse } from "next/og";
import { staticCaller } from "@/trpc/server";

export const revalidate = false;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const severityColors: Record<string, string> = {
  mass_disaster: "#EF4444",
  needs_serious_help: "#EF4444",
  barely_acceptable: "#F59E0B",
  decent_enough: "#F59E0B",
  actually_good: "#10B981",
  mass_respect: "#10B981",
};

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ roastId: string }>;
}) {
  const { roastId } = await params;

  const statusResult = await staticCaller.submission
    .getStatusById({ id: roastId })
    .catch(() => null);

  if (!statusResult || statusResult.status !== "done") {
    return new Response(null, { status: 404 });
  }

  let submission: Awaited<ReturnType<typeof staticCaller.submission.getById>>;
  try {
    submission = await staticCaller.submission.getById({ id: roastId });
  } catch {
    return new Response(null, { status: 404 });
  }

  if (!(submission.score && submission.verdict && submission.roastQuote)) {
    return new Response(null, { status: 404 });
  }

  const score = Number(submission.score);
  const severityColor = severityColors[submission.verdict] ?? "#F59E0B";
  const scoreDisplay = score % 1 === 0 ? score.toFixed(0) : score.toFixed(1);
  const lineCount = submission.lineCount ?? submission.code.split("\n").length;

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        backgroundColor: "#0A0A0A",
        border: "1px solid #2A2A2A",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px",
        gap: "28px",
        boxSizing: "border-box",
      }}
    >
      {/* Logo row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#10B981", fontSize: "24px", fontWeight: 700 }}>
          {">"}
        </span>
        <span style={{ color: "#FAFAFA", fontSize: "24px", fontWeight: 700 }}>
          devroast
        </span>
      </div>

      {/* Score row */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span
          style={{
            color: severityColor,
            fontSize: "160px",
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {scoreDisplay}
        </span>
        <span
          style={{
            color: "#4B5563",
            fontSize: "56px",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          /10
        </span>
      </div>

      {/* Verdict row */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor: severityColor,
          }}
        />
        <span style={{ color: severityColor, fontSize: "20px" }}>
          {submission.verdict}
        </span>
      </div>

      {/* Lang info */}
      <div style={{ display: "flex" }}>
        <span style={{ color: "#4B5563", fontSize: "16px" }}>
          {`lang: ${submission.language} · ${lineCount} lines`}
        </span>
      </div>

      {/* Roast quote */}
      <div
        style={{
          display: "flex",
          maxWidth: "900px",
          textAlign: "center",
        }}
      >
        <span
          style={{
            color: "#FAFAFA",
            fontSize: "22px",
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          {`\u201c${submission.roastQuote}\u201d`}
        </span>
      </div>
    </div>,
    { ...size }
  );
}
