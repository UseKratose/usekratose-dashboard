"use client";

import type { EChartsCoreOption } from "echarts/core";
import { Activity, DatabaseZap } from "lucide-react";
import { useMemo } from "react";

import { buildWorkspaceActivity } from "@/lib/chart-data";
import type { DashboardProgram } from "@/lib/types";

import { EChartsView } from "./echarts-view";

export function OverviewActivityChart({
  programs,
}: {
  readonly programs: readonly DashboardProgram[];
}) {
  const data = useMemo(() => buildWorkspaceActivity(programs), [programs]);
  const option = useMemo<EChartsCoreOption>(() => {
    const labels = data.map((point) => point.label);
    const needsZoom = data.length > 9;
    return {
      animationDuration: 650,
      animationEasing: "cubicOut",
      backgroundColor: "transparent",
      dataZoom: needsZoom
        ? [
            {
              bottom: 4,
              borderColor: "rgba(179, 145, 104, 0.18)",
              dataBackground: {
                areaStyle: { color: "rgba(179, 145, 104, 0.12)" },
                lineStyle: { color: "rgba(179, 145, 104, 0.55)" },
              },
              fillerColor: "rgba(155, 28, 28, 0.09)",
              handleSize: "80%",
              height: 28,
              moveHandleSize: 0,
              showDetail: false,
              startValue: Math.max(0, data.length - 9),
              type: "slider",
            },
          ]
        : undefined,
      grid: {
        bottom: needsZoom ? 58 : 34,
        containLabel: true,
        left: 10,
        right: 14,
        top: 46,
      },
      legend: {
        data: [
          "Deployment snapshots",
          "Security events",
          "Stored evidence",
          "High-priority evidence",
        ],
        icon: "roundRect",
        itemGap: 18,
        itemHeight: 7,
        itemWidth: 7,
        left: 0,
        textStyle: { color: "#8f8a84", fontSize: 10 },
        top: 0,
      },
      series: [
        {
          barGap: "18%",
          barMaxWidth: 25,
          data: data.map((point) => point.deployments),
          emphasis: { focus: "series" },
          itemStyle: {
            borderRadius: [4, 4, 1, 1],
            color: {
              colorStops: [
                { color: "#b39168", offset: 0 },
                { color: "rgba(179, 145, 104, 0.28)", offset: 1 },
              ],
              type: "linear",
              x: 0,
              x2: 0,
              y: 0,
              y2: 1,
            },
          },
          name: "Deployment snapshots",
          type: "bar",
          yAxisIndex: 0,
        },
        {
          barMaxWidth: 25,
          data: data.map((point) => point.events),
          emphasis: { focus: "series" },
          itemStyle: {
            borderRadius: [4, 4, 1, 1],
            color: {
              colorStops: [
                { color: "#9b1c1c", offset: 0 },
                { color: "rgba(155, 28, 28, 0.25)", offset: 1 },
              ],
              type: "linear",
              x: 0,
              x2: 0,
              y: 0,
              y2: 1,
            },
          },
          name: "Security events",
          type: "bar",
          yAxisIndex: 0,
        },
        {
          data: data.map((point) => point.cumulativeEvidence),
          emphasis: { focus: "series" },
          itemStyle: { color: "#e7e2dc" },
          lineStyle: {
            color: "#e7e2dc",
            shadowBlur: 9,
            shadowColor: "rgba(231, 226, 220, 0.18)",
            width: 2,
          },
          name: "Stored evidence",
          showSymbol: data.length < 14,
          smooth: 0.35,
          symbol: "circle",
          symbolSize: 5,
          type: "line",
          yAxisIndex: 1,
        },
        {
          data: data.map((point) => point.cumulativeHighPriority),
          emphasis: { focus: "series" },
          itemStyle: { color: "#c95f5f" },
          lineStyle: { color: "#c95f5f", type: "dashed", width: 1.5 },
          name: "High-priority evidence",
          showSymbol: false,
          smooth: 0.35,
          type: "line",
          yAxisIndex: 1,
        },
      ],
      tooltip: {
        axisPointer: {
          lineStyle: { color: "rgba(179, 145, 104, 0.32)" },
          type: "line",
        },
        backgroundColor: "rgba(18, 18, 18, 0.96)",
        borderColor: "rgba(179, 145, 104, 0.28)",
        borderRadius: 8,
        padding: 12,
        textStyle: { color: "#e7e2dc", fontSize: 11 },
        trigger: "axis",
      },
      xAxis: {
        axisLabel: {
          color: "#706b66",
          fontSize: 9,
          hideOverlap: true,
          margin: 13,
        },
        axisLine: { lineStyle: { color: "rgba(255, 255, 255, 0.08)" } },
        axisTick: { show: false },
        data: labels,
        type: "category",
      },
      yAxis: [
        {
          axisLabel: { color: "#706b66", fontSize: 9 },
          axisLine: { show: false },
          axisTick: { show: false },
          minInterval: 1,
          splitLine: {
            lineStyle: { color: "rgba(255, 255, 255, 0.055)", type: "dashed" },
          },
          type: "value",
        },
        {
          axisLabel: { color: "#706b66", fontSize: 9 },
          axisLine: { show: false },
          axisTick: { show: false },
          minInterval: 1,
          splitLine: { show: false },
          type: "value",
        },
      ],
    };
  }, [data]);

  const storedEvidence = programs.reduce(
    (total, program) => total + program.snapshots.length,
    0,
  );
  const securityEvents = programs.reduce(
    (total, program) => total + program.events.length,
    0,
  );

  return (
    <article className="surface workspace-activity-surface">
      <div className="surface-header chart-surface-header">
        <div>
          <h2>Evidence activity</h2>
          <p>Observed deployments and deterministic changes over time.</p>
        </div>
        <div className="chart-totals" aria-label="Evidence totals">
          <span>
            <DatabaseZap size={13} />
            <b>{storedEvidence}</b> snapshots
          </span>
          <span>
            <Activity size={13} />
            <b>{securityEvents}</b> events
          </span>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="empty-state chart-empty-state">
          <Activity size={28} />
          <strong>No evidence activity yet</strong>
          <p>The chart activates after the first finalized observation.</p>
        </div>
      ) : (
        <EChartsView
          ariaLabel="Deployment snapshots, security events, stored evidence, and high-priority evidence over time"
          className="workspace-activity-chart"
          option={option}
        />
      )}
    </article>
  );
}
