import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeSeo } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Activity,
  Share2,
  AlertCircle,
  CheckCircle2,
  Info,
  Globe,
  AlertTriangle,
  ChevronRight,
  ListChecks,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type TagStatus = "pass" | "warn" | "fail" | "info";
type TagCategory = "general" | "open-graph" | "twitter" | "technical" | "structured-data";

interface SeoTag {
  name: string;
  label: string;
  value: string | null | undefined;
  status: TagStatus;
  feedback: string;
  category: TagCategory;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const { mutate: analyze, data, isPending, error } = useAnalyzeSeo();
  const { toast } = useToast();
  const issuesRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL.",
        variant: "destructive",
      });
      return;
    }

    const targetUrl = url.startsWith("http") ? url : `https://${url}`;
    analyze(
      { data: { url: targetUrl } },
      {
        onError: () => {
          toast({
            title: "Analysis Failed",
            description:
              "Could not fetch or analyze the URL. Please check the address and try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const failTags = data?.tags.filter((t: SeoTag) => t.status === "fail") ?? [];
  const warnTags = data?.tags.filter((t: SeoTag) => t.status === "warn") ?? [];
  const issues = [...failTags, ...warnTags];
  const passTags = data?.tags.filter((t: SeoTag) => t.status === "pass") ?? [];
  const infoTags = data?.tags.filter((t: SeoTag) => t.status === "info") ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/70 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 shrink-0">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold tracking-tight">SEO Analyzer</h1>
            </div>

            <form
              onSubmit={handleSubmit}
              className="w-full md:w-auto flex-1 md:max-w-2xl flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Enter a URL to analyze (e.g. https://example.com)"
                  className="pl-9 font-mono text-sm"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <Button
                type="submit"
                disabled={isPending || !url}
                className="min-w-[100px]"
              >
                {isPending ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Analyze"
                )}
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Empty state */}
          {!data && !isPending && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="bg-muted/30 p-6 rounded-full mb-6 border border-border/50">
                <Globe className="w-12 h-12 text-muted-foreground/40" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to audit</h2>
              <p className="text-muted-foreground max-w-md text-sm">
                Enter a URL above to run a deep analysis of its meta tags, social cards, and general SEO structure.
              </p>
            </motion.div>
          )}

          {/* Loading skeleton */}
          {isPending && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-28 bg-muted/20 animate-pulse rounded-xl border border-border/40" />
                ))}
              </div>
              <div className="h-48 bg-muted/20 animate-pulse rounded-xl border border-border/40" />
              <div className="h-72 bg-muted/20 animate-pulse rounded-xl border border-border/40" />
              <div className="h-96 bg-muted/20 animate-pulse rounded-xl border border-border/40" />
            </motion.div>
          )}

          {/* Results */}
          {data && !isPending && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span>
                  Analyzed:{" "}
                  <span className="font-mono text-foreground">{data.url}</span>
                </span>
                <span>
                  <span className="font-semibold text-foreground">{data.rawTagCount}</span> meta tags found
                </span>
                <span>
                  <span className="font-semibold text-rose-500">{failTags.length}</span> errors &middot;{" "}
                  <span className="font-semibold text-amber-500">{warnTags.length}</span> warnings &middot;{" "}
                  <span className="font-semibold text-emerald-500">{passTags.length}</span> passed
                </span>
              </div>

              {/* Score cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ScoreCard title="Overall" score={data.score.overall} size="large" />
                <ScoreCard title="General SEO" score={data.score.general} />
                <ScoreCard title="Open Graph" score={data.score.openGraph} />
                <ScoreCard title="Twitter" score={data.score.twitter} />
                <ScoreCard title="Technical" score={data.score.technical} />
              </div>

              {/* Previews row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GooglePreviewCard data={data} />
                <SocialPreviewCard
                  title="Facebook Preview"
                  preview={data.facebookPreview}
                  url={data.url}
                />
                <SocialPreviewCard
                  title="Twitter Card Preview"
                  preview={data.twitterPreview}
                  url={data.url}
                  twitter
                />
              </div>

              {/* ── SECTION 1: Issues ── */}
              <div ref={issuesRef}>
                <SectionHeader
                  icon={<XCircle className="w-5 h-5 text-rose-500" />}
                  title="Issues Found"
                  badge={
                    issues.length > 0 ? (
                      <span className="ml-2 inline-flex items-center gap-1 text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold px-2.5 py-0.5 rounded-full">
                        {issues.length} {issues.length === 1 ? "issue" : "issues"}
                      </span>
                    ) : null
                  }
                  description={
                    issues.length === 0
                      ? "No critical issues found — great job!"
                      : "These tags are missing or incorrect and are hurting your SEO."
                  }
                />

                {issues.length === 0 ? (
                  <div className="flex items-center gap-3 p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">All checks passed. No issues detected.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {failTags.length > 0 && (
                      <IssueGroup
                        label="Errors"
                        icon={<XCircle className="w-4 h-4 text-rose-500" />}
                        tags={failTags as SeoTag[]}
                        colorClass="border-rose-500/20 bg-rose-500/5"
                        badgeClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      />
                    )}
                    {warnTags.length > 0 && (
                      <IssueGroup
                        label="Warnings"
                        icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                        tags={warnTags as SeoTag[]}
                        colorClass="border-amber-500/20 bg-amber-500/5"
                        badgeClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* ── SECTION 2: All Suggestions ── */}
              <div ref={suggestionsRef}>
                <SectionHeader
                  icon={<ListChecks className="w-5 h-5 text-primary" />}
                  title="All SEO Suggestions"
                  description="Complete tag-by-tag breakdown with recommendations for every SEO element on this page."
                />

                <Tabs defaultValue="all">
                  <TabsList className="mb-4 flex-wrap h-auto gap-1">
                    <TabsTrigger value="all">
                      All
                      <CountBadge count={data.tags.length} />
                    </TabsTrigger>
                    <TabsTrigger value="general">
                      General
                      <CountBadge count={data.tags.filter((t: SeoTag) => t.category === "general").length} />
                    </TabsTrigger>
                    <TabsTrigger value="open-graph">
                      Open Graph
                      <CountBadge count={data.tags.filter((t: SeoTag) => t.category === "open-graph").length} />
                    </TabsTrigger>
                    <TabsTrigger value="twitter">
                      Twitter
                      <CountBadge count={data.tags.filter((t: SeoTag) => t.category === "twitter").length} />
                    </TabsTrigger>
                    <TabsTrigger value="technical">
                      Technical
                      <CountBadge count={data.tags.filter((t: SeoTag) => t.category === "technical").length} />
                    </TabsTrigger>
                  </TabsList>

                  <Card className="border-border/50 shadow-sm">
                    <TabsContent value="all" className="m-0">
                      <TagTable tags={data.tags} />
                    </TabsContent>
                    <TabsContent value="general" className="m-0">
                      <TagTable tags={data.tags.filter((t: SeoTag) => t.category === "general")} />
                    </TabsContent>
                    <TabsContent value="open-graph" className="m-0">
                      <TagTable tags={data.tags.filter((t: SeoTag) => t.category === "open-graph")} />
                    </TabsContent>
                    <TabsContent value="twitter" className="m-0">
                      <TagTable tags={data.tags.filter((t: SeoTag) => t.category === "twitter")} />
                    </TabsContent>
                    <TabsContent value="technical" className="m-0">
                      <TagTable tags={data.tags.filter((t: SeoTag) => t.category === "technical")} />
                    </TabsContent>
                  </Card>
                </Tabs>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ── Sub-components ── */

function SectionHeader({
  icon,
  title,
  badge,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
        {badge}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground ml-7">{description}</p>
      )}
    </div>
  );
}

function IssueGroup({
  label,
  icon,
  tags,
  colorClass,
  badgeClass,
}: {
  label: string;
  icon: React.ReactNode;
  tags: SeoTag[];
  colorClass: string;
  badgeClass: string;
}) {
  return (
    <div className={`rounded-xl border ${colorClass} overflow-hidden`}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-inherit">
        {icon}
        <span className="text-sm font-semibold">{label}</span>
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass}`}>
          {tags.length}
        </span>
      </div>
      <div className="divide-y divide-border/40">
        {tags.map((tag, i) => (
          <div key={i} className="px-4 py-3 flex items-start gap-3">
            <StatusIcon status={tag.status} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{tag.label}</span>
                <code className="text-xs text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                  {tag.name}
                </code>
              </div>
              {tag.value ? (
                <div className="text-xs font-mono text-foreground/70 bg-muted/30 border border-border/40 px-2 py-1 rounded mb-1.5 break-all">
                  {tag.value}
                </div>
              ) : (
                <div className="text-xs italic text-muted-foreground/60 mb-1.5">Missing</div>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">
                <ChevronRight className="w-3.5 h-3.5 inline mr-0.5 -mt-0.5 opacity-50" />
                {tag.feedback}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="ml-1.5 text-xs bg-muted text-muted-foreground font-medium px-1.5 py-0.5 rounded-full">
      {count}
    </span>
  );
}

function ScoreCard({
  title,
  score,
  size = "default",
}: {
  title: string;
  score: number;
  size?: "default" | "large";
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
    const t = setTimeout(() => setCurrent(score), 120);
    return () => clearTimeout(t);
  }, [score]);

  const color =
    score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500";
  const barColor =
    score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500";

  return (
    <Card
      className={`border-border/50 shadow-sm overflow-hidden relative ${
        size === "large" ? "col-span-2 md:col-span-1" : ""
      }`}
    >
      <CardContent className="px-4 pt-5 pb-6 flex flex-col items-center justify-center">
        <div className="text-xs font-medium text-muted-foreground mb-2 text-center leading-tight">
          {title}
        </div>
        <div
          className={`font-mono font-bold tracking-tighter transition-all duration-700 ${color} ${
            size === "large" ? "text-5xl" : "text-3xl"
          }`}
        >
          {Math.round(current)}
        </div>
      </CardContent>
      <div
        className={`absolute bottom-0 left-0 h-1 ${barColor} opacity-60 transition-all duration-1000 ease-out`}
        style={{ width: `${current}%` }}
      />
    </Card>
  );
}

function GooglePreviewCard({ data }: { data: any }) {
  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50 py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Search className="w-4 h-4" /> Google Search Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 bg-white dark:bg-[#202124]">
        <div className="font-sans">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
              {(data.googlePreview.url || data.url).charAt(8)?.toUpperCase() ?? "?"}
            </div>
            <div>
              <div className="text-[13px] leading-tight text-[#202124] dark:text-[#dadce0]">
                {new URL(data.url).hostname}
              </div>
              <div className="text-[11px] text-[#4d5156] dark:text-[#bdc1c6] leading-tight truncate max-w-[220px]">
                {data.googlePreview.url}
              </div>
            </div>
          </div>
          <h3 className="text-[19px] leading-[1.3] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-0.5 line-clamp-2">
            {data.googlePreview.title || (
              <span className="italic text-rose-400 text-base">Missing title tag</span>
            )}
          </h3>
          <p className="text-[13px] leading-[1.58] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
            {data.googlePreview.description || (
              <span className="italic text-amber-500/80">
                No meta description — Google will auto-generate a snippet.
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SocialPreviewCard({
  title,
  preview,
  url,
  twitter,
}: {
  title: string;
  preview: any;
  url: string;
  twitter?: boolean;
}) {
  const hostname = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/50 py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Share2 className="w-4 h-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {twitter ? (
          <div className="border border-border/40 rounded-xl overflow-hidden font-sans">
            <div className="w-full aspect-[1.91/1] bg-muted flex items-center justify-center">
              {preview.image ? (
                <img
                  src={preview.image}
                  alt="Twitter Card"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-xs text-muted-foreground/50">No image</span>
              )}
            </div>
            <div className="p-3 bg-card">
              <div className="text-muted-foreground text-[12px] mb-0.5">{preview.siteName || hostname}</div>
              <div className="font-bold text-[14px] leading-tight truncate">
                {preview.title || <span className="italic text-muted-foreground/60">Missing title</span>}
              </div>
              <div className="text-muted-foreground text-[13px] line-clamp-2">
                {preview.description || <span className="italic text-muted-foreground/40">Missing description</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-border/40 bg-[#f0f2f5] dark:bg-[#18191a] font-sans rounded overflow-hidden">
            <div className="w-full aspect-[1.91/1] bg-muted flex items-center justify-center">
              {preview.image ? (
                <img
                  src={preview.image}
                  alt="Facebook Card"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="text-xs text-muted-foreground/50">No image</span>
              )}
            </div>
            <div className="p-3 bg-[#f0f2f5] dark:bg-[#242526]">
              <div className="text-[#606770] dark:text-[#b0b3b8] text-[11px] uppercase tracking-wide mb-0.5 truncate">
                {hostname}
              </div>
              <div className="font-semibold text-[#1d2129] dark:text-[#e4e6eb] text-[15px] leading-tight truncate">
                {preview.title || <span className="italic text-muted-foreground/60">Missing title</span>}
              </div>
              <div className="text-[#606770] dark:text-[#b0b3b8] text-[13px] line-clamp-1">
                {preview.description || <span className="italic text-muted-foreground/40">Missing description</span>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TagTable({ tags }: { tags: SeoTag[] }) {
  if (tags.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        No tags found for this category.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/40">
      {tags.map((tag, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.02, duration: 0.2 }}
          className="px-5 py-4 hover:bg-muted/10 transition-colors"
        >
          <div className="flex items-start gap-4">
            <StatusIcon status={tag.status} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-semibold text-sm">{tag.label}</span>
                <code className="text-xs text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded">
                  {tag.name}
                </code>
                <StatusBadge status={tag.status} />
              </div>
              <div className="text-xs font-mono break-all mb-2 text-foreground/80 bg-muted/20 border border-border/30 px-2.5 py-1.5 rounded">
                {tag.value ?? (
                  <span className="italic text-muted-foreground/50">Missing</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{tag.feedback}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StatusIcon({ status, className = "" }: { status: TagStatus; className?: string }) {
  const cls = `w-4.5 h-4.5 ${className}`;
  switch (status) {
    case "pass":
      return <CheckCircle2 className={`w-[18px] h-[18px] text-emerald-500 ${className}`} />;
    case "warn":
      return <AlertTriangle className={`w-[18px] h-[18px] text-amber-500 ${className}`} />;
    case "fail":
      return <XCircle className={`w-[18px] h-[18px] text-rose-500 ${className}`} />;
    case "info":
    default:
      return <Info className={`w-[18px] h-[18px] text-blue-500 ${className}`} />;
  }
}

function StatusBadge({ status }: { status: TagStatus }) {
  const config: Record<TagStatus, { label: string; className: string }> = {
    pass: { label: "Pass", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    warn: { label: "Warning", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    fail: { label: "Fail", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
    info: { label: "Info", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  };
  const { label, className } = config[status];
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}
