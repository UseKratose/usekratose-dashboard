import { describe, expect, it } from "vitest";

import {
  buildEvidenceCoverage,
  buildWorkspaceActivity,
} from "../lib/chart-data";
import type { DashboardProgram } from "../lib/types";

function program(
  snapshots: readonly Readonly<Record<string, unknown>>[],
  events: DashboardProgram["events"],
): DashboardProgram {
  return {
    currentSnapshot: snapshots[0] ?? null,
    displayName: "Vault Guard",
    eventCount: events.length,
    events,
    latestEvent: events[0] ?? null,
    program: {
      address: "program-address",
      cluster: "devnet",
      id: "program-id",
      monitoringStatus: "healthy",
      programDataAddress: "program-data-address",
    },
    securityStatus: "verified",
    snapshots,
    versionCount: snapshots.length,
  };
}

describe("buildWorkspaceActivity", () => {
  it("groups live snapshots and events without inventing empty periods", () => {
    const data = buildWorkspaceActivity([
      program(
        [
          { observedAt: "2026-09-30T17:05:00.000Z" },
          { observedAt: "2026-09-30T16:05:00.000Z" },
        ],
        [
          {
            detectedAt: "2026-09-30T17:05:00.000Z",
            evidence: {},
            id: "event-1",
            severity: "high",
            type: "PROGRAM_UPGRADED",
          },
        ],
      ),
    ]);

    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({
      cumulativeEvidence: 1,
      cumulativeHighPriority: 0,
      deployments: 1,
      events: 0,
    });
    expect(data[1]).toMatchObject({
      cumulativeEvidence: 2,
      cumulativeHighPriority: 1,
      deployments: 1,
      events: 1,
    });
  });
});

describe("buildEvidenceCoverage", () => {
  it("reports observed signal counts from the current snapshot", () => {
    const data = buildEvidenceCoverage({
      deploymentSlot: "505959293",
      executableHash: "sha256:hash",
      executableSize: 26400,
      fingerprint: "sha256:fingerprint",
      observedAt: "2026-09-30T17:05:00.000Z",
      observedSlot: "505959300",
      programOwner: "owner",
      sourceVerificationStatus: "unavailable",
      verificationStatus: "unknown",
    });

    expect(data.find((item) => item.key === "identity")).toMatchObject({
      observed: 3,
      total: 3,
      value: 100,
    });
    expect(data.find((item) => item.key === "provenance")).toMatchObject({
      observed: 0,
      total: 4,
      value: 0,
    });
  });
});
