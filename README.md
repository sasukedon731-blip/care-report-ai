# Care Report AI MVP（介護用語辞書・氏名そのまま対応版）

介護報告文をAIで添削し、家族向け報告・社内向け報告に変換するMVPです。
会員登録、ログイン、マイページ履歴保存、写真読み取り、介護略語・専門用語判定に対応しています。社内用として、読み取り・社内向け報告では氏名をA様に置き換えず、そのまま残す設定にしています。

## 追加された介護用語辞書

入力文に `KOT`、`BT`、`BP`、`HR`、`SpO2`、`Ns`、`Dr`、`食介` などが含まれる場合、AIに渡す前に辞書で検出します。

- 社内向け報告：氏名をそのまま残し、略語を必要に応じて残す
- 家族向け報告：略語をそのまま使わず、一般の家族に伝わる表現へ変換

例：

```text
入力：田中花子様、KOTあり。BT36.5。食介一部介助。
家族向け：排便が確認され、体温も確認しました。食事は一部お手伝いしながら召し上がりました。
社内向け：田中花子様、KOTあり。BT36.5。食介一部介助。
```

## セットアップ

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

`.env.local` に以下を設定してください。

```env
OPENAI_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Firebase

Authentication でメール/パスワードを有効化してください。
Firestore Database を作成し、同梱の `firestore.rules` を適用してください。

## 主なファイル

- `lib/careTerms.ts`：介護用語辞書
- `lib/careReportPrompt.ts`：介護用語対応プロンプト
- `app/api/ai/care-report/route.ts`：AI添削API
- `components/CareReportResult.tsx`：介護用語判定結果の表示
- `components/MyPageReports.tsx`：マイページ履歴

## 今回の変更

- OCR読み取り時に氏名をA様・B様へ置換しない
- 社内向け報告では入力された氏名をそのまま使用
- TOP画面・入力画面の注意文を社内利用前提に変更
- `.gitignore` を追加し、`node_modules` / `.next` / `.env.local` がGitに入らないように設定
