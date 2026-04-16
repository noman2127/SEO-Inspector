import { useState, useEffect } from "react";
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
  Zap,
  TrendingUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
  const { mutate: analyze, data, isPending } = useAnalyzeSeo();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const raw = url.trim();
    const targeted = raw.startsWith("http") ? raw : `https://${raw}`;

    try {
      new URL(targeted);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL.",
        variant: "destructive",
      });
      return;
    }

    analyze(
      { data: { url: targeted } },
      {
        onError: () => {
          toast({
            title: "Analysis Failed",
            description: "Could not fetch or analyze the URL. Please check the address and try again.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const failTags = data?.tags.filter((t: SeoTag) => t.status === "fail") ?? [];
  const warnTags = data?.tags.filter((t: SeoTag) => t.status === "warn") ?? [];
  const passTags = data?.tags.filter((t: SeoTag) => t.status === "pass") ?? [];
  const issues = [...failTags, ...warnTags];
  const total = data?.tags.length ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:gap-4 sm:py-3">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-sm">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-bold tracking-tight">SEO Analyzer</span>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-1 gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  type="url"
                  placeholder="https://example.com"
                  className="pl-9 h-10 font-mono text-sm w-full"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isPending}
                  autoComplete="url"
                />
              </div>
              <Button
                type="submit"
                disabled={isPending || !url.trim()}
                className="h-10 shrink-0 px-4 sm:px-6 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-sm"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                    <span className="hidden sm:inline">Analyzing</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Analyze</span>
                  </span>
                )}
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <AnimatePresence mode="wait">

          {/* Empty state */}
          {!data && !isPending && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center sm:py-32"
            >
              {/* Decorative gradient orbs */}
              <div className="relative mb-8">
                <div className="absolute -inset-8 rounded-full bg-blue-500/10 blur-2xl" />
                <div className="absolute -inset-4 rounded-full bg-violet-500/10 blur-xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-border/50 bg-gradient-to-br from-blue-500/10 to-violet-600/10 shadow-lg">
                  <Globe className="h-11 w-11 text-blue-500/70" />
                </div>
              </div>
              <h2 className="mb-3 text-2xl font-bold sm:text-3xl">Audit any website instantly</h2>
              <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                Enter any URL above to analyze meta tags, social previews, and SEO health — in seconds.
              </p>

              {/* Feature chips */}
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["Google Preview", "Open Graph", "Twitter Cards", "Technical SEO"].map((f) => (
                  <span key={f} className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading skeleton */}
          {isPending && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-32 animate-pulse rounded-2xl border border-border/40 bg-muted/20" />
                ))}
              </div>
              <div className="h-6 w-48 animate-pulse rounded-full bg-muted/30" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-52 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
                ))}
              </div>
              <div className="h-64 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
              <div className="h-96 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
            </motion.div>
          )}

          {/* Results */}
          {data && !isPending && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 sm:space-y-10"
            >
              {/* Meta summary row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                <span className="font-mono text-xs text-foreground/70 truncate max-w-[240px] sm:max-w-none">
                  {data.url}
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <span><span className="font-semibold text-foreground">{data.rawTagCount}</span> tags</span>
                  <span className="text-rose-500 font-semibold">{failTags.length} errors</span>
                  <span className="text-amber-500 font-semibold">{warnTags.length} warnings</span>
                  <span className="text-emerald-500 font-semibold">{passTags.length} passed</span>
                </div>
              </div>

              {/* Score cards — circular rings */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                <ScoreCard title="Overall" score={data.score.overall} highlight />
                <ScoreCard title="General" score={data.score.general} />
                <ScoreCard title="Open Graph" score={data.score.openGraph} />
                <ScoreCard title="Twitter" score={data.score.twitter} />
                <ScoreCard title="Technical" score={data.score.technical} />
              </div>

              {/* Visual distribution bar */}
              {total > 0 && (
                <DistributionBar pass={passTags.length} warn={warnTags.length} fail={failTags.length} total={total} />
              )}

              {/* Preview row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <GooglePreviewCard data={data} />
                <SocialPreviewCard title="Facebook Preview" preview={data.facebookPreview} url={data.url} />
                <SocialPreviewCard title="Twitter Card" preview={data.twitterPreview} url={data.url} twitter />
              </div>

              {/* ── SECTION 1: Issues Found ── */}
              <section>
                <SectionHeader
                  icon={<XCircle className="h-5 w-5 text-rose-500" />}
                  title="Issues Found"
                  count={issues.length > 0 ? issues.length : undefined}
                  countColor="rose"
                  description={
                    issues.length === 0
                      ? "No critical issues found — great job!"
                      : "These tags are missing or incorrect and are hurting your SEO."
                  }
                />

                {issues.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-4 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">All checks passed. No issues detected.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {failTags.length > 0 && (
                      <IssueGroup
                        label="Errors"
                        icon={<XCircle className="h-4 w-4 text-rose-500" />}
                        tags={failTags as SeoTag[]}
                        borderClass="border-rose-500/25"
                        bgClass="bg-rose-500/[0.04]"
                        dividerClass="divide-rose-500/10"
                        badgeClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      />
                    )}
                    {warnTags.length > 0 && (
                      <IssueGroup
                        label="Warnings"
                        icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                        tags={warnTags as SeoTag[]}
                        borderClass="border-amber-500/25"
                        bgClass="bg-amber-500/[0.04]"
                        dividerClass="divide-amber-500/10"
                        badgeClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      />
                    )}
                  </div>
                )}
              </section>

              {/* ── SECTION 2: All SEO Suggestions ── */}
              <section>
                <SectionHeader
                  icon={<ListChecks className="h-5 w-5 text-primary" />}
                  title="All SEO Suggestions"
                  description="Full tag-by-tag breakdown with recommendations for every SEO element on this page."
                />

                <Tabs defaultValue="all">
                  <ScrollArea className="w-full pb-0 mb-3">
                    <TabsList className="inline-flex h-9 w-auto gap-1 bg-muted/50 px-1 rounded-lg">
                      <TabsTrigger value="all" className="h-7 text-xs sm:text-sm px-2.5">
                        All <CountPill count={data.tags.length} />
                      </TabsTrigger>
                      <TabsTrigger value="general" className="h-7 text-xs sm:text-sm px-2.5">
                        General <CountPill count={data.tags.filter((t: SeoTag) => t.category === "general").length} />
                      </TabsTrigger>
                      <TabsTrigger value="open-graph" className="h-7 text-xs sm:text-sm px-2.5 whitespace-nowrap">
                        Open Graph <CountPill count={data.tags.filter((t: SeoTag) => t.category === "open-graph").length} />
                      </TabsTrigger>
                      <TabsTrigger value="twitter" className="h-7 text-xs sm:text-sm px-2.5">
                        Twitter <CountPill count={data.tags.filter((t: SeoTag) => t.category === "twitter").length} />
                      </TabsTrigger>
                      <TabsTrigger value="technical" className="h-7 text-xs sm:text-sm px-2.5">
                        Technical <CountPill count={data.tags.filter((t: SeoTag) => t.category === "technical").length} />
                      </TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" className="invisible" />
                  </ScrollArea>

                  <Card className="overflow-hidden border-border/50 shadow-sm">
                    <TabsContent value="all" className="m-0 focus-visible:outline-none">
                      <TagTable tags={data.tags} />
                    </TabsContent>
                    <TabsContent value="general" className="m-0 focus-visible:outline-none">
                      <TagTable tags={data.tags.filter((t: SeoTag) => t.category === "general")} />
                    </TabsContent>
                    <TabsContent value="open-graph" className="m-0 focus-visible:outline-none">
                      <TagTable tags={data.tags.filter((t: SeoTag) => t.category === "open-graph")} />
                    </TabsContent>
                    <TabsContent value="twitter" className="m-0 focus-visible:outline-none">
                      <TagTable tags={data.tags.filter((t: SeoTag) => t.category === "twitter")} />
                    </TabsContent>
                    <TabsContent value="technical" className="m-0 focus-visible:outline-none">
                      <TagTable tags={data.tags.filter((t: SeoTag) => t.category === "technical")} />
                    </TabsContent>
                  </Card>
                </Tabs>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ─────────────── Sub-components ─────────────── */

function SectionHeader({
  icon,
  title,
  count,
  countColor = "neutral",
  description,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
  countColor?: "rose" | "amber" | "neutral";
  description?: string;
}) {
  const pillColors: Record<string, string> = {
    rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    neutral: "bg-muted text-muted-foreground",
  };

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        {icon}
        <h2 className="text-base font-bold tracking-tight sm:text-lg">{title}</h2>
        {count !== undefined && (
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pillColors[countColor]}`}>
            {count} {count === 1 ? "issue" : "issues"}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground sm:ml-7">{description}</p>
      )}
    </div>
  );
}

function IssueGroup({
  label,
  icon,
  tags,
  borderClass,
  bgClass,
  dividerClass,
  badgeClass,
}: {
  label: string;
  icon: React.ReactNode;
  tags: SeoTag[];
  borderClass: string;
  bgClass: string;
  dividerClass: string;
  badgeClass: string;
}) {
  return (
    <div className={`overflow-hidden rounded-xl border ${borderClass} ${bgClass}`}>
      <div className={`flex items-center gap-2 border-b ${borderClass} px-4 py-2.5`}>
        {icon}
        <span className="text-sm font-semibold">{label}</span>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
          {tags.length}
        </span>
      </div>

      <div className={`divide-y ${dividerClass}`}>
        {tags.map((tag, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <StatusIcon status={tag.status} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="text-sm font-semibold">{tag.label}</span>
                <code className="rounded bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                  {tag.name}
                </code>
              </div>
              {tag.value ? (
                <div className="mb-1.5 break-all rounded border border-border/30 bg-muted/30 px-2.5 py-1 font-mono text-[11px] text-foreground/70">
                  {tag.value}
                </div>
              ) : (
                <div className="mb-1.5 text-xs italic text-muted-foreground/60">Missing</div>
              )}
              <p className="text-sm leading-relaxed text-muted-foreground">
                <ChevronRight className="mr-0.5 inline-block h-3 w-3 -mt-0.5 opacity-40" />
                {tag.feedback}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountPill({ count }: { count: number }) {
  return (
    <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
      {count}
    </span>
  );
}

/* Circular SVG ring score card */
function ScoreCard({ title, score, highlight }: { title: string; score: number; highlight?: boolean }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
    const t = setTimeout(() => setCurrent(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const color =
    score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#f43f5e";
  const trackColor = "rgba(128,128,128,0.12)";

  const size = highlight ? 88 : 72;
  const strokeWidth = highlight ? 7 : 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (current / 100) * circumference;

  const labelColor =
    score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500";

  return (
    <Card className={`relative overflow-hidden border-border/50 shadow-sm transition-shadow hover:shadow-md ${highlight ? "col-span-2 sm:col-span-1" : ""}`}>
      <CardContent className="flex flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-5">
        <p className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground sm:text-xs">
          {title}
        </p>
        <div className="relative flex items-center justify-center">
          <svg
            width={size}
            height={size}
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={trackColor}
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <span
            className={`absolute font-mono font-bold tracking-tighter ${labelColor} ${highlight ? "text-2xl" : "text-lg"}`}
          >
            {Math.round(current)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

/* Stacked horizontal distribution bar */
function DistributionBar({ pass, warn, fail, total }: { pass: number; warn: number; fail: number; total: number }) {
  const pct = (n: number) => ((n / total) * 100).toFixed(1);

  return (
    <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Tag Health Overview</span>
        <span className="ml-auto text-xs text-muted-foreground">{total} tags analyzed</span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct(pass)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-emerald-500"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct(warn)}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          className="bg-amber-400"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct(fail)}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="bg-rose-500"
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        <LegendItem color="bg-emerald-500" label="Passed" count={pass} pct={pct(pass)} />
        <LegendItem color="bg-amber-400" label="Warnings" count={warn} pct={pct(warn)} />
        <LegendItem color="bg-rose-500" label="Errors" count={fail} pct={pct(fail)} />
      </div>
    </div>
  );
}

function LegendItem({ color, label, count, pct }: { color: string; label: string; count: number; pct: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${color} shrink-0`} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold">{count}</span>
      <span className="text-[11px] text-muted-foreground/60">({pct}%)</span>
    </div>
  );
}

function GooglePreviewCard({ data }: { data: any }) {
  let hostname = "";
  try { hostname = new URL(data.url).hostname; } catch { hostname = data.url; }

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Search className="h-4 w-4 shrink-0" /> Google Search Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white p-4 dark:bg-[#202124]">
        <div className="font-sans">
          <div className="mb-1 flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
              {hostname.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] text-[#202124] dark:text-[#dadce0]">{hostname}</div>
              <div className="truncate text-[11px] text-[#4d5156] dark:text-[#bdc1c6]">{data.googlePreview.url}</div>
            </div>
          </div>
          <h3 className="mb-0.5 line-clamp-2 text-[18px] leading-snug text-[#1a0dab] hover:underline dark:text-[#8ab4f8]">
            {data.googlePreview.title || <span className="text-base italic text-rose-400">Missing title tag</span>}
          </h3>
          <p className="line-clamp-3 text-[13px] leading-snug text-[#4d5156] dark:text-[#bdc1c6]">
            {data.googlePreview.description || (
              <span className="italic text-amber-500/80">No meta description — Google will auto-generate a snippet.</span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SocialPreviewCard({ title, preview, url, twitter }: { title: string; preview: any; url: string; twitter?: boolean }) {
  let hostname = "";
  try { hostname = new URL(url).hostname; } catch { hostname = url; }

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm">
      <CardHeader className="border-b border-border/50 bg-muted/20 px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Share2 className="h-4 w-4 shrink-0" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {twitter ? (
          <div className="overflow-hidden rounded-xl border border-border/40 font-sans">
            <ImageSlot src={preview.image} />
            <div className="bg-card p-3">
              <div className="mb-0.5 truncate text-[12px] text-muted-foreground">{preview.siteName || hostname}</div>
              <div className="truncate text-[14px] font-bold leading-tight">{preview.title || <EmptyLabel />}</div>
              <div className="line-clamp-2 text-[12px] text-muted-foreground">{preview.description || <EmptyLabel />}</div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded border border-border/40 font-sans">
            <ImageSlot src={preview.image} />
            <div className="bg-[#f0f2f5] p-3 dark:bg-[#242526]">
              <div className="mb-0.5 truncate text-[11px] uppercase tracking-wide text-[#606770] dark:text-[#b0b3b8]">{hostname}</div>
              <div className="truncate text-[14px] font-semibold leading-tight text-[#1d2129] dark:text-[#e4e6eb]">{preview.title || <EmptyLabel />}</div>
              <div className="line-clamp-1 text-[12px] text-[#606770] dark:text-[#b0b3b8]">{preview.description || <EmptyLabel />}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ImageSlot({ src }: { src?: string | null }) {
  return (
    <div className="aspect-[1.91/1] w-full bg-muted flex items-center justify-center">
      {src ? (
        <img
          src={src}
          alt="Preview"
          className="h-full w-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <span className="text-xs text-muted-foreground/50">No image</span>
      )}
    </div>
  );
}

function EmptyLabel() {
  return <span className="italic text-muted-foreground/50">Not set</span>;
}

function TagTable({ tags }: { tags: SeoTag[] }) {
  if (tags.length === 0) {
    return (
      <div className="px-5 py-10 text-center text-sm text-muted-foreground">
        No tags found for this category.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/40">
      {tags.map((tag, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.015 }}
          className="flex items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/10 sm:px-5"
        >
          <StatusIcon status={tag.status} className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold">{tag.label}</span>
              <code className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {tag.name}
              </code>
              <StatusBadge status={tag.status} />
            </div>
            <div className="mb-1.5 break-all rounded border border-border/30 bg-muted/20 px-2.5 py-1.5 font-mono text-[11px] text-foreground/70">
              {tag.value ?? <span className="italic text-muted-foreground/50">Missing</span>}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{tag.feedback}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StatusIcon({ status, className = "" }: { status: TagStatus; className?: string }) {
  const s = `h-[18px] w-[18px] ${className}`;
  switch (status) {
    case "pass":  return <CheckCircle2 className={`${s} text-emerald-500`} />;
    case "warn":  return <AlertTriangle className={`${s} text-amber-500`} />;
    case "fail":  return <XCircle className={`${s} text-rose-500`} />;
    default:      return <Info className={`${s} text-blue-500`} />;
  }
}

function StatusBadge({ status }: { status: TagStatus }) {
  const map: Record<TagStatus, { label: string; cls: string }> = {
    pass: { label: "Pass",    cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    warn: { label: "Warning", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
    fail: { label: "Fail",    cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
    info: { label: "Info",    cls: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {label}
    </span>
  );
}
