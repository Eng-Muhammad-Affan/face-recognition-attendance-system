"use client";

import { BriefcaseIcon, Clock, User, Building2, Mail } from "lucide-react";
import dayjs, { formatDate } from "@/lib/dayjs";
import { useState, useEffect } from "react";
import axios from "axios";

type AttendanceLog = {
  id: string;
  name: string;
  department: string;
  email: string;
  check_in_time: string;
  status: string;
  role: string;
};

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    present: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/25",
    late: "bg-amber-500/10 text-amber-400 ring-amber-500/25",
    absent: "bg-red-500/10 text-red-400 ring-red-500/25",
    "on leave": "bg-blue-500/10 text-blue-400 ring-blue-500/25",
  };
  return (
    statusMap[status.toLowerCase()] ||
    "bg-zinc-500/10 text-zinc-400 ring-zinc-500/25"
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 rounded-full bg-zinc-800/50 p-4">
      <Clock className="h-8 w-8 text-zinc-500" />
    </div>
    <h3 className="text-lg font-medium text-zinc-400">No attendance logs</h3>
    <p className="mt-1 text-sm text-zinc-500">
      Attendance records will appear here once available.
    </p>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500" />
    <p className="text-sm text-zinc-500">Loading attendance logs...</p>
  </div>
);

export default function LogsPage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get("/logs.json");
        setLogs(response.data || []);
      } catch (error) {
        console.error("Failed to fetch attendance logs:", error);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  if (!logs || logs.length === 0) {
    return <EmptyState />;
  }

  return (
    <section id="attendance-logs" className="min-h-screen text-black bg-white">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Timeline */}
        <ol className="relative ml-3 space-y-12 border-l-2 border-zinc-200">
          {logs.map((log, index) => {
            const isLatest = index === 0;

            return (
              <li key={log.id} className="group relative pl-10">
                {/* Timeline dot */}
                <span
                  className={`absolute -left-[15px] top-1 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-white transition-all duration-300 group-hover:scale-110 ${
                    isLatest
                      ? "bg-emerald-500 ring-emerald-500/20"
                      : "bg-zinc-300 ring-zinc-300/20"
                  }`}
                >
                  <BriefcaseIcon
                    size={13}
                    className={isLatest ? "text-white" : "text-zinc-600"}
                    aria-hidden="true"
                  />
                </span>

                {/* Card */}
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-md">
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-400" />
                        <h3 className="text-lg font-semibold text-zinc-900">
                          {log.name}
                        </h3>
                      </div>
                      {isLatest && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-600/20">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                          </span>
                          Latest
                        </span>
                      )}
                    </div>

                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${getStatusColor(log.status)}`}
                    >
                      {log.status}
                    </span>
                  </div>

                  {/* Department */}
                  <div className="mt-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <p className="font-medium text-emerald-700">
                      {log.department}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{log.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="h-3.5 w-3.5" />
                      <span>{log.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      <time dateTime={log.check_in_time}>
                        {formatDate(
                          dayjs(log.check_in_time).toDate(),
                          "dddd, MMMM D, YYYY [at] h:mm A",
                        )}
                      </time>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Footer stats */}
        {logs.length > 0 && (
          <div className="mt-8 text-center text-sm text-zinc-500">
            Showing {logs.length} attendance record
            {logs.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </section>
  );
}
