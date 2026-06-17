export type CareTerm = {
  term: string
  meaning: string
  familyExpression: string
  internalExpression: string
  caution: string
  aliases?: string[]
}

export type DetectedCareTerm = CareTerm & {
  matched: string
}

export const careTerms: CareTerm[] = [
  {
    term: "KOT",
    meaning: "排便",
    familyExpression: "排便が確認できました",
    internalExpression: "KOTあり / 排便あり",
    caution: "家族向けにはKOTという略語を使わず、排便として説明する",
    aliases: ["Kot", "kot"],
  },
  {
    term: "BT",
    meaning: "体温",
    familyExpression: "体温を確認しました",
    internalExpression: "BT確認 / 体温確認",
    caution: "数値がある場合は社内向けに記録し、家族向けでは必要に応じて平易に説明する",
    aliases: ["bt", "体温"],
  },
  {
    term: "BP",
    meaning: "血圧",
    familyExpression: "血圧を確認しました",
    internalExpression: "BP確認 / 血圧確認",
    caution: "家族向けには医療的な断定を避ける",
    aliases: ["bp", "血圧"],
  },
  {
    term: "HR",
    meaning: "脈拍",
    familyExpression: "脈拍を確認しました",
    internalExpression: "HR確認 / 脈拍確認",
    caution: "異常の有無は元文にある範囲でのみ書く",
    aliases: ["hr", "脈拍"],
  },
  {
    term: "SpO2",
    meaning: "酸素飽和度",
    familyExpression: "呼吸状態の確認を行いました",
    internalExpression: "SpO2確認",
    caution: "家族向けでは専門用語を避け、必要に応じて呼吸状態として説明する",
    aliases: ["SPO2", "spo2", "Sp02", "酸素飽和度"],
  },
  {
    term: "KT",
    meaning: "体温",
    familyExpression: "体温を確認しました",
    internalExpression: "KT確認 / 体温確認",
    caution: "施設によってBTと同じ意味で使われることがあるため、社内向けでは略語を残してよい",
    aliases: ["kt"],
  },
  {
    term: "Ns",
    meaning: "看護師",
    familyExpression: "看護職員が確認しました",
    internalExpression: "Ns確認 / 看護師確認",
    caution: "家族向けにはNsではなく看護職員または看護師と書く",
    aliases: ["NS", "ns"],
  },
  {
    term: "Dr",
    meaning: "医師",
    familyExpression: "医師に確認しました",
    internalExpression: "Dr確認 / 医師確認",
    caution: "家族向けにはDrではなく医師と書く",
    aliases: ["DR", "dr"],
  },
  {
    term: "Pt",
    meaning: "利用者・患者",
    familyExpression: "A様",
    internalExpression: "Pt / 利用者",
    caution: "このアプリでは個人情報保護のため家族向けはA様に置き換える",
    aliases: ["PT", "pt"],
  },
  {
    term: "食介",
    meaning: "食事介助",
    familyExpression: "食事のお手伝いをしました",
    internalExpression: "食介あり / 食事介助あり",
    caution: "家族向けには食介という略語を使わない",
  },
  {
    term: "排介",
    meaning: "排泄介助",
    familyExpression: "排泄のお手伝いをしました",
    internalExpression: "排介あり / 排泄介助あり",
    caution: "家族向けには排介という略語を使わない",
  },
  {
    term: "移乗介助",
    meaning: "ベッド・車いすなどへの移動介助",
    familyExpression: "移動時に安全に配慮してお手伝いしました",
    internalExpression: "移乗介助実施",
    caution: "家族向けには何をしたかが伝わる表現にする",
  },
  {
    term: "更衣介助",
    meaning: "着替えの介助",
    familyExpression: "着替えのお手伝いをしました",
    internalExpression: "更衣介助実施",
    caution: "家族向けにはやさしい言い方にする",
  },
  {
    term: "入浴介助",
    meaning: "入浴の介助",
    familyExpression: "入浴のお手伝いをしました",
    internalExpression: "入浴介助実施",
    caution: "皮膚状態などは元文にある場合だけ書く",
  },
  {
    term: "服薬",
    meaning: "薬を飲むこと",
    familyExpression: "お薬を服用されました",
    internalExpression: "服薬確認",
    caution: "服薬忘れなどは事実と対応を分けて書く",
  },
  {
    term: "傾眠",
    meaning: "うとうとしている状態",
    familyExpression: "少し眠そうな様子が見られました",
    internalExpression: "傾眠傾向あり",
    caution: "家族向けには不安をあおらず、様子と対応を説明する",
  },
]

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function detectCareTerms(inputText: string): DetectedCareTerm[] {
  const found = new Map<string, DetectedCareTerm>()

  for (const item of careTerms) {
    const candidates = [item.term, ...(item.aliases ?? [])]
    for (const candidate of candidates) {
      const pattern = /^[A-Za-z0-9]+$/.test(candidate)
        ? new RegExp(`(^|[^A-Za-z0-9])(${escapeRegExp(candidate)})(?=$|[^A-Za-z0-9])`, "i")
        : new RegExp(escapeRegExp(candidate))

      const match = inputText.match(pattern)
      if (match) {
        found.set(item.term, { ...item, matched: match[2] ?? candidate })
        break
      }
    }
  }

  return Array.from(found.values())
}

export function formatDetectedCareTermsForPrompt(terms: DetectedCareTerm[]) {
  if (terms.length === 0) return "該当なし"

  return terms
    .map((item) => {
      return `- ${item.term}（入力内の表記: ${item.matched}）\n  意味: ${item.meaning}\n  家族向け表現: ${item.familyExpression}\n  社内向け表現: ${item.internalExpression}\n  注意: ${item.caution}`
    })
    .join("\n")
}
