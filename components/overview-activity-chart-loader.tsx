"use client";

import dynamic from "next/dynamic";

import type { DashboardProgram } from "@/lib/types";

const OverviewActivityChart = dynamic(
  () =>
    import("./overview-activity-chart").then(
      (module) => module.OverviewActivityChart,
    ),
  {
    loading: () => (
      <article
        aria-label="Loading evidence activity chart"
        className="surface workspace-activity-surface chart-loading"
      >
        <div className="surface-header chart-surface-header">
          <div>
            <h2>Evidence activity</h2>
            <p>Preparing stored deployment evidence.</p>
          </div>
        </div>
        <i />
      </article>
    ),
    ssr: false,
  },
);

export function OverviewActivityChartLoader({
  programs,
}: {
  readonly programs: readonly DashboardProgram[];
}) {
  return <OverviewActivityChart programs={programs} />;
}
