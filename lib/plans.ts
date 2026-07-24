export const DAILY_USAGE_LIMIT = 5

export const PLANS = {
  month1: { id: "month1", label: "1か月", durationDays: 30, price: 500 },
  month6: { id: "month6", label: "6か月", durationDays: 180, price: 2800 },
  month12: { id: "month12", label: "12か月", durationDays: 365, price: 5400 },
} as const

export type PlanId = keyof typeof PLANS

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLANS
}
