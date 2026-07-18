"use client";

import type { ChartData } from "@/types/analytics";

export function SectionCards({ today }: { today: ChartData }) {
  return (
    <div className="text-left px-6 flex justify-start items-center gap-3">
      <div className="w-[200px] rounded-md p-5 shadow-md ">
        <h2 className="font-bold">Active</h2>
        <h1 className="font-bold text-2xl">
          {today.present + today.absent + today.leave + today.late}
        </h1>
      </div>
      <div className="w-[200px] rounded-md p-5 shadow-md">
        <h2 className="font-bold">Present</h2>
        <h1 className="font-bold text-2xl">{today.present}</h1>
      </div>
      <div className="w-[200px] rounded-md p-5 shadow-md">
        <h2 className="font-bold">Absent</h2>
        <h1 className="font-bold text-2xl">{today.absent}</h1>
      </div>
    </div>
  );
}
