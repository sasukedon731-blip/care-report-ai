export const DAILY_USAGE_LIMIT = 5

export const COMPANY_PLANS = {
  starter10: {
    id: "starter10",
    label: "スターター",
    seatLimit: 10,
    pricePerSeat: 550,
    monthlyPrice: 5500,
  },
  standard30: {
    id: "standard30",
    label: "スタンダード",
    seatLimit: 30,
    pricePerSeat: 500,
    monthlyPrice: 15000,
  },
  business50: {
    id: "business50",
    label: "ビジネス",
    seatLimit: 50,
    pricePerSeat: 450,
    monthlyPrice: 22500,
  },
} as const

export type CompanyPlanId = keyof typeof COMPANY_PLANS | "enterprise"

export function isFixedCompanyPlan(value: unknown): value is keyof typeof COMPANY_PLANS {
  return typeof value === "string" && value in COMPANY_PLANS
}
