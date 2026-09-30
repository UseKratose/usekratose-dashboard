"use client";

import { BarChart, GaugeChart, LineChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { init, use, type ECharts, type EChartsCoreOption } from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useEffect, useRef } from "react";

use([
  BarChart,
  DataZoomComponent,
  GaugeChart,
  GridComponent,
  LegendComponent,
  LineChart,
  SVGRenderer,
  TooltipComponent,
]);

export function EChartsView({
  ariaLabel,
  className,
  onChartReady,
  option,
}: {
  readonly ariaLabel: string;
  readonly className?: string;
  readonly onChartReady?: (chart: ECharts) => void;
  readonly option: EChartsCoreOption;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ECharts | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) return;
    const chart = init(container, undefined, { renderer: "svg" });
    chartRef.current = chart;
    onChartReady?.(chart);
    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(container);
    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [onChartReady]);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  return (
    <div
      aria-label={ariaLabel}
      className={className}
      ref={containerRef}
      role="img"
    />
  );
}
