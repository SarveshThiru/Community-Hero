"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Bar, Doughnut, Line } from "react-chartjs-2"
import { cn } from "@/lib/utils"
import type { AnalyticsData, CategoryStats, MonthlyStats } from "@/types"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// The City as Data Field: series differentiate by ink density and dash pattern,
// never by hue. Red is reserved for critical.
const INK_STEPS = [
  "#000000",
  "rgba(0,0,0,0.62)",
  "rgba(0,0,0,0.4)",
  "#e2140a",
  "rgba(0,0,0,0.26)",
  "rgba(0,0,0,0.16)",
  "rgba(0,0,0,0.09)",
  "rgba(0,0,0,0.05)",
]

const CHART_DASHES = [
  undefined,
  [6, 3],
  [2, 2],
  undefined,
  [8, 4],
  [4, 4],
  [1, 3],
  [10, 4],
]

const COLORS = {
  blue: INK_STEPS[0],
  green: INK_STEPS[1],
  amber: INK_STEPS[2],
  red: INK_STEPS[3],
  purple: INK_STEPS[4],
  orange: INK_STEPS[5],
  cyan: INK_STEPS[6],
  pink: INK_STEPS[7],
}

const CHART_COLORS = [...INK_STEPS]

interface ChartContainerProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function ChartContainer({ title, children, className }: ChartContainerProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-6", className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  )
}

interface CategoryChartProps {
  data: CategoryStats[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = {
    labels: data.map(d => d.category.replace("_", " ")),
    datasets: [{
      label: "Reports",
      data: data.map(d => d.count),
      backgroundColor: CHART_COLORS.slice(0, data.length),
      borderColor: CHART_COLORS.slice(0, data.length).map(c => c + "CC"),
      borderWidth: 1,
      borderRadius: 8,
    }],
  }

  return (
    <Bar
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw} reports`,
            },
          },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.15)" } },
          x: { grid: { display: false } },
        },
      }}
    />
  )
}

interface StatusChartProps {
  data: { status: string; count: number; percentage: number }[]
}

export function StatusChart({ data }: StatusChartProps) {
  const statusColors: Record<string, string> = {
    reported: COLORS.blue,
    verified: COLORS.amber,
    assigned: COLORS.purple,
    in_progress: COLORS.orange,
    resolved: COLORS.green,
    rejected: COLORS.red,
  }

  const chartData = {
    labels: data.map(d => d.status.replace("_", " ")),
    datasets: [{
      data: data.map(d => d.count),
      backgroundColor: data.map(d => statusColors[d.status] || COLORS.blue),
      borderWidth: 0,
    }],
  }

  return (
    <Doughnut
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "right",
            labels: { usePointStyle: true, padding: 16, font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.label}: ${context.raw} (${data[context.dataIndex].percentage}%)`,
            },
          },
        },
      }}
    />
  )
}

interface MonthlyTrendChartProps {
  data: MonthlyStats[]
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const chartData = {
    labels: data.map(d => d.month),
    datasets: [
      {
        label: "Reported",
        data: data.map(d => d.reported),
        borderColor: COLORS.blue,
        backgroundColor: COLORS.blue + "20",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Resolved",
        data: data.map(d => d.resolved),
        borderColor: COLORS.green,
        backgroundColor: COLORS.green + "20",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Pending",
        data: data.map(d => d.pending),
        borderColor: COLORS.amber,
        backgroundColor: COLORS.amber + "20",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  return (
    <Line
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top", labels: { usePointStyle: true, padding: 16 } },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.15)" } },
          x: { grid: { display: false } },
        },
        interaction: { intersect: false, mode: "index" },
      }}
    />
  )
}

interface SeverityChartProps {
  data: { severity: string; count: number }[]
}

export function SeverityChart({ data }: SeverityChartProps) {
  const severityColors: Record<string, string> = {
    critical: COLORS.red,
    high: COLORS.orange,
    medium: COLORS.amber,
    low: COLORS.green,
  }

  const chartData = {
    labels: data.map(d => d.severity),
    datasets: [{
      label: "Issues",
      data: data.map(d => d.count),
      backgroundColor: data.map(d => severityColors[d.severity] || COLORS.blue),
      borderColor: data.map(d => severityColors[d.severity] || COLORS.blue),
      borderWidth: 1,
      borderRadius: 8,
    }],
  }

  return (
    <Bar
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.15)" } },
          y: { grid: { display: false } },
        },
      }}
    />
  )
}

interface DepartmentPerformanceChartProps {
  data: { department: string; resolved: number; pending: number; avgTime: number }[]
}

export function DepartmentPerformanceChart({ data }: DepartmentPerformanceChartProps) {
  const chartData = {
    labels: data.map(d => d.department),
    datasets: [
      {
        label: "Resolved",
        data: data.map(d => d.resolved),
        backgroundColor: COLORS.green,
        borderRadius: 8,
      },
      {
        label: "Pending",
        data: data.map(d => d.pending),
        backgroundColor: COLORS.amber,
        borderRadius: 8,
      },
    ],
  }

  return (
    <Bar
      data={chartData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { usePointStyle: true } } },
        scales: {
          y: { beginAtZero: true, grid: { color: "rgba(0,0,0,0.15)" } },
          x: { grid: { display: false } },
        },
      }}
    />
  )
}

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon?: React.ReactNode
  className?: string
}

export function StatCard({ title, value, change, changeType = "neutral", icon, className }: StatCardProps) {
  const changeColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-500",
  }

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={cn("mt-1 text-sm font-medium", changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        {icon && <div className="text-gray-300">{icon}</div>}
      </div>
    </div>
  )
}
