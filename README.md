# ケアレポAI MVP 会員履歴版

介護報告書をAI添削し、家族向け報告・社内向け報告に整えるWebアプリです。

## 追加済み機能

- メールアドレス・パスワードで会員登録
- ログイン / ログアウト
- マイページ `/mypage`
- ログイン中のAI添削結果をFirestoreへ保存
- マイページで履歴確認
- 家族向け報告 / 社内向け報告のコピー
- 履歴削除
- 写真撮影・画像アップロードからOCR読み取り
- 手入力でのAI添削

## セットアップ

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

## Firebase設定

Firebase Consoleで以下を有効にしてください。

1. Authentication
   - Sign-in method
   - Email/Password を有効化

2. Firestore Database
   - データベースを作成
   - `firestore.rules` の内容をルールに反映

3. Firebase Webアプリ設定
   - `.env.local` に `NEXT_PUBLIC_FIREBASE_...` を設定

## OpenAI設定

`.env.local` に以下を設定します。

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

## Firestore構成

```text
users/{uid}
  name
  email
  role: staff
  plan: free

users/{uid}/reports/{reportId}
  inputText
  result.points
  result.missing
  result.familyReport
  result.internalReport
  createdAt
  updatedAt
```

## 画面URL

```text
/                  TOP
/auth/register     会員登録
/auth/login        ログイン
/report            報告書AI添削
/mypage            マイページ履歴
/history           端末内履歴（未ログイン時の予備）
```

## 注意

介護記録を扱うため、利用者氏名・住所・電話番号・具体的な病名などの個人情報は入力せず、「A様」「B様」に置き換えて使う想定です。
