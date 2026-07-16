"use client";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import type { ChartData } from "@/types/analytics";

export default function Page() {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get("/analytics.json");
        setChartData(response.data);
      } catch (err) {
        alert(JSON.stringify(err));
      }
    };

    getData();
  }, []);

  const today = useMemo(() => {
    return chartData.find((data) => new Date(data.date) < new Date());
  }, [chartData]);

  return (
    <>
      {today && <SectionCards today={today} />}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive chartData={chartData} />
      </div>
    </>
  );
}
