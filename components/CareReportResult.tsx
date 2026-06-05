type Result = {
  points: string[]
  missing: string[]
  familyReport: string
  internalReport: string
}

function EmptyState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-[2rem] border border-dashed border-slate-300 bg-white/70 p-6 text-center">
      <div>
        <p className="text-4xl">📝</p>
        <p className="mt-3 font-black text-slate-800">添削結果がここに表示されます</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          報告文を入力して「AIで添削する」を押してください。
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-black text-slate-900">{title}</h3>
      {children}
    </section>
  )
}

export default function CareReportResult({
  result,
  loading,
}: {
  result: Result | null
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[2rem] border border-emerald-100 bg-white p-6 text-center shadow-lg shadow-slate-900/5">
        <div>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          <p className="mt-4 font-black text-slate-800">AIが報告文を確認しています</p>
          <p className="mt-2 text-sm text-slate-500">添削ポイントと2種類の報告文を作成中です。</p>
        </div>
      </div>
    )
  }

  if (!result) return <EmptyState />

  return (
    <div className="space-y-4">
      <Section title="① 添削ポイント">
        <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
          {result.points?.map((point, index) => <li key={index}>{point}</li>)}
        </ul>
      </Section>

      <Section title="② 確認した方がよい不足情報">
        {result.missing?.length ? (
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-700">
            {result.missing.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">大きな不足情報はありません。</p>
        )}
      </Section>

      <Section title="③ 家族向け報告">
        <p className="whitespace-pre-wrap text-sm leading-8 text-slate-800">{result.familyReport}</p>
      </Section>

      <Section title="④ 社内向け報告">
        <p className="whitespace-pre-wrap text-sm leading-8 text-slate-800">{result.internalReport}</p>
      </Section>
    </div>
  )
}
