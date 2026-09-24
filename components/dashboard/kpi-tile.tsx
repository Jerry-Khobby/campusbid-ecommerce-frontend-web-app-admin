"use client"

import type { LucideIcon } from "lucide-react"
import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import Link from "next/link"
import { Line, LineChart, ResponsiveContainer } from "recharts"

// Chart chrome tokens - see the dataviz skill's palette.md ("Chart chrome & ink").
const INK_MUTED = "#898781"
const DELTA_UP_GOOD = "#006300"
const DELTA_DOWN_BAD = "#d03b3b"

interface DeltaProps {
  /** Percentage change vs the comparison period; null = no prior-period baseline. */
  deltaPct: number | null
  comparisonLabel: string
}

export interface KpiTileProps {
  label: string
  value: string
  icon: LucideIcon
  accentColor: string
  /** Omit entirely for "stock" KPIs (a snapshot, not a flow) where a period
   * comparison doesn't apply - pass `caption` instead for a plain static line. */
  delta?: DeltaProps
  caption?: string
  link?: { href: string; label: string }
  /** Recent-history sparkline points, oldest first. Omit for KPIs with no natural trend line. */
  sparkline?: number[]
}

function DeltaBadge({ deltaPct, comparisonLabel, hasCurrentValue }: { deltaPct: number | null; comparisonLabel: string; hasCurrentValue: boolean }) {
  if (deltaPct === null) {
    return (
      <span className="text-xs font-medium text-gray-400">
        {hasCurrentValue ? "New this period" : `No data ${comparisonLabel}`}
      </span>
    )
  }

  if (deltaPct === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500">
        <Minus size={12} />
        Flat {comparisonLabel}
      </span>
    )
  }

  const isUp = deltaPct > 0
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-semibold"
      style={{ color: isUp ? DELTA_UP_GOOD : DELTA_DOWN_BAD }}
    >
      {isUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
      {Math.abs(deltaPct)}% {comparisonLabel}
    </span>
  )
}

/** A stat tile: label, auto-compact value, delta vs a named period, and an optional
 * sparkline (muted history with the current point picked out in the tile's accent). */
export function KpiTile({ label, value, icon: Icon, accentColor, delta, caption, link, sparkline }: KpiTileProps) {
  const sparklineData = sparkline?.map((v, i) => ({ i, v }))
  const lastIndex = sparklineData ? sparklineData.length - 1 : -1
  const hasCurrentValue = sparkline ? sparkline[sparkline.length - 1] > 0 : value !== "0"

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- recharts' custom-dot prop type is overly strict for this use
  const renderCurrentPointDot = (props: any) => {
    if (props.index !== lastIndex || props.cx === undefined || props.cy === undefined) {
      return <g key={`dot-${props.index}`} />
    }
    return <circle key={`dot-${props.index}`} cx={props.cx} cy={props.cy} r={3} fill={accentColor} stroke="none" />
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1.5 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accentColor}1a`, color: accentColor }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        {delta ? (
          <DeltaBadge deltaPct={delta.deltaPct} comparisonLabel={delta.comparisonLabel} hasCurrentValue={hasCurrentValue} />
        ) : link ? (
          <Link href={link.href} className="text-xs font-medium hover:underline" style={{ color: accentColor }}>
            {link.label}
          </Link>
        ) : caption ? (
          <span className="text-xs text-gray-500">{caption}</span>
        ) : (
          <span />
        )}

        {sparklineData && sparklineData.length > 1 && (
          <div className="h-8 w-20 shrink-0" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke={INK_MUTED}
                  strokeWidth={1.5}
                  dot={renderCurrentPointDot}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
