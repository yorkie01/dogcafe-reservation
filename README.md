\# 🐕 ドッグカフェ予約システム



愛犬と一緒に楽しめるドッグカフェの予約システムのプロトタイプです。



\## 🌟 機能



\- 4つの予約プラン（30分、60分、ランチ付き、ディナー付き）

\- ユーザー登録・ログイン機能

\- リアルタイム空き状況確認

\- 予約履歴の確認

\- 予約のキャンセル機能

\- レスポンシブデザイン（スマートフォン対応）

\- PWA対応



\## 🛠 技術スタック



\- \*\*フロントエンド\*\*: HTML/CSS/JavaScript（バニラJS）

\- \*\*バックエンド\*\*: Supabase（PostgreSQL, 認証）

\- \*\*ホスティング\*\*: GitHub Pages

\- \*\*CI/CD\*\*: GitHub Actions



\## 📦 セットアップ手順



\### 1. リポジトリのフォーク/クローン



```bash

git clone https://github.com/YOUR\_USERNAME/dogcafe-reservation.git

cd dogcafe-reservation

```



\### 2. Supabaseプロジェクトの作成



1\. \[Supabase](https://supabase.com)にアクセス

2\. 新規プロジェクトを作成

3\. SQL Editorで`docs/schema.sql`の内容を実行

4\. Settings → APIからURLとanon keyを取得



\### 3. GitHub Secretsの設定



リポジトリの Settings → Secrets and variables → Actions で以下を追加：



\- `SUPABASE\_URL`: SupabaseプロジェクトのURL

\- `SUPABASE\_ANON\_KEY`: Supabaseのanon public key



\### 4. GitHub Pagesの有効化



1\. Settings → Pages

2\. Source: Deploy from a branch

3\. Branch: `gh-pages` / `root`

4\. Save



\### 5. デプロイ



mainブランチにpushすると自動的にGitHub Actionsがビルド・デプロイを実行します。



\## 📱 使い方



1\. ブラウザで `https://YOUR\_USERNAME.github.io/dogcafe-reservation` にアクセス

2\. 新規登録またはログイン

3\. 希望のプランを選択

4\. 日時と詳細を入力して予約

5\. マイページから予約履歴を確認



\## 🔒 セキュリティ



\- APIキーはGitHub Secretsで管理

\- Supabase Row Level Security (RLS)でデータアクセスを制御

\- ユーザーは自分の予約データのみアクセス可能



\## 📝 今後の実装予定



\- \[ ] QRコード生成機能

\- \[ ] メール通知機能

\- \[ ] 管理者ダッシュボード

\- \[ ] 支払い機能の統合

\- \[ ] LINEログイン連携



\## 🤝 貢献



プルリクエストは歓迎します。大きな変更の場合は、まずissueを作成して変更内容について議論してください。



\## 📄 ライセンス



\[MIT](LICENSE)

