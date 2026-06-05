export type CareReportResult = {
  points: string[]
  missing: string[]
  familyReport: string
  internalReport: string
}

export type CareReportHistoryItem = {
  id: string
  createdAt: string
  inputText: string
  result: CareReportResult
  userId?: string
}
