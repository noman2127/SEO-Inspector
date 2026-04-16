import { Router, type IRouter } from "express";
import { parse } from "node-html-parser";
import { AnalyzeSeoBody, AnalyzeSeoResponse } from "@workspace/api-zod";

const router: IRouter = Router();

interface SeoTag {
  name: string;
  label: string;
  value: string | null;
  status: "pass" | "warn" | "fail" | "info";
  feedback: string;
  category: "general" | "open-graph" | "twitter" | "technical" | "structured-data";
}

function scoreTag(tag: SeoTag): number {
  if (tag.status === "pass") return 1;
  if (tag.status === "warn") return 0.5;
  if (tag.status === "info") return 0.75;
  return 0;
}

function computeCategoryScore(tags: SeoTag[], category: SeoTag["category"]): number {
  const filtered = tags.filter((t) => t.category === category);
  if (filtered.length === 0) return 100;
  const total = filtered.reduce((acc, t) => acc + scoreTag(t), 0);
  return Math.round((total / filtered.length) * 100);
}

function evaluateTags(html: string, url: string): SeoTag[] {
  const root = parse(html);
  const tags: SeoTag[] = [];

  const getMetaContent = (name: string): string | null => {
    const el = root.querySelector(`meta[name="${name}"]`);
    return el?.getAttribute("content") ?? null;
  };

  const getMetaProperty = (property: string): string | null => {
    const el = root.querySelector(`meta[property="${property}"]`);
    return el?.getAttribute("content") ?? null;
  };

  // ---- GENERAL ----

  // Title
  const titleEl = root.querySelector("title");
  const titleText = titleEl?.text?.trim() ?? null;
  if (!titleText) {
    tags.push({
      name: "title",
      label: "Title Tag",
      value: null,
      status: "fail",
      feedback: "Missing <title> tag. Every page must have a unique title.",
      category: "general",
    });
  } else if (titleText.length < 30) {
    tags.push({
      name: "title",
      label: "Title Tag",
      value: titleText,
      status: "warn",
      feedback: `Title is too short (${titleText.length} chars). Aim for 50–60 characters to maximize SERP visibility.`,
      category: "general",
    });
  } else if (titleText.length > 60) {
    tags.push({
      name: "title",
      label: "Title Tag",
      value: titleText,
      status: "warn",
      feedback: `Title is too long (${titleText.length} chars). Google typically truncates at ~60 characters.`,
      category: "general",
    });
  } else {
    tags.push({
      name: "title",
      label: "Title Tag",
      value: titleText,
      status: "pass",
      feedback: `Title is a good length (${titleText.length} chars).`,
      category: "general",
    });
  }

  // Meta description
  const metaDesc = getMetaContent("description");
  if (!metaDesc) {
    tags.push({
      name: "meta-description",
      label: "Meta Description",
      value: null,
      status: "fail",
      feedback: "Missing meta description. Add one to improve click-through rates from search results.",
      category: "general",
    });
  } else if (metaDesc.length < 70) {
    tags.push({
      name: "meta-description",
      label: "Meta Description",
      value: metaDesc,
      status: "warn",
      feedback: `Description is short (${metaDesc.length} chars). Aim for 120–160 characters for best results.`,
      category: "general",
    });
  } else if (metaDesc.length > 160) {
    tags.push({
      name: "meta-description",
      label: "Meta Description",
      value: metaDesc,
      status: "warn",
      feedback: `Description is too long (${metaDesc.length} chars). Google truncates at ~160 characters.`,
      category: "general",
    });
  } else {
    tags.push({
      name: "meta-description",
      label: "Meta Description",
      value: metaDesc,
      status: "pass",
      feedback: `Description is a good length (${metaDesc.length} chars).`,
      category: "general",
    });
  }

  // H1
  const h1s = root.querySelectorAll("h1");
  if (h1s.length === 0) {
    tags.push({
      name: "h1",
      label: "H1 Heading",
      value: null,
      status: "fail",
      feedback: "No H1 heading found. Every page should have one primary heading.",
      category: "general",
    });
  } else if (h1s.length > 1) {
    tags.push({
      name: "h1",
      label: "H1 Heading",
      value: h1s[0].text?.trim() ?? null,
      status: "warn",
      feedback: `${h1s.length} H1 headings found. Best practice is to have exactly one H1 per page.`,
      category: "general",
    });
  } else {
    tags.push({
      name: "h1",
      label: "H1 Heading",
      value: h1s[0].text?.trim() ?? null,
      status: "pass",
      feedback: "Exactly one H1 found.",
      category: "general",
    });
  }

  // Canonical
  const canonicalEl = root.querySelector('link[rel="canonical"]');
  const canonicalHref = canonicalEl?.getAttribute("href") ?? null;
  if (!canonicalHref) {
    tags.push({
      name: "canonical",
      label: "Canonical URL",
      value: null,
      status: "warn",
      feedback: "No canonical URL specified. Add <link rel='canonical'> to prevent duplicate content issues.",
      category: "general",
    });
  } else {
    tags.push({
      name: "canonical",
      label: "Canonical URL",
      value: canonicalHref,
      status: "pass",
      feedback: "Canonical URL is set.",
      category: "general",
    });
  }

  // ---- TECHNICAL ----

  // Viewport
  const viewport = getMetaContent("viewport");
  if (!viewport) {
    tags.push({
      name: "viewport",
      label: "Viewport Meta",
      value: null,
      status: "fail",
      feedback: "Missing viewport meta tag. Required for mobile-friendly pages.",
      category: "technical",
    });
  } else if (!viewport.includes("width=device-width")) {
    tags.push({
      name: "viewport",
      label: "Viewport Meta",
      value: viewport,
      status: "warn",
      feedback: "Viewport tag present but should include 'width=device-width' for proper mobile scaling.",
      category: "technical",
    });
  } else {
    tags.push({
      name: "viewport",
      label: "Viewport Meta",
      value: viewport,
      status: "pass",
      feedback: "Viewport meta tag is correctly configured.",
      category: "technical",
    });
  }

  // Robots
  const robots = getMetaContent("robots");
  if (!robots) {
    tags.push({
      name: "robots",
      label: "Robots Meta",
      value: null,
      status: "info",
      feedback: "No robots meta tag found. Default behavior is 'index, follow', which is fine.",
      category: "technical",
    });
  } else if (robots.includes("noindex")) {
    tags.push({
      name: "robots",
      label: "Robots Meta",
      value: robots,
      status: "warn",
      feedback: "This page is set to 'noindex'. Search engines will not index it.",
      category: "technical",
    });
  } else {
    tags.push({
      name: "robots",
      label: "Robots Meta",
      value: robots,
      status: "pass",
      feedback: "Robots meta tag is present and allows indexing.",
      category: "technical",
    });
  }

  // Lang attribute
  const htmlEl = root.querySelector("html");
  const langAttr = htmlEl?.getAttribute("lang") ?? null;
  if (!langAttr) {
    tags.push({
      name: "lang",
      label: "Language Attribute",
      value: null,
      status: "warn",
      feedback: "Missing lang attribute on <html>. Add lang='en' (or appropriate language) for accessibility and SEO.",
      category: "technical",
    });
  } else {
    tags.push({
      name: "lang",
      label: "Language Attribute",
      value: langAttr,
      status: "pass",
      feedback: `Language is set to '${langAttr}'.`,
      category: "technical",
    });
  }

  // Charset
  const charsetEl = root.querySelector("meta[charset]");
  const charset = charsetEl?.getAttribute("charset") ?? null;
  if (!charset) {
    tags.push({
      name: "charset",
      label: "Character Set",
      value: null,
      status: "warn",
      feedback: "No charset declaration found. Add <meta charset='utf-8'>.",
      category: "technical",
    });
  } else {
    tags.push({
      name: "charset",
      label: "Character Set",
      value: charset,
      status: "pass",
      feedback: `Character set declared as '${charset}'.`,
      category: "technical",
    });
  }

  // ---- OPEN GRAPH ----

  const ogTitle = getMetaProperty("og:title");
  if (!ogTitle) {
    tags.push({
      name: "og:title",
      label: "OG: Title",
      value: null,
      status: "fail",
      feedback: "Missing og:title. Required for proper Facebook/LinkedIn sharing previews.",
      category: "open-graph",
    });
  } else if (ogTitle.length > 95) {
    tags.push({
      name: "og:title",
      label: "OG: Title",
      value: ogTitle,
      status: "warn",
      feedback: `og:title is long (${ogTitle.length} chars). Facebook recommends under 95 characters.`,
      category: "open-graph",
    });
  } else {
    tags.push({
      name: "og:title",
      label: "OG: Title",
      value: ogTitle,
      status: "pass",
      feedback: "og:title is present and properly sized.",
      category: "open-graph",
    });
  }

  const ogDescription = getMetaProperty("og:description");
  if (!ogDescription) {
    tags.push({
      name: "og:description",
      label: "OG: Description",
      value: null,
      status: "warn",
      feedback: "Missing og:description. Add it to control how your page appears when shared on social media.",
      category: "open-graph",
    });
  } else {
    tags.push({
      name: "og:description",
      label: "OG: Description",
      value: ogDescription,
      status: "pass",
      feedback: "og:description is set.",
      category: "open-graph",
    });
  }

  const ogImage = getMetaProperty("og:image");
  if (!ogImage) {
    tags.push({
      name: "og:image",
      label: "OG: Image",
      value: null,
      status: "fail",
      feedback: "Missing og:image. Pages without a share image get poor engagement on social media.",
      category: "open-graph",
    });
  } else {
    tags.push({
      name: "og:image",
      label: "OG: Image",
      value: ogImage,
      status: "pass",
      feedback: "og:image is set.",
      category: "open-graph",
    });
  }

  const ogUrl = getMetaProperty("og:url");
  if (!ogUrl) {
    tags.push({
      name: "og:url",
      label: "OG: URL",
      value: null,
      status: "warn",
      feedback: "Missing og:url. Helps social platforms correctly attribute shared content.",
      category: "open-graph",
    });
  } else {
    tags.push({
      name: "og:url",
      label: "OG: URL",
      value: ogUrl,
      status: "pass",
      feedback: "og:url is set.",
      category: "open-graph",
    });
  }

  const ogType = getMetaProperty("og:type");
  if (!ogType) {
    tags.push({
      name: "og:type",
      label: "OG: Type",
      value: null,
      status: "info",
      feedback: "og:type not set. Common values: 'website', 'article'. Defaults to 'website' if omitted.",
      category: "open-graph",
    });
  } else {
    tags.push({
      name: "og:type",
      label: "OG: Type",
      value: ogType,
      status: "pass",
      feedback: `og:type is set to '${ogType}'.`,
      category: "open-graph",
    });
  }

  const ogSiteName = getMetaProperty("og:site_name");
  tags.push({
    name: "og:site_name",
    label: "OG: Site Name",
    value: ogSiteName,
    status: ogSiteName ? "pass" : "info",
    feedback: ogSiteName
      ? `og:site_name is '${ogSiteName}'.`
      : "og:site_name not set. Recommended to identify your brand in shares.",
    category: "open-graph",
  });

  // ---- TWITTER ----

  const twitterCard = getMetaContent("twitter:card");
  if (!twitterCard) {
    tags.push({
      name: "twitter:card",
      label: "Twitter: Card Type",
      value: null,
      status: "fail",
      feedback: "Missing twitter:card. Without it, Twitter won't show a rich card preview. Use 'summary_large_image' for best results.",
      category: "twitter",
    });
  } else {
    const validCards = ["summary", "summary_large_image", "app", "player"];
    const isValid = validCards.includes(twitterCard);
    tags.push({
      name: "twitter:card",
      label: "Twitter: Card Type",
      value: twitterCard,
      status: isValid ? "pass" : "warn",
      feedback: isValid
        ? `Twitter card type '${twitterCard}' is valid.`
        : `'${twitterCard}' is not a standard card type. Use one of: ${validCards.join(", ")}.`,
      category: "twitter",
    });
  }

  const twitterTitle = getMetaContent("twitter:title");
  if (!twitterTitle) {
    tags.push({
      name: "twitter:title",
      label: "Twitter: Title",
      value: null,
      status: "warn",
      feedback: "Missing twitter:title. Twitter will fall back to og:title if set, but explicit is better.",
      category: "twitter",
    });
  } else {
    tags.push({
      name: "twitter:title",
      label: "Twitter: Title",
      value: twitterTitle,
      status: "pass",
      feedback: "twitter:title is set.",
      category: "twitter",
    });
  }

  const twitterDescription = getMetaContent("twitter:description");
  if (!twitterDescription) {
    tags.push({
      name: "twitter:description",
      label: "Twitter: Description",
      value: null,
      status: "warn",
      feedback: "Missing twitter:description. Twitter will fall back to og:description if set.",
      category: "twitter",
    });
  } else {
    tags.push({
      name: "twitter:description",
      label: "Twitter: Description",
      value: twitterDescription,
      status: "pass",
      feedback: "twitter:description is set.",
      category: "twitter",
    });
  }

  const twitterImage = getMetaContent("twitter:image");
  if (!twitterImage) {
    tags.push({
      name: "twitter:image",
      label: "Twitter: Image",
      value: null,
      status: "warn",
      feedback: "Missing twitter:image. Twitter will fall back to og:image if set.",
      category: "twitter",
    });
  } else {
    tags.push({
      name: "twitter:image",
      label: "Twitter: Image",
      value: twitterImage,
      status: "pass",
      feedback: "twitter:image is set.",
      category: "twitter",
    });
  }

  const twitterSite = getMetaContent("twitter:site");
  tags.push({
    name: "twitter:site",
    label: "Twitter: Site Handle",
    value: twitterSite,
    status: twitterSite ? "pass" : "info",
    feedback: twitterSite
      ? `Twitter site handle: ${twitterSite}`
      : "twitter:site not set. Recommended if you have a Twitter account (@handle).",
    category: "twitter",
  });

  return tags;
}

router.post("/seo/analyze", async (req, res): Promise<void> => {
  const parsed = AnalyzeSeoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.message });
    return;
  }

  const { url } = parsed.data;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Only HTTP/HTTPS URLs are supported");
    }
  } catch {
    res.status(400).json({ error: "Invalid URL", details: "Please provide a valid HTTP or HTTPS URL" });
    return;
  }

  let html: string;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SEOAnalyzerBot/1.0; +https://seo-analyzer.replit.app)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      res.status(422).json({
        error: "Failed to fetch URL",
        details: `Server returned ${response.status} ${response.statusText}`,
      });
      return;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      res.status(422).json({
        error: "Not an HTML page",
        details: `Content-Type was '${contentType}'. Only HTML pages can be analyzed.`,
      });
      return;
    }

    html = await response.text();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.warn({ url: parsedUrl.toString(), err: msg }, "Failed to fetch URL");
    res.status(422).json({
      error: "Could not fetch page",
      details: msg.includes("abort") ? "Request timed out after 15 seconds" : msg,
    });
    return;
  }

  const tags = evaluateTags(html, parsedUrl.toString());
  const root = parse(html);

  const getMetaContent = (name: string): string | null =>
    root.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ?? null;
  const getMetaProperty = (property: string): string | null =>
    root.querySelector(`meta[property="${property}"]`)?.getAttribute("content") ?? null;

  const titleEl = root.querySelector("title");
  const titleText = titleEl?.text?.trim() ?? null;

  const generalScore = computeCategoryScore(tags, "general");
  const ogScore = computeCategoryScore(tags, "open-graph");
  const twitterScore = computeCategoryScore(tags, "twitter");
  const technicalScore = computeCategoryScore(tags, "technical");
  const overall = Math.round((generalScore * 0.4 + ogScore * 0.25 + twitterScore * 0.2 + technicalScore * 0.15));

  const allMetaTags = root.querySelectorAll("meta");

  const result = AnalyzeSeoResponse.parse({
    url: parsedUrl.toString(),
    fetchedAt: new Date().toISOString(),
    tags,
    score: {
      overall,
      general: generalScore,
      openGraph: ogScore,
      twitter: twitterScore,
      technical: technicalScore,
    },
    googlePreview: {
      title: titleText,
      description: getMetaContent("description"),
      url: parsedUrl.toString(),
    },
    facebookPreview: {
      title: getMetaProperty("og:title") ?? titleText,
      description: getMetaProperty("og:description") ?? getMetaContent("description"),
      image: getMetaProperty("og:image"),
      siteName: getMetaProperty("og:site_name"),
      cardType: getMetaProperty("og:type"),
    },
    twitterPreview: {
      title: getMetaContent("twitter:title") ?? getMetaProperty("og:title") ?? titleText,
      description:
        getMetaContent("twitter:description") ??
        getMetaProperty("og:description") ??
        getMetaContent("description"),
      image: getMetaContent("twitter:image") ?? getMetaProperty("og:image"),
      siteName: getMetaContent("twitter:site"),
      cardType: getMetaContent("twitter:card"),
    },
    rawTagCount: allMetaTags.length,
  });

  res.json(result);
});

export default router;
