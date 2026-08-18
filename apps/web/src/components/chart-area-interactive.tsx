"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEffect, useMemo, useState } from "react";

export const description = "An interactive area chart";
import type { ChartData } from "@/types/analytics";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  present: {
    label: "Present",
    color: "var(--chart-1)", // Emerald green - represents positive attendance
  },
  absent: {
    label: "Absent",
    color: "var(--chart-2)", // Red - represents absence
  },
  leave: {
    label: "Leave",
    color: "var(--chart-3)", // Amber - represents planned time off
  },
  late: {
    label: "Late",
    color: "var(--chart-4)", // Purple - represents tardiness
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({
  chartData,
}: {
  chartData: ChartData[];
}) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = useState("90d");
  const [_loading, _setLoading] = useState(false);

  const [params, setParams] = useState<string[]>(["present"]);

  useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  const filteredData = useMemo(() => {
    if (!chartData.length) return [];

    // Sort data by date first
    const sortedData = [...chartData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Get the latest date from the data instead of hardcoding
    const latestDate = new Date(sortedData[sortedData.length - 1].date);

    // Calculate days to subtract based on timeRange
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    // Calculate start date from the latest date in data
    const startDate = new Date(latestDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    startDate.setHours(0, 0, 0, 0);

    // Filter data within the calculated range
    return sortedData.filter((item) => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate >= startDate && itemDate <= latestDate;
    });
  }, [chartData, timeRange]);

  useEffect(() => {
    console.log(params);
  }, [params]);

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => {
              setTimeRange(value[0] ?? "90d");
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value !== null) {
                setTimeRange(value);
              }
            }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="flex gap-4 mb-4">
          {Object.keys(chartConfig)
            .filter((key) => key !== "visitors")
            .map((item) => (
              <div
              role="button"
                key={item}
                style={{
                  backgroundColor: params.includes(item)
                    ? chartConfig[item as keyof typeof chartConfig].color
                    : "transparent",
                }}
                className="flex items-center gap-2 px-2 rounded-sm cursor-pointer"
                onClick={() => {
                  params.includes(item)
                    ? setParams(params.filter((p) => p !== item))
                    : setParams([...params, item]);
                }}
              >
                <span className="text-sm capitalize">{item}</span>
              </div>
            ))}
        </div>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              {/* Present - Green gradient */}
              <linearGradient id="fillPresent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-1)"
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Absent - Red gradient */}
              <linearGradient id="fillAbsent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-2)"
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Late - Purple gradient (FIX: was var(--chart-3), should be var(--chart-4)) */}
              <linearGradient id="fillLate" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-4)" // Changed from var(--chart-3) to var(--chart-4)
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-4)" // Changed from var(--chart-3) to var(--chart-4)
                  stopOpacity={0.1}
                />
              </linearGradient>

              {/* Leave - Amber gradient (FIX: was var(--chart-4), should be var(--chart-3)) */}
              <linearGradient id="fillLeave" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--chart-3)" // Changed from var(--chart-4) to var(--chart-3)
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--chart-3)" // Changed from var(--chart-4) to var(--chart-3)
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} opacity={0.3} />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />

            {/* Stacked areas with proper colors */}
            {params.map((p, idx) => {
              console.log(p[0].toUpperCase() + p.slice(1).toLowerCase());

              return (
                <Area
                  key={idx}
                  dataKey={p}
                  type="monotone"
                  fill={`url(#fill${p[0].toUpperCase() + p.slice(1).toLowerCase()})`}
                  stackId="a"
                  stroke="none"
                  strokeWidth={0}
                />
              );
            })}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
