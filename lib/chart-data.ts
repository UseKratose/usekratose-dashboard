import type { DashboardProgram } from "./types";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

type Snapshot = Readonly<Record<string, unknown>>;

export interface ActivityDatum {
  readonly cumulativeEvidence: number;
  readonly cumulativeHighPriority: number;
  readonly deployments: number;
  readonly events: number;
  readonly label: string;
  readonly timestamp: number;
}

export interface EvidenceCoverageDatum {
  readonly color: string;
  readonly key: "identity" | "chain" | "provenance" | "verification";
  readonly label: string;
  readonly observed: number;
  readonly total: number;
  readonly value: number;
}

function stringValue(snapshot: Snapshot | null, key: string): string | null {
  const value = snapshot?.[key];
  if (typeof value === "string") return value.trim() === "" ? null : value;
  if (typeof value === "number" || typeof value === "bigint")
    return String(value);
  return null;
}

function dateValue(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function bucketSize(range: number): number {
  if (range <= 36 * HOUR) return HOUR;
  if (range <= 45 * DAY) return DAY;
  return WEEK;
}

function bucketTimestamp(timestamp: number, interval: number): number {
  return Math.floor(timestamp / interval) * interval;
}

function formatBucket(timestamp: number, interval: number): string {
  const date = new Date(timestamp);
  if (interval === HOUR) {
    return new Intl.DateTimeFormat("en", {
      day: "numeric",
      hour: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(date);
  }
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export function buildWorkspaceActivity(
  programs: readonly DashboardProgram[],
): readonly ActivityDatum[] {
  const snapshotTimes = programs.flatMap((program) =>
    program.snapshots.flatMap((snapshot) => {
      const timestamp = dateValue(snapshot.observedAt);
      return timestamp === null ? [] : [timestamp];
    }),
  );
  const eventRecords = programs.flatMap((program) =>
    program.events.flatMap((event) => {
      const timestamp = dateValue(event.detectedAt);
      return timestamp === null ? [] : [{ severity: event.severity, timestamp }];
    }),
  );
  const timestamps = [
    ...snapshotTimes,
    ...eventRecords.map((record) => record.timestamp),
  ];
  if (timestamps.length === 0) return [];

  const minimum = Math.min(...timestamps);
  const maximum = Math.max(...timestamps);
  const interval = bucketSize(maximum - minimum);
  const buckets = new Map<
    number,
    { deployments: number; events: number; highPriority: number }
  >();

  for (const timestamp of snapshotTimes) {
    const key = bucketTimestamp(timestamp, interval);
    const bucket = buckets.get(key) ?? {
      deployments: 0,
      events: 0,
      highPriority: 0,
    };
    bucket.deployments += 1;
    buckets.set(key, bucket);
  }
  for (const event of eventRecords) {
    const key = bucketTimestamp(event.timestamp, interval);
    const bucket = buckets.get(key) ?? {
      deployments: 0,
      events: 0,
      highPriority: 0,
    };
    bucket.events += 1;
    if (event.severity === "high" || event.severity === "critical") {
      bucket.highPriority += 1;
    }
    buckets.set(key, bucket);
  }

  let cumulativeEvidence = 0;
  let cumulativeHighPriority = 0;
  return [...buckets.entries()]
    .sort(([left], [right]) => left - right)
    .map(([timestamp, bucket]) => {
      cumulativeEvidence += bucket.deployments;
      cumulativeHighPriority += bucket.highPriority;
      return {
        cumulativeEvidence,
        cumulativeHighPriority,
        deployments: bucket.deployments,
        events: bucket.events,
        label: formatBucket(timestamp, interval),
        timestamp,
      };
    });
}

function coverage(
  key: EvidenceCoverageDatum["key"],
  label: string,
  color: string,
  checks: readonly boolean[],
): EvidenceCoverageDatum {
  const observed = checks.filter(Boolean).length;
  return {
    color,
    key,
    label,
    observed,
    total: checks.length,
    value: Math.round((observed / checks.length) * 100),
  };
}

export function buildEvidenceCoverage(
  current: Snapshot | null,
): readonly EvidenceCoverageDatum[] {
  const verificationStatus = stringValue(current, "verificationStatus");
  const sourceVerification = stringValue(
    current,
    "sourceVerificationStatus",
  );
  return [
    coverage("identity", "Executable identity", "#b39168", [
      stringValue(current, "executableHash") !== null,
      stringValue(current, "executableSize") !== null,
      stringValue(current, "fingerprint") !== null,
    ]),
    coverage("chain", "Chain context", "#9b1c1c", [
      stringValue(current, "deploymentSlot") !== null,
      stringValue(current, "observedAt") !== null,
      stringValue(current, "observedSlot") !== null,
      stringValue(current, "programOwner") !== null,
    ]),
    coverage("provenance", "Build provenance", "#8d7458", [
      stringValue(current, "idlHash") !== null,
      stringValue(current, "sourceRepositoryUrl") !== null,
      stringValue(current, "sourceRevision") !== null,
      sourceVerification !== null && sourceVerification !== "unavailable",
    ]),
    coverage("verification", "Trust verification", "#e7e2dc", [
      verificationStatus !== null && verificationStatus !== "unknown",
      stringValue(current, "trustedFingerprint") !== null,
    ]),
  ];
}
