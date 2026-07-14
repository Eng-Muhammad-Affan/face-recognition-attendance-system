"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react"

export function SectionCards() {
  return (
    <div className="text-left px-6 flex justify-start items-center gap-3">
      <div className="w-[200px] rounded-md p-5 shadow-md shadow-blue-500">
        <h2 className="font-bold">Active students</h2>
        <h1 className="font-bold text-2xl">{45}</h1>
      </div>
      <div className="w-[200px] rounded-md p-5 shadow-md shadow-blue-500">
        <h2 className="font-bold">Present</h2>
        <h1 className="font-bold text-2xl">{15}</h1>
      </div>
      <div className="w-[200px] rounded-md p-5 shadow-md shadow-blue-500">
        <h2 className="font-bold">Absent</h2>
        <h1 className="font-bold text-2xl">{15}</h1>
      </div>
    </div>
  )
}
