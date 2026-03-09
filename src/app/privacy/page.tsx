import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "AI Checkのプライバシーポリシー。個人情報の取り扱い、Cookie、Google Analyticsの利用について。",
  alternates: { canonical: "https://ai-check.ezoai.jp/privacy" },
  openGraph: {
    title: "プライバシーポリシー",
    description: "AI Checkのプライバシーポリシー。個人情報の取り扱い、Cookie、Google Analyticsの利用について。",
    url: "https://ai-check.ezoai.jp/privacy",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AI Check", item: "https://ai-check.ezoai.jp" },
    { "@type": "ListItem", position: 2, name: "プライバシーポリシー", item: "https://ai-check.ezoai.jp/privacy" },
  ],
};

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <h1 className="mb-4 text-3xl font-bold text-white">プライバシーポリシー</h1>
      <p className="mb-12 text-sm text-white/40">最終更新日: 2026年3月9日</p>

      <div className="space-y-10 text-sm leading-relaxed text-white/60">
        <section>
          <h2 className="mb-3 text-xl font-bold text-white">1. 運営者情報</h2>
          <p>
            AI Check（以下「本サービス」）は、ezoai.jp が運営するWebサービスです。
            本サービスのURL: <span className="text-white/80">https://ai-check.ezoai.jp</span>
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">2. 収集する情報</h2>
          <p className="mb-3">本サービスでは、以下の情報を収集する場合があります。</p>
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="mb-2 font-semibold text-white">チェック機能で入力されたURL</h3>
              <p>
                GEOスコアチェックで入力されたURLは、チェック処理のためにサーバーに送信されます。
                チェック結果はサーバーに永続的に保存されません。
                チェック履歴はお使いのブラウザのlocalStorageにのみ保存され、サーバーには送信されません。
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="mb-2 font-semibold text-white">フィードバック</h3>
              <p>
                フィードバック機能をご利用いただいた場合、送信いただいたメッセージと
                ページURLを収集します。これらはサービス改善の目的でのみ使用されます。
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h3 className="mb-2 font-semibold text-white">アクセス情報</h3>
              <p>
                レート制限の目的で、APIリクエスト時のIPアドレスを一時的にメモリ上で保持します。
                これは一定時間後に自動的に削除され、永続的に保存されることはありません。
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">3. Google Analyticsの利用</h2>
          <p className="mb-3">
            本サービスでは、アクセス状況の分析のためにGoogle Analytics（Google LLC提供）を使用しています。
            Google Analyticsは、Cookieを使用してお客様のサイト利用状況に関する情報を収集します。
          </p>
          <ul className="list-inside list-disc space-y-1 text-white/50">
            <li>収集されるデータ: ページビュー、セッション情報、デバイス情報、おおよその地域</li>
            <li>データはGoogleのサーバーに送信され、Googleのプライバシーポリシーに従い管理されます</li>
            <li>個人を特定できる情報は収集しません</li>
          </ul>
          <p className="mt-3">
            Google Analyticsによるデータ収集を無効にしたい場合は、ブラウザの設定でCookieを無効にするか、
            Googleが提供する
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary/70 transition-all duration-200 hover:text-primary"
            >
              オプトアウトアドオン
            </a>
            をご利用ください。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">4. Cookieの使用</h2>
          <p>
            本サービスでは、Google Analyticsが使用するCookie以外に、独自のCookieは使用していません。
            チェック履歴やチェックリストの進捗状況は、ブラウザのlocalStorageに保存されます。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">5. 第三者への情報提供</h2>
          <p>
            収集した情報は、法令に基づく場合を除き、第三者に提供することはありません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">6. データの保護</h2>
          <p>
            本サービスはHTTPS通信を使用し、データの送受信を暗号化しています。
            サーバーに永続的に保存される個人データはありません。
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-bold text-white">7. お問い合わせ</h2>
          <p>
            プライバシーに関するお問い合わせは、サイト内のフィードバック機能をご利用ください。
          </p>
        </section>
      </div>

      <div className="mt-12 rounded-lg border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-white/40">
          <Link href="/" className="cursor-pointer text-primary/70 transition-all duration-200 hover:text-primary">
            AI Checkトップページに戻る
          </Link>
        </p>
      </div>
    </div>
  );
}
