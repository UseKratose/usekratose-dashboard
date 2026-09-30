"use client";

import type { GaugeSeriesOption } from "echarts/charts";
import type { EChartsCoreOption } from "echarts/core";
import { ScanSearch } from "lucide-react";
import { useMemo } from "react";

import { buildEvidenceCoverage } from "@/lib/chart-data";

import { EChartsView } from "./echarts-view";

export function EvidenceCoverageChart({
  current,
}: {
  readonly current: Readonly<Record<string, unknown>> | null;
}) {
  const data = useMemo(() => buildEvidenceCoverage(current), [current]);
  const totalObserved = data.reduce((sum, item) => sum + item.observed, 0);
  const totalSignals = data.reduce((sum, item) => sum + item.total, 0);
  const overall = Math.round((totalObserved / totalSignals) * 100);
  const option = useMemo<EChartsCoreOption>(() => {
    const radii = ["98%", "83%", "68%", "53%"] as const;
    return {
      animationDuration: 700,
      animationEasing: "cubicOut",
      series: data.map(
        (item, index): GaugeSeriesOption => ({
          anchor: { show: false },
          axisLabel: { show: false },
          axisLine: {
            lineStyle: {
              color: [[1, "rgba(255, 255, 255, 0.075)"]],
              width: 11,
            },
          },
          axisTick: { show: false },
          center: ["50%", "82%"],
          data: [{ name: item.label, value: item.value }],
          detail: { show: false },
          endAngle: 0,
          itemStyle: {
            color: item.color,
            shadowBlur: index < 2 ? 8 : 0,
            shadowColor: `${item.color}33`,
          },
          max: 100,
          min: 0,
          pointer: { show: false },
          progress: { clip: false, overlap: false, roundCap: true, show: true },
          radius: radii[index] ?? "53%",
          splitLine: { show: false },
          startAngle: 180,
          title: { show: false },
          type: "gauge",
        }),
      ),
      tooltip: {
        backgroundColor: "rgba(18, 18, 18, 0.96)",
        borderColor: "rgba(179, 145, 104, 0.28)",
        borderRadius: 8,
        formatter: (parameters: unknown) => {
          const value = Array.isArray(parameters) ? parameters[0] : parameters;
          if (
            typeof value !== "object" ||
            value === null ||
            !("name" in value) ||
            !("value" in value)
          ) {
            return "Evidence unavailable";
          }
          return `${String(value.name)}<br/><b>${String(value.value)}%</b> captured`;
        },
        textStyle: { color: "#e7e2dc", fontSize: 11 },
        trigger: "item",
      },
    };
  }, [data]);

  return (
    <section className="inspection-section evidence-coverage-section">
      <div className="inspection-section-heading">
        <div>
          <h3>
            <ScanSearch size={15} /> Evidence coverage
          </h3>
          <p>Completeness of the current stored deployment record.</p>
        </div>
        <span>{overall}% captured</span>
      </div>
      <div className="evidence-coverage-layout">
        <div className="evidence-radial-wrap">
          <EChartsView
            ariaLabel={`Current deployment evidence is ${overall}% complete across ${totalSignals} deterministic signals`}
            className="evidence-radial-chart"
            option={option}
          />
          <div className="evidence-radial-total" aria-hidden="true">
            <strong>{overall}%</strong>
            <span>captured</span>
          </div>
        </div>
        <div className="evidence-coverage-legend">
          {data.map((item) => (
            <article key={item.key}>
              <i style={{ backgroundColor: item.color }} />
              <span>
                <b>{item.label}</b>
                <small>
                  {item.observed}/{item.total} signals
                </small>
              </span>
              <strong>{item.value}%</strong>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
