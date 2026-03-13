import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CHECK_INDICATORS, GENERATOR_TYPES } from "@/lib/check-indicators";
import { UrlCheckForm } from "@/components/url-check-form";
import { CtaBanner } from "@/components/cta-banner";

const BASE_URL = "https://ai-check.ezoai.jp";

type IndicatorContent = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  intro: string[];
  howWeCheck: string[];
  improvements: { text: string; code?: string }[];
  relatedLinks: { href: string; label: string }[];
};

const INDICATOR_CONTENT: Record<string, IndicatorContent> = {
  "robots-txt": {
    seoTitle: "robots.txt AIクローラー対応チェック - AI検索対策",
    seoDescription:
      "robots.txtがAIクローラー（GPTBot, ClaudeBot, PerplexityBot等）を正しく許可しているかチェック。AI検索エンジンにサイトを認識させるための第一歩を解説。",
    seoKeywords: ["robots.txt AI対応", "GPTBot 許可", "AIクローラー robots.txt", "AI検索 対策"],
    intro: [
      "robots.txtは、Webサイトのルートディレクトリに設置するテキストファイルで、検索エンジンのクローラーに対してアクセスの許可・拒否を指示するものです。従来はGooglebotやBingbotなどの検索エンジンクローラーを制御するために使われてきましたが、AI時代の今、GPTBot（OpenAI）、ClaudeBot（Anthropic）、PerplexityBot（Perplexity）といったAIクローラーへの対応が不可欠になっています。",
      "デフォルトのrobots.txtにはAIクローラーに関する記述が含まれていないことがあります。この場合、AIクローラーがサイトのコンテンツを学習データとして利用したり、AI検索結果にサイト情報を反映させることを事実上ブロックしている可能性があります。AI検索エンジンからのトラフィックを獲得したい場合、明示的にAIクローラーを許可する必要があります。",
      "GEO（Generative Engine Optimization）において、robots.txtの設定はスコア全体の15%を占める重要な指標です。AI検索エンジンがサイトのコンテンツにアクセスできなければ、他のGEO対策がどれだけ完璧でも意味がありません。robots.txtはAI検索対策の最も基本的な土台です。",
      "特に注意が必要なのは、ワイルドカードでの一括拒否（Disallow: /）を設定しているケースです。この場合、全てのクローラーがブロックされるため、AI検索エンジンにサイトが一切表示されなくなります。サイトのコンテンツを保護しつつAI検索からの流入を確保するには、クローラーごとに細かくアクセス制御を行うことが推奨されます。",
    ],
    howWeCheck: [
      "AI Checkでは、対象サイトの /robots.txt ファイルを取得し、以下の項目を自動チェックします。",
      "まず、robots.txtファイル自体が存在するかを確認します。ファイルが存在しない場合、クローラーは全てのページにアクセス可能と判断しますが、明示的な設定がないためスコアは中程度となります。",
      "次に、GPTBot、ClaudeBot、PerplexityBot、GoogleOther、Applebot-Extended などの主要AIクローラーに対するルールを解析します。Allow指定があればスコアが加算され、Disallow指定があればスコアが減点されます。",
      "さらに、llms.txtやsitemap.xmlへの参照が含まれているかもチェックし、AI対応の総合的な品質を評価します。",
    ],
    improvements: [
      {
        text: "AIクローラーを明示的に許可するrobots.txtの例です。サイトのルートに設置してください。",
        code: `# AI Crawlers - Allow
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: Applebot-Extended
Allow: /

# Traditional crawlers
User-agent: *
Allow: /

# Sitemap reference
Sitemap: https://example.com/sitemap.xml`,
      },
      {
        text: "特定のディレクトリだけをAIクローラーに公開したい場合は、以下のように設定します。管理画面やプライベートな領域はブロックしつつ、公開コンテンツへのアクセスを許可できます。",
        code: `User-agent: GPTBot
Allow: /blog/
Allow: /products/
Allow: /about/
Disallow: /admin/
Disallow: /api/
Disallow: /private/

User-agent: ClaudeBot
Allow: /blog/
Allow: /products/
Allow: /about/
Disallow: /admin/
Disallow: /api/
Disallow: /private/`,
      },
    ],
    relatedLinks: [
      { href: "/generate/robots-txt", label: "robots.txt ジェネレーター" },
      { href: "/guides/geo", label: "GEO対策ガイド" },
      { href: "/check/llms-txt", label: "llms.txt チェック" },
    ],
  },

  "llms-txt": {
    seoTitle: "llms.txt チェック - AI向けサイト説明ファイルの設置確認",
    seoDescription:
      "llms.txtの設置状況とフォーマットをチェック。llms.txtの作り方、書き方、設置方法を具体的なコード例とともに解説。AI検索最適化の必須ファイル。",
    seoKeywords: ["llms.txt 作り方", "llms.txt 書き方", "llms.txt チェック", "AI検索 対策"],
    intro: [
      "llms.txtは、AIエージェントやLLM（大規模言語モデル）に対してWebサイトの概要、構造、提供するサービスを簡潔に伝えるためのテキストファイルです。サイトのルートディレクトリ（例: https://example.com/llms.txt）に設置します。robots.txtがクローラーの「アクセス制御」を行うのに対し、llms.txtはAIに対して「サイトの自己紹介」を行う役割を持ちます。",
      "AI検索エンジンは、ユーザーの質問に対して最も適切な情報源を選択する必要があります。llms.txtが設置されているサイトは、AIが「このサイトは何を提供しているか」を即座に理解できるため、関連する質問に対して引用される可能性が高まります。これはGEO対策において非常に重要な要素です。",
      "llms.txtのフォーマットは、Markdown形式を基本としています。サイト名、概要説明、主要なページへのリンクとその説明を記述します。人間が読んでも理解でき、かつAIが構造的に解析できるフォーマットであることが特徴です。",
      "GEOスコアにおいて、llms.txtの指標はスコア全体の15%を占めます。ファイルの存在確認だけでなく、内容の充実度、フォーマットの正しさ、リンクの有効性なども評価の対象です。",
    ],
    howWeCheck: [
      "AI Checkでは、対象サイトの /llms.txt を取得し、複数の観点から品質を評価します。",
      "最初にファイルの存在とHTTPステータスコードを確認します。200以外のレスポンスが返る場合、ファイルが正しく設置されていないと判定します。",
      "ファイルが存在する場合、Markdown形式のフォーマットに沿っているか、サイト名と概要が記述されているか、リンクが含まれているかを解析します。",
      "さらに、llms-full.txt（詳細版）の存在も確認し、AIエージェントがより深い情報にアクセスできる環境が整っているかを評価します。",
    ],
    improvements: [
      {
        text: "基本的なllms.txtのフォーマットです。サイト名をH1として記載し、概要、主要ページのリンクを記述します。",
        code: `# サイト名

> サイトの概要を1-2文で記述します。

## 主要ページ

- [ページ名](https://example.com/page): ページの説明
- [ブログ](https://example.com/blog): 技術ブログ記事一覧
- [サービス](https://example.com/services): 提供サービスの詳細

## Optional

- [llms-full.txt](https://example.com/llms-full.txt): 詳細な情報`,
      },
      {
        text: "Next.jsでllms.txtを実装する場合、publicディレクトリに静的ファイルを置くか、Route Handlerで動的に生成できます。動的生成の例を示します。",
        code: `// app/llms.txt/route.ts
export async function GET() {
  const content = \`# My Website

> Webサービスの概要説明をここに記述。

## 主要ページ

- [トップページ](https://example.com): サービスの概要
- [料金](https://example.com/pricing): 料金プラン
- [ドキュメント](https://example.com/docs): 技術ドキュメント

## Optional

- [llms-full.txt](https://example.com/llms-full.txt): 詳細情報
\`;

  return new Response(content, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}`,
      },
    ],
    relatedLinks: [
      { href: "/generate/llms-txt", label: "llms.txt ジェネレーター" },
      { href: "/guides/geo", label: "GEO対策ガイド" },
      { href: "/check/robots-txt", label: "robots.txt チェック" },
    ],
  },

  "structured-data": {
    seoTitle: "構造化データ（JSON-LD）チェック - Schema.org対応度を診断",
    seoDescription:
      "JSON-LD構造化データの設置状況と品質をチェック。Schema.org準拠の構造化データの書き方と、AI検索エンジンが正しくコンテンツを理解するための実装方法を解説。",
    seoKeywords: ["構造化データ チェック", "JSON-LD 書き方", "Schema.org 対応", "AI検索 構造化データ"],
    intro: [
      "構造化データ（Structured Data）とは、Webページのコンテンツの意味をコンピュータが理解できる形式で記述するためのマークアップです。Schema.orgが定義するボキャブラリに従い、JSON-LD（JavaScript Object Notation for Linked Data）形式で記述するのが現在の標準的な方法です。",
      "AI検索エンジンは、構造化データを活用してコンテンツの種類（記事、商品、FAQ、レシピなど）や属性（著者、公開日、価格など）を正確に把握します。構造化データが適切に設置されたサイトは、AIが回答を生成する際に「信頼できる情報源」として優先的に引用される傾向があります。",
      "GEOスコアにおいて、構造化データはスコア全体の20%を占める最も重要な指標です。これは、構造化データがAIのコンテンツ理解に直接的な影響を与えるためです。titleやdescriptionなどのメタ情報が「人間向けのラベル」であるのに対し、構造化データは「機械向けの意味定義」であり、AIにとってより信頼性の高い情報源となります。",
      "特にFAQPage、HowTo、Article、Product、BreadcrumbListなどのスキーマタイプは、AI検索エンジンが回答を構成する際に頻繁に参照するタイプです。これらを適切に実装することで、AI検索結果での露出を大幅に向上させることができます。",
    ],
    howWeCheck: [
      "AI Checkでは、対象ページのHTMLを解析し、全ての <script type=\"application/ld+json\"> タグからJSON-LDデータを抽出します。",
      "抽出したJSON-LDの @type フィールドを確認し、Organization、WebSite、WebPage、Article、BreadcrumbList などの主要なスキーマタイプが含まれているかを評価します。",
      "各スキーマタイプについて、必須プロパティ（name、url、description等）が適切に記述されているかを検証します。",
      "さらに、構造化データの数と種類の多様性も評価に含まれます。1つだけでなく複数のスキーマタイプを設置することで、AIによるコンテンツ理解がより深まります。",
    ],
    improvements: [
      {
        text: "WebSiteとOrganizationの基本的なJSON-LD構造化データの例です。全ページの共通レイアウトに設置してください。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "サイト名",
  "url": "https://example.com",
  "description": "サイトの説明",
  "publisher": {
    "@type": "Organization",
    "name": "運営者名",
    "url": "https://example.com"
  }
}
</script>`,
      },
      {
        text: "記事ページにはArticleスキーマを追加します。著者情報、公開日、更新日を含めることで、AI検索エンジンがコンテンツの信頼性と鮮度を判断できるようになります。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "記事のタイトル",
  "datePublished": "2026-03-07",
  "dateModified": "2026-03-14",
  "author": {
    "@type": "Person",
    "name": "著者名"
  },
  "publisher": {
    "@type": "Organization",
    "name": "メディア名"
  },
  "description": "記事の概要"
}
</script>`,
      },
      {
        text: "FAQページにはFAQPageスキーマを設置しましょう。AI検索エンジンがQ&A形式の情報を回答に直接引用できるようになります。",
        code: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "GEOとは何ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GEO（Generative Engine Optimization）は..."
      }
    }
  ]
}
</script>`,
      },
    ],
    relatedLinks: [
      { href: "/generate/json-ld", label: "JSON-LD ジェネレーター" },
      { href: "/guides/geo", label: "GEO対策ガイド" },
      { href: "/check/meta-tags", label: "メタタグチェック" },
    ],
  },

  "meta-tags": {
    seoTitle: "メタタグ & 鮮度チェック - AI検索向けメタ情報の最適化",
    seoDescription:
      "title、meta description、OGPタグの設定状況をチェック。AI検索エンジンがコンテンツを正しく理解するためのメタタグの書き方と最適化方法を解説。",
    seoKeywords: ["メタタグ SEO", "OGP 設定", "meta description 書き方", "AI検索 メタタグ"],
    intro: [
      "メタタグは、Webページの内容を検索エンジンやSNS、AIエージェントに伝えるためのHTMLタグです。title、meta description、OGP（Open Graph Protocol）タグなどが含まれます。AI検索エンジンはこれらのメタ情報を参照して、ページの概要や目的を素早く把握します。",
      "AI検索においてメタタグが重要な理由は、AIがページの内容を「要約」する際の最初の手がかりとなるためです。適切なtitleとdescriptionが設定されたページは、AIが「このページは何について書かれているか」を正確に判断でき、関連する質問に対して引用される確率が高まります。",
      "コンテンツの鮮度もAI検索では重要な要素です。datePublishedやdateModifiedのメタ情報が設定されているページは、AIが情報の新しさを判断できます。古い情報よりも最新の情報を優先して引用するAI検索エンジンにとって、鮮度のシグナルは回答品質を左右する重要な要因です。",
      "GEOスコアでは、メタタグ指標がスコア全体の15%を占めています。titleの長さ、descriptionの充実度、OGPタグの完全性、コンテンツの鮮度シグナルなど、複数の観点から総合的に評価を行います。",
    ],
    howWeCheck: [
      "AI Checkでは、対象ページのHTMLからメタタグを抽出し、以下の項目をチェックします。",
      "titleタグの存在と長さ（30-60文字が推奨）、meta descriptionの存在と長さ（70-160文字が推奨）を確認します。空のタグや極端に短い・長いタグは減点対象です。",
      "OGPタグ（og:title, og:description, og:image, og:url, og:type）の設定状況を確認します。SNSでのシェア時だけでなく、AIエージェントもOGPを参照してページの概要を理解します。",
      "コンテンツの鮮度指標として、meta datePublished、dateModified、article:published_time などの日時関連メタ情報が含まれているかを確認します。",
    ],
    improvements: [
      {
        text: "Next.jsのMetadata APIを使用して、適切なメタタグを設定する例です。各ページごとに固有のタイトルとdescriptionを設定してください。",
        code: `// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      url: \`https://example.com/blog/\${params.slug}\`,
      images: [{ url: post.ogImage, width: 1200, height: 630 }],
    },
    alternates: {
      canonical: \`https://example.com/blog/\${params.slug}\`,
    },
  };
}`,
      },
      {
        text: "静的HTMLサイトの場合、headタグ内に以下のメタタグを記述します。",
        code: `<head>
  <title>ページのタイトル | サイト名</title>
  <meta name="description"
    content="ページの概要を70-160文字で記述します。" />
  <meta property="og:title" content="ページのタイトル" />
  <meta property="og:description" content="OGP用の説明文" />
  <meta property="og:type" content="article" />
  <meta property="og:url"
    content="https://example.com/page" />
  <meta property="og:image"
    content="https://example.com/og-image.jpg" />
  <meta property="article:published_time"
    content="2026-01-15T00:00:00Z" />
  <meta property="article:modified_time"
    content="2026-03-01T00:00:00Z" />
  <link rel="canonical" href="https://example.com/page" />
</head>`,
      },
    ],
    relatedLinks: [
      { href: "/guides/geo", label: "GEO対策ガイド" },
      { href: "/check/structured-data", label: "構造化データチェック" },
      { href: "/check/content-structure", label: "コンテンツ構造チェック" },
    ],
  },

  "content-structure": {
    seoTitle: "コンテンツ構造チェック - セマンティックHTML診断",
    seoDescription:
      "セマンティックHTML（h1-h6, article, section, main等）の使用状況をチェック。AIが正しくコンテンツを理解するためのHTML構造の最適化方法を解説。",
    seoKeywords: ["セマンティックHTML チェック", "見出し構造 最適化", "コンテンツ構造 SEO", "AI検索 HTML"],
    intro: [
      "コンテンツ構造とは、HTMLの見出しタグ（h1-h6）やセマンティック要素（article、section、nav、main、aside等）を使って、ページの内容を論理的に構造化することを指します。AI検索エンジンは、これらのHTMLタグを手がかりにして、ページ内の情報の階層関係や重要度を理解します。",
      "見出しタグの適切な使用は、AIのコンテンツ理解に直結します。h1はページの主題、h2は主要セクション、h3はサブセクションというように、階層的に情報を整理することで、AIがページの構造を「ツリー構造」として把握できるようになります。見出しが適切に設定されたページは、AIが特定のトピックに関する情報を正確に抽出しやすくなります。",
      "セマンティックHTML要素の使用も重要です。article要素で独立したコンテンツブロックを示し、section要素で関連するコンテンツをグループ化し、nav要素でナビゲーションを明示します。これにより、AIは「どこがメインコンテンツで、どこが補足情報か」を正確に判断できます。",
      "GEOスコアでは、コンテンツ構造がスコア全体の15%を占めます。h1の存在と一意性、見出し階層の正しさ、セマンティック要素の使用率など、複数の基準で評価を行います。",
    ],
    howWeCheck: [
      "AI Checkでは、対象ページのHTMLを解析し、見出しタグとセマンティック要素の使用状況を詳細にチェックします。",
      "h1タグがページ内に1つだけ存在するか、h2-h6の階層構造が正しい順序で使われているか（h1の次にh3が来るなどのスキップがないか）を確認します。",
      "article、section、main、nav、header、footer などのHTML5セマンティック要素が適切に使用されているかを確認します。div要素だけで構成されたページは減点対象です。",
      "テキストコンテンツの量も評価します。AIが引用するのに十分な情報量があるか、見出しに対して本文が適切な長さであるかを判定します。",
    ],
    improvements: [
      {
        text: "適切なセマンティックHTML構造の例です。div要素の代わりにセマンティック要素を使用してください。",
        code: `<body>
  <header>
    <nav aria-label="メインナビゲーション">
      <a href="/">ホーム</a>
      <a href="/services">サービス</a>
      <a href="/blog">ブログ</a>
    </nav>
  </header>

  <main>
    <article>
      <h1>記事のメインタイトル</h1>
      <p>導入テキスト...</p>

      <section>
        <h2>最初のセクション</h2>
        <p>セクションの内容...</p>

        <h3>サブセクション</h3>
        <p>詳細な内容...</p>
      </section>

      <section>
        <h2>次のセクション</h2>
        <p>セクションの内容...</p>
      </section>
    </article>
  </main>

  <footer>
    <p>Copyright...</p>
  </footer>
</body>`,
      },
      {
        text: "Next.jsのApp Routerで適切なセマンティック構造を持つレイアウトを作成する例です。",
        code: `// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header>
          <nav aria-label="メインナビゲーション">
            {/* ナビゲーションリンク */}
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          {/* フッター情報 */}
        </footer>
      </body>
    </html>
  );
}`,
      },
    ],
    relatedLinks: [
      { href: "/guides/geo", label: "GEO対策ガイド" },
      { href: "/check/meta-tags", label: "メタタグチェック" },
      { href: "/check/ssr", label: "SSRチェック" },
    ],
  },

  ssr: {
    seoTitle: "サーバーサイドレンダリング（SSR）チェック - AI検索対応度診断",
    seoDescription:
      "Webサイトのサーバーサイドレンダリング対応状況をチェック。AIクローラーがコンテンツを読み取れるか診断し、SSR/SSGの実装方法を解説。",
    seoKeywords: ["SSR チェック", "サーバーサイドレンダリング SEO", "AI クローラー レンダリング", "CSR SSR 違い"],
    intro: [
      "サーバーサイドレンダリング（SSR）とは、Webページの HTMLをサーバー側で生成してクライアントに送信する方式です。対照的に、クライアントサイドレンダリング（CSR）ではJavaScriptがブラウザ上で実行されてからコンテンツが生成されます。AI検索エンジンのクローラーは、JavaScriptの実行が限定的なため、CSRのみのサイトではコンテンツを正しく取得できない場合があります。",
      "GooglebotはJavaScriptレンダリングに対応していますが、GPTBot、ClaudeBot、PerplexityBotなどのAIクローラーは、HTMLに直接含まれるコンテンツを優先的に取得します。そのため、重要なコンテンツがJavaScriptによる動的レンダリングに依存している場合、AIクローラーがそのコンテンツを認識できず、AI検索結果に反映されない可能性があります。",
      "SSG（Static Site Generation）もSSRと同様に有効な手段です。ビルド時にHTMLを生成するため、リクエスト時にはすでに完成したHTMLが提供されます。Next.jsのApp Routerでは、デフォルトでサーバーコンポーネントが使用されるため、自然とSSR/SSGに対応した構成になります。",
      "GEOスコアでは、SSR指標がスコア全体の10%を占めます。初期HTMLに十分なテキストコンテンツが含まれているか、JavaScriptなしでもメインコンテンツが読み取れるかを判定します。",
    ],
    howWeCheck: [
      "AI Checkでは、JavaScriptを実行せずにHTMLを取得し（AIクローラーと同じ挙動）、コンテンツの存在を確認します。",
      "初期HTMLのbodyタグ内のテキスト量を測定します。テキストが極端に少ない場合（例: 100文字未満）、CSRに依存している可能性が高いと判定します。",
      "noscriptタグの存在、主要なコンテンツ要素（h1、article、main等）が初期HTMLに含まれているかを確認します。",
      "さらに、レスポンスヘッダーのX-Powered-By等からフレームワークを推定し、SSR対応フレームワーク（Next.js、Nuxt.js等）を使用しているかも参考情報として記録します。",
    ],
    improvements: [
      {
        text: "Next.js App Routerでは、デフォルトでサーバーコンポーネントが使用されます。\"use client\"を使う場合は、データフェッチとレンダリングをサーバーコンポーネントで行い、インタラクション部分のみをクライアントコンポーネントにしてください。",
        code: `// app/blog/[slug]/page.tsx (Server Component)
// データフェッチとメインレンダリングはサーバーで実行
export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      {/* インタラクティブな部分だけClient Component */}
      <ShareButtons url={post.url} />
    </article>
  );
}`,
      },
      {
        text: "React SPAをSSR対応にする場合、Next.jsへの移行が最も効率的です。既存のReactコンポーネントをそのまま活用できます。移行が難しい場合は、重要なコンテンツだけでもSSR化する方法もあります。",
        code: `// CSRのみの場合の代替策: prerender.io等の
// プリレンダリングサービスを利用する

// Nginx設定例
// AIクローラーにはプリレンダリング済みHTMLを返す
location / {
  if ($http_user_agent ~* "GPTBot|ClaudeBot|PerplexityBot") {
    proxy_pass https://service.prerender.io;
  }
  try_files $uri $uri/ /index.html;
}`,
      },
    ],
    relatedLinks: [
      { href: "/guides/geo", label: "GEO対策ガイド" },
      { href: "/check/content-structure", label: "コンテンツ構造チェック" },
      { href: "/check/sitemap", label: "サイトマップチェック" },
    ],
  },

  sitemap: {
    seoTitle: "サイトマップ品質チェック - sitemap.xml の最適化診断",
    seoDescription:
      "sitemap.xmlの設置状況、フォーマット、URL数、lastmod情報をチェック。AI検索エンジンにサイト構造を正しく伝えるためのサイトマップの作り方を解説。",
    seoKeywords: ["sitemap.xml チェック", "サイトマップ 作り方", "サイトマップ SEO", "AI検索 サイトマップ"],
    intro: [
      "サイトマップ（sitemap.xml）は、Webサイトの全ページのURLリストをXML形式で記述したファイルです。検索エンジンやAIクローラーに対して、サイト内のどのページが存在し、いつ更新されたかを伝える役割を持ちます。サイトのルートディレクトリ（例: https://example.com/sitemap.xml）に設置します。",
      "AI検索エンジンにとって、サイトマップは「サイト全体の地図」として機能します。サイトマップが適切に設置されたサイトは、AIクローラーが効率的にページを発見・巡回できるため、より多くのコンテンツがAI検索のインデックスに含まれる可能性が高まります。",
      "サイトマップのlastmod（最終更新日）情報は、AI検索エンジンがコンテンツの鮮度を判断するための重要なシグナルです。定期的に更新されるサイトは、AIが「信頼性の高い最新情報」として優先的に引用する傾向があります。lastmodを正確に設定することは、GEO対策において見落とされがちですが重要なポイントです。",
      "GEOスコアでは、サイトマップ指標がスコア全体の10%を占めます。ファイルの存在、XMLフォーマットの正しさ、URL数、lastmod情報の有無などを総合的に評価します。",
    ],
    howWeCheck: [
      "AI Checkでは、対象サイトの /sitemap.xml を取得し、複数の観点から品質を評価します。",
      "まずファイルの存在とHTTPステータスコードを確認します。次に、XMLとして正しくパースできるか、sitemap仕様に準拠しているかを検証します。",
      "登録されているURL数を数え、各URLにlastmod（最終更新日）が設定されているかを確認します。lastmodが設定されていないURLが多い場合は減点対象です。",
      "さらに、robots.txtにsitemap.xmlの場所が記載されているかも確認し、クローラーがサイトマップを発見できる状態にあるかを評価します。",
    ],
    improvements: [
      {
        text: "基本的なsitemap.xmlのフォーマットです。全ての公開ページを含め、lastmodを正確に設定してください。",
        code: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-03-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2026-02-15</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://example.com/blog/post-1</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`,
      },
      {
        text: "Next.js App Routerでサイトマップを動的に生成する方法です。新しいページを追加しても自動的にサイトマップに反映されます。",
        code: `// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  const staticPages = [
    { url: "https://example.com", lastModified: new Date() },
    { url: "https://example.com/about", lastModified: new Date() },
  ];

  // 動的ページ（DBから取得）
  const posts = await getAllPosts();
  const blogPages = posts.map((post) => ({
    url: \`https://example.com/blog/\${post.slug}\`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages];
}`,
      },
    ],
    relatedLinks: [
      { href: "/guides/geo", label: "GEO対策ガイド" },
      { href: "/check/robots-txt", label: "robots.txt チェック" },
      { href: "/check/llms-txt", label: "llms.txt チェック" },
    ],
  },
};

const VALID_SLUGS = CHECK_INDICATORS.map((i) => i.id);

export function generateStaticParams() {
  return VALID_SLUGS.map((indicator) => ({ indicator }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ indicator: string }>;
}): Promise<Metadata> {
  const { indicator } = await params;
  const content = INDICATOR_CONTENT[indicator];
  if (!content) return {};

  return {
    title: content.seoTitle,
    description: content.seoDescription,
    keywords: content.seoKeywords,
    alternates: { canonical: `${BASE_URL}/check/${indicator}` },
    openGraph: {
      title: content.seoTitle,
      description: content.seoDescription,
      url: `${BASE_URL}/check/${indicator}`,
      type: "article",
      images: [
        {
          url: `${BASE_URL}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: content.seoTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.seoTitle,
      description: content.seoDescription,
      images: [`${BASE_URL}/opengraph-image`],
    },
  };
}

export default async function IndicatorPage({
  params,
}: {
  params: Promise<{ indicator: string }>;
}) {
  const { indicator } = await params;

  if (!VALID_SLUGS.includes(indicator)) {
    notFound();
  }

  const content = INDICATOR_CONTENT[indicator];
  const indicatorData = CHECK_INDICATORS.find((i) => i.id === indicator)!;

  const generatorLink = GENERATOR_TYPES.find(
    (g) => g.id === indicator || (indicator === "structured-data" && g.id === "json-ld")
  );

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "AI Check",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "GEOスコアチェック",
        item: `${BASE_URL}/check`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: indicatorData.name,
        item: `${BASE_URL}/check/${indicator}`,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: content.seoTitle,
    description: content.seoDescription,
    url: `${BASE_URL}/check/${indicator}`,
    datePublished: "2026-03-07",
    dateModified: "2026-03-14",
    author: {
      "@type": "Organization",
      name: "AI Check",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "AI Check",
      url: BASE_URL,
    },
  };

  // Other indicators for related navigation
  const otherIndicators = CHECK_INDICATORS.filter((i) => i.id !== indicator);

  return (
    <div className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Breadcrumb navigation */}
      <nav aria-label="パンくずリスト" className="mb-8 text-sm text-white/40">
        <Link href="/" className="transition-all duration-200 hover:text-white/70">
          AI Check
        </Link>
        <span className="mx-2">/</span>
        <Link href="/check" className="transition-all duration-200 hover:text-white/70">
          GEOスコアチェック
        </Link>
        <span className="mx-2">/</span>
        <span className="text-white/60">{indicatorData.name}</span>
      </nav>

      {/* H1 */}
      <h1 className="mb-2 text-3xl font-bold text-white sm:text-4xl">
        {indicatorData.name}
      </h1>
      <p className="mb-4 text-lg text-white/40">
        {indicatorData.nameEn}
      </p>
      <p className="mb-12 text-base leading-relaxed text-white/60">
        {indicatorData.description} -- GEOスコア配分: {indicatorData.weight}%
      </p>

      {/* Introduction / SEO content */}
      <section className="mb-16">
        {content.intro.map((paragraph, i) => (
          <p
            key={i}
            className="mb-6 text-base leading-[1.75] text-white/70"
          >
            {paragraph}
          </p>
        ))}
      </section>

      {/* How we check */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-white">
          チェック方法
        </h2>
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 sm:p-8">
          {content.howWeCheck.map((paragraph, i) => (
            <p
              key={i}
              className="mb-4 text-base leading-[1.75] text-white/70 last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Improvements */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-white">
          改善方法
        </h2>
        <div className="space-y-8">
          {content.improvements.map((improvement, i) => (
            <div key={i}>
              <p className="mb-4 text-base leading-[1.75] text-white/70">
                {improvement.text}
              </p>
              {improvement.code && (
                <pre className="overflow-x-auto rounded-lg bg-white/5 p-4 text-sm leading-relaxed text-white/80">
                  <code>{improvement.code}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA: Check your site */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-white">
          あなたのサイトをチェック
        </h2>
        <div className="rounded-lg border border-white/10 bg-white/5 p-6 sm:p-8">
          <p className="mb-6 text-base text-white/60">
            URLを入力して、{indicatorData.name}の対応状況を無料でチェックできます。
          </p>
          <UrlCheckForm size="lg" />
        </div>
      </section>

      {/* Related links */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-white">
          関連ページ
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {generatorLink && (
            <Link
              href={generatorLink.path}
              className="cursor-pointer rounded-lg border border-primary/20 bg-white/5 p-5 transition-all duration-200 hover:border-primary/40 hover:bg-white/10"
            >
              <p className="font-semibold text-primary">{generatorLink.name} ジェネレーター</p>
              <p className="mt-1 text-sm text-white/50">{generatorLink.description}</p>
            </Link>
          )}
          {content.relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
            >
              <p className="font-semibold text-white">{link.label}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Other indicators */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold text-white">
          その他のチェック指標
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {otherIndicators.map((ind) => (
            <Link
              key={ind.id}
              href={`/check/${ind.id}`}
              className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
            >
              <p className="font-semibold text-white">{ind.name}</p>
              <p className="mt-1 text-sm text-white/40">{ind.description}</p>
              <p className="mt-2 text-xs text-white/30">配分: {ind.weight}%</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <CtaBanner
        title="7つの指標で総合的にGEOスコアをチェック"
        description="robots.txt、llms.txt、構造化データ、メタタグ、コンテンツ構造、SSR、サイトマップの全指標を一括診断します。"
      />
    </div>
  );
}
