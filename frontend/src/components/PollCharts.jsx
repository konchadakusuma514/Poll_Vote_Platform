import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { BarChart3, PieChart as PieIcon, ListFilter } from "lucide-react";

const COLORS = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#8b5cf6", // Purple
  "#f97316", // Orange
  "#14b8a6"  // Teal
];

export const PollCharts = ({ options, totalVotes }) => {
  const [chartType, setChartType] = useState("bars"); // 'bars' | 'donut' | 'progress'

  const chartData = options.map((opt, index) => ({
    name: opt.text.length > 22 ? opt.text.substring(0, 20) + "..." : opt.text,
    fullName: opt.text,
    votes: opt.voteCount,
    percentage: opt.percentage,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-white mb-1">{data.fullName}</p>
          <p className="text-indigo-400 font-bold">
            {data.votes} {data.votes === 1 ? "vote" : "votes"} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Chart Type Selector Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400">Visual Breakdown</h4>
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setChartType("bars")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              chartType === "bars"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bar Chart</span>
          </button>
          <button
            onClick={() => setChartType("donut")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              chartType === "donut"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Donut Chart</span>
          </button>
          <button
            onClick={() => setChartType("progress")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              chartType === "progress"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List View</span>
          </button>
        </div>
      </div>

      {totalVotes === 0 ? (
        <div className="py-8 text-center text-slate-500 text-sm">
          No votes cast yet. Be the first one to vote!
        </div>
      ) : (
        <div className="pt-2">
          {/* Bar Chart View */}
          {chartType === "bars" && (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Donut Chart View */}
          {chartType === "donut" && (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(val, entry) => (
                      <span className="text-xs text-slate-300 font-medium">
                        {entry.payload.fullName}
                      </span>
                    )}
                  />
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="votes"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Progress List View */}
          {chartType === "progress" && (
            <div className="space-y-3">
              {options.map((opt, idx) => {
                const color = COLORS[idx % COLORS.length];
                return (
                  <div key={opt.id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-200">{opt.text}</span>
                      <span className="text-slate-400">
                        {opt.voteCount} votes ({opt.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.max(opt.percentage, 2)}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
