export type DetectedCareTermResult = {
  term: string
  meaning: string
  familyExpression: string
  internalExpression: string
}

export type CareReportResult = {
  points: string[]
  missing: string[]
  detectedTerms?: DetectedCareTermResult[]
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
