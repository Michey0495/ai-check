# QA Report - web-url-a (AI Check)

**Date:** 2026-03-09 (Night 20)
**Tester:** Claude Code (自動QA)

## チェックリスト

- [x] `npm run build` 成功 (40ページ, ~8秒)
- [x] `npm run lint` エラーなし
- [x] レスポンシブ対応 (モバイル・デスクトップ)
- [x] favicon, OGP設定
- [x] 404ページ
- [x] ローディング状態の表示
- [x] エラー状態の表示

## 修正済み (Night 20)

### Security

| Issue | File | Fix |
|-------|------|-----|
| Feedback API: 任意リポジトリへのIssue作成が可能 | `api/feedback/route.ts` | ALLOWED_REPOS allowlistで制限 |
| safeFetch: レスポンスボディサイズ無制限（DoS） | `api/check/route.ts` | 5MBストリーミング制限を追加 |
| Badge API: レート制限なし（増幅攻撃ベクター） | `api/badge/route.ts` | 30req/min/IPのレート制限を追加 |

### Bugs

| Issue | File | Fix |
|-------|------|-----|
| robots.txt判定の正規表現がUser-agentブロックを跨いで誤検出 | `api/check/route.ts` | 次のUser-agentブロックで停止する正規表現に修正 |
| `getGrade` でmaxScore=0時にNaN | `lib/check-indicators.ts` | ゼロ除算ガード追加 |
| `handleDownloadZip` で不正URLが例外発生 | `check/check-client.tsx` | try/catchでデフォルトhostnameを使用 |

### UX/Accessibility

| Issue | File | Fix |
|-------|------|-----|
| フィードバック送信失敗時にalert()使用 | `feedback-widget.tsx` | インラインエラーメッセージに変更 |
| フィードバックタイプボタンのaria-pressed欠如 | `feedback-widget.tsx` | aria-pressed属性を追加 |
| ガイドドロップダウンのEscapeキー非対応 | `header.tsx` | onKeyDownでEscapeハンドリング追加 |
| バッジプレビューのonError未設定 | `badge/generator-client.tsx` | onErrorで非表示化を追加 |

### 過去修正済み (Night 19以前)

- lint警告修正、フォントサイズ違反修正
- スキップリンク、ARIA属性、フォームaria-label実装
- デザインシステム準拠確認

## 未修正（低優先度）

| Issue | Severity | Reason |
|-------|----------|--------|
| SSRF: DNS rebinding攻撃 | LOW | Vercelエッジランタイムで実質リスク低 |
| IPv6プライベートアドレスの不完全チェック | LOW | 主要ケースはカバー済み |
| sitemap.tsのlastModifiedが常に現在時刻 | LOW | 機能的には問題なし |
| 一部ページでopenGraph.url未設定 | LOW | Next.jsがデフォルトマージで対応 |
| モバイルナビのフォーカストラップ未実装 | LOW | 基本的なナビゲーションは動作 |
| check-client.tsx (~850行) の分割 | LOW | 機能的に問題なし |
| gradeColors定数の重複定義 (3箇所) | LOW | メンテナンス性の問題のみ |

## 品質評価

### SEO (5/5)
- メタデータ完備 (title, description, keywords, OGP, Twitter Cards)
- 構造化データ (Organization JSON-LD)
- サイトマップ 41ルート
- robots.txt, llms.txt, agent.json 実装済み

### Security (4/5)
- レート制限: check, feedback, badge API
- 入力バリデーション: URL長, プロトコル, プライベートIP
- レスポンスサイズ制限: 5MB
- CORS: パブリックAPI用に全オリジン許可（意図的）

### Accessibility (4/5)
- ARIA属性適切 (role, aria-live, aria-expanded, aria-pressed)
- フォーム要素にlabel/aria-label
- 見出し階層正しい
- キーボードナビゲーション基本対応

### Edge Cases (5/5)
- 空入力: trim()チェック
- 長文入力: maxLength=2048
- プロトコルなしURL: https://自動付与
- 特殊文字: encodeURIComponent処理
- ペイロードサイズ制限: API側でガード
