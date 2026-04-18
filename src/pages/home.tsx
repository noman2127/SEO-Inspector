import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeSeo } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Activity,
  Share2,
  CheckCircle2,
  Info,
  Globe,
  AlertTriangle,
  ChevronRight,
  ListChecks,
  XCircle,
  Zap,
  TrendingUp,
  FileText,
  Settings,
  Twitter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type TagStatus = "pass" | "warn" | "fail" | "info";
type TagCategory = "general" | "open-graph" | "twitter" | "technical" | "structured-data";

interface SeoTag {
  name: string;
  label: string;
  value?: string | null | undefined;
  status: TagStatus;
  feedback: string;
  category: TagCategory;
}

/* ─── Helpers ─── */
function getGrade(score: number): { letter: string; cls: string; bg: string } {
  if (score >= 90) return { letter: "A", cls: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
  if (score >= 75) return { letter: "B", cls: "text-blue-600 dark:text-blue-400",    bg: "bg-blue-500/10 border-blue-500/30" };
  if (score >= 60) return { letter: "C", cls: "text-amber-600 dark:text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30" };
  if (score >= 40) return { letter: "D", cls: "text-orange-600 dark:text-orange-400",bg: "bg-orange-500/10 border-orange-500/30" };
  return { letter: "F", cls: "text-rose-600 dark:text-rose-400",    bg: "bg-rose-500/10 border-rose-500/30" };
}

function getVerdict(score: number): { label: string; sub: string } {
  if (score >= 90) return { label: "Excellent", sub: "Your page is very well optimized for search engines." };
  if (score >= 75) return { label: "Good", sub: "Solid SEO setup with a few things that could be improved." };
  if (score >= 60) return { label: "Needs Work", sub: "Some important SEO elements are missing or incorrect." };
  if (score >= 40) return { label: "Poor", sub: "Several critical SEO issues are hurting your visibility." };
  return { label: "Critical", sub: "Major SEO problems detected — action is strongly recommended." };
}

function scoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 50) return "#f59e0b";
  return "#f43f5e";
}

const CATEGORIES = [
  {
    key: "general" as TagCategory,
    title: "General",
    icon: <FileText className="h-4 w-4" />,
    description: "Title, description & page structure",
    scoreKey: "general" as const,
  },
  {
    key: "open-graph" as TagCategory,
    title: "Open Graph",
    icon: <Share2 className="h-4 w-4" />,
    description: "How your page looks on Facebook & LinkedIn",
    scoreKey: "openGraph" as const,
  },
  {
    key: "twitter" as TagCategory,
    title: "Twitter / X",
    icon: <Twitter className="h-4 w-4" />,
    description: "How your page looks when shared on X",
    scoreKey: "twitter" as const,
  },
  {
    key: "technical" as TagCategory,
    title: "Technical",
    icon: <Settings className="h-4 w-4" />,
    description: "Viewport, robots & under-the-hood settings",
    scoreKey: "technical" as const,
  },
];

/* ─── Main component ─── */
export default function Home() {
  const [domain, setDomain] = useState("");
  const { mutate: analyze, data, isPending } = useAnalyzeSeo();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) return;
    const targeted = `https://${domain.trim()}`;
    try { new URL(targeted); } catch {
      toast({ title: "Invalid URL", description: "Please enter a valid website address.", variant: "destructive" });
      return;
    }
    analyze({ data: { url: targeted } }, {
      onError: () => toast({
        title: "Analysis Failed",
        description: "Could not fetch or analyze the URL. Please check the address and try again.",
        variant: "destructive",
      }),
    });
  };

  const failTags  = data?.tags.filter((t: SeoTag) => t.status === "fail") ?? [];
  const warnTags  = data?.tags.filter((t: SeoTag) => t.status === "warn") ?? [];
  const passTags  = data?.tags.filter((t: SeoTag) => t.status === "pass") ?? [];
  const issues    = [...failTags, ...warnTags];
  const total     = data?.tags.length ?? 0;

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
              <div className="flex flex-1 min-w-0 items-center h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <Search className="h-4 w-4 text-muted-foreground shrink-0 mr-2" />
                <span className="font-mono text-sm text-muted-foreground select-none shrink-0">https://</span>
                <input
                  type="text"
                  placeholder="example.com"
                  className="flex-1 min-w-0 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={isPending}
                  autoComplete="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                />
              </div>
              <Button
                type="submit"
                disabled={isPending || !domain.trim()}
                className="h-10 shrink-0 px-4 sm:px-6 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 border-0 shadow-sm"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                    <span className="hidden sm:inline">Analyzing…</span>
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
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {["Google Preview", "Open Graph", "Twitter Cards", "Technical SEO"].map((f) => (
                  <span key={f} className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">{f}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Loading skeleton */}
          {isPending && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="h-40 animate-pulse rounded-2xl border border-border/40 bg-muted/20" />
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[1,2,3,4].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl border border-border/40 bg-muted/20" />)}
              </div>
              <div className="h-10 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[1,2,3].map((i) => <div key={i} className="h-52 animate-pulse rounded-xl border border-border/40 bg-muted/20" />)}
              </div>
              <div className="h-64 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
              <div className="h-96 animate-pulse rounded-xl border border-border/40 bg-muted/20" />
            </motion.div>
          )}

          {/* ── RESULTS ── */}
          {data && !isPending && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* URL badge */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="font-mono truncate max-w-[280px] sm:max-w-none text-foreground/60">{data.url}</span>
                <span>{data.rawTagCount} tags found</span>
              </div>

              {/* ── 1. Overall Hero ── */}
              <OverallHero score={data.score.overall} fail={failTags.length} warn={warnTags.length} pass={passTags.length} />

              {/* ── 2. Category Cards ── */}
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Score by Category</h2>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {CATEGORIES.map((cat) => {
                    const catTags   = data.tags.filter((t: SeoTag) => t.category === cat.key);
                    const catPass   = catTags.filter((t: SeoTag) => t.status === "pass").length;
                    const catWarn   = catTags.filter((t: SeoTag) => t.status === "warn").length;
                    const catFail   = catTags.filter((t: SeoTag) => t.status === "fail").length;
                    const catScore  = data.score[cat.scoreKey];
                    return (
                      <CategoryCard
                        key={cat.key}
                        title={cat.title}
                        icon={cat.icon}
                        description={cat.description}
                        score={catScore}
                        pass={catPass}
                        warn={catWarn}
                        fail={catFail}
                      />
                    );
                  })}
                </div>
              </div>

              {/* ── 3. Distribution bar ── */}
              {total > 0 && (
                <DistributionBar pass={passTags.length} warn={warnTags.length} fail={failTags.length} total={total} />
              )}

              {/* ── 4. Social Previews ── */}
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">How Your Page Looks When Shared</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <GooglePreviewCard data={data} />
                  <SocialPreviewCard title="Facebook / LinkedIn" preview={data.facebookPreview} url={data.url} />
                  <SocialPreviewCard title="Twitter / X" preview={data.twitterPreview} url={data.url} twitter />
                </div>
              </section>

              {/* ── 5. Issues Accordion ── */}
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Issues &amp; Details</h2>
                <Accordion type="multiple" defaultValue={issues.length > 0 ? ["issues"] : []} className="space-y-3">

                  {/* Issues found */}
                  <AccordionItem value="issues" className="rounded-xl border border-border/50 bg-card/60 shadow-sm overflow-hidden px-0">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
                      <div className="flex items-center gap-2.5">
                        <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                        <span className="font-semibold text-sm">Issues Found</span>
                        {issues.length > 0 && (
                          <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                            {issues.length} {issues.length === 1 ? "issue" : "issues"}
                          </span>
                        )}
                        {issues.length === 0 && (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            All clear
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pb-0">
                      {issues.length === 0 ? (
                        <div className="flex items-center gap-3 px-5 py-4 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span className="text-sm font-medium">No critical issues found — great job!</span>
                        </div>
                      ) : (
                        <div className="divide-y divide-border/40">
                          {failTags.length > 0 && (
                            <IssueGroup
                              label="Errors"
                              icon={<XCircle className="h-4 w-4 text-rose-500" />}
                              tags={failTags as SeoTag[]}
                              borderClass="border-rose-500/0"
                              bgClass=""
                              dividerClass="divide-border/30"
                              badgeClass="bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            />
                          )}
                          {warnTags.length > 0 && (
                            <IssueGroup
                              label="Warnings"
                              icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                              tags={warnTags as SeoTag[]}
                              borderClass="border-amber-500/0"
                              bgClass=""
                              dividerClass="divide-border/30"
                              badgeClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            />
                          )}
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Full tag breakdown */}
                  <AccordionItem value="breakdown" className="rounded-xl border border-border/50 bg-card/60 shadow-sm overflow-hidden px-0">
                    <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/20 [&[data-state=open]]:border-b [&[data-state=open]]:border-border/40">
                      <div className="flex items-center gap-2.5">
                        <ListChecks className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold text-sm">Full Tag Breakdown</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                          {data.tags.length} tags
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-0 pb-0">
                      <Tabs defaultValue="all">
                        <div className="border-b border-border/40 px-4 py-2">
                          <ScrollArea className="w-full">
                            <TabsList className="inline-flex h-8 w-auto gap-1 bg-muted/50 px-1 rounded-lg">
                              <TabsTrigger value="all" className="h-6 text-xs px-2.5">
                                All <CountPill count={data.tags.length} />
                              </TabsTrigger>
                              <TabsTrigger value="general" className="h-6 text-xs px-2.5">
                                General <CountPill count={data.tags.filter((t: SeoTag) => t.category === "general").length} />
                              </TabsTrigger>
                              <TabsTrigger value="open-graph" className="h-6 text-xs px-2.5 whitespace-nowrap">
                                Open Graph <CountPill count={data.tags.filter((t: SeoTag) => t.category === "open-graph").length} />
                              </TabsTrigger>
                              <TabsTrigger value="twitter" className="h-6 text-xs px-2.5">
                                Twitter <CountPill count={data.tags.filter((t: SeoTag) => t.category === "twitter").length} />
                              </TabsTrigger>
                              <TabsTrigger value="technical" className="h-6 text-xs px-2.5">
                                Technical <CountPill count={data.tags.filter((t: SeoTag) => t.category === "technical").length} />
                              </TabsTrigger>
                            </TabsList>
                            <ScrollBar orientation="horizontal" className="invisible" />
                          </ScrollArea>
                        </div>
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
                      </Tabs>
                    </AccordionContent>
                  </AccordionItem>

                </Accordion>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ─────────────── Overall Hero ─────────────── */
function OverallHero({ score, fail, warn, pass }: { score: number; fail: number; warn: number; pass: number }) {
  const grade   = getGrade(score);
  const verdict = getVerdict(score);
  const total   = fail + warn + pass;

  return (
    <Card className="overflow-hidden border-border/50 shadow-md">
      {/* Gradient top strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500" />
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">

          {/* Big score ring */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <ScoreRing score={score} size={120} strokeWidth={10} />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overall Score</span>
          </div>

          {/* Verdict */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className={`rounded-lg border px-3 py-1 text-2xl font-black tracking-tight ${grade.cls} ${grade.bg}`}>
                {grade.letter}
              </span>
              <span className="text-xl font-bold">{verdict.label}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">{verdict.sub}</p>

            {/* Quick legend bar */}
            <div className="mt-4 flex h-2 w-full max-w-sm overflow-hidden rounded-full bg-muted/30 mx-auto sm:mx-0">
              {total > 0 && <>
                <motion.div initial={{ width: 0 }} animate={{ width: `${(pass / total) * 100}%` }} transition={{ duration: 0.9, ease: "easeOut" }} className="bg-emerald-500" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${(warn / total) * 100}%` }} transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }} className="bg-amber-400" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${(fail / total) * 100}%` }} transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }} className="bg-rose-500" />
              </>}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex shrink-0 gap-3 sm:flex-col sm:gap-2">
            <QuickStat label="Errors"   count={fail} color="rose"    icon={<XCircle className="h-4 w-4" />} />
            <QuickStat label="Warnings" count={warn} color="amber"   icon={<AlertTriangle className="h-4 w-4" />} />
            <QuickStat label="Passed"   count={pass} color="emerald" icon={<CheckCircle2 className="h-4 w-4" />} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickStat({ label, count, color, icon }: { label: string; count: number; color: string; icon: React.ReactNode }) {
  const map: Record<string, string> = {
    rose:    "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    amber:   "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  };
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${map[color]}`}>
      {icon}
      <div>
        <div className="text-lg font-bold leading-none">{count}</div>
        <div className="text-[10px] font-medium opacity-75 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

/* ─────────────── Category Card ─────────────── */
function CategoryCard({
  title, icon, description, score, pass, warn, fail,
}: {
  title: string; icon: React.ReactNode; description: string;
  score: number; pass: number; warn: number; fail: number;
}) {
  const grade   = getGrade(score);
  const total   = pass + warn + fail;
  const verdict = getVerdict(score);

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="flex flex-col items-center gap-3 p-4 text-center">
        {/* Icon + title */}
        <div className="flex items-center gap-2 w-full justify-center">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-bold">{title}</span>
          <span className={`ml-auto rounded-md border px-1.5 py-0.5 text-xs font-black ${grade.cls} ${grade.bg}`}>
            {grade.letter}
          </span>
        </div>

        {/* Score ring */}
        <ScoreRing score={score} size={80} strokeWidth={7} />

        {/* Verdict label */}
        <span className="text-xs font-semibold text-muted-foreground">{verdict.label}</span>

        {/* Mini stacked bar */}
        {total > 0 && (
          <div className="w-full space-y-1.5">
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(pass / total) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="bg-emerald-500" />
              <motion.div initial={{ width: 0 }} animate={{ width: `${(warn / total) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }} className="bg-amber-400" />
              <motion.div initial={{ width: 0 }} animate={{ width: `${(fail / total) * 100}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} className="bg-rose-500" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span className="text-emerald-500 font-medium">{pass} ✓</span>
              <span className="text-amber-500 font-medium">{warn} !</span>
              <span className="text-rose-500 font-medium">{fail} ✗</span>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-tight">{description}</p>
      </CardContent>
    </Card>
  );
}

/* ─────────────── Animated SVG ring ─────────────── */
function ScoreRing({ score, size, strokeWidth }: { score: number; size: number; strokeWidth: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    setCurrent(0);
    const t = setTimeout(() => setCurrent(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset      = circumference - (current / 100) * circumference;
  const color       = scoreColor(score);
  const labelColor  = score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500";
  const fontSize    = size >= 100 ? "text-3xl" : size >= 80 ? "text-xl" : "text-base";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth={strokeWidth} />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <span className={`absolute font-mono font-bold tracking-tighter ${labelColor} ${fontSize}`}>
        {Math.round(current)}
      </span>
    </div>
  );
}

/* ─────────────── Distribution bar ─────────────── */
function DistributionBar({ pass, warn, fail, total }: { pass: number; warn: number; fail: number; total: number }) {
  const pct = (n: number) => ((n / total) * 100).toFixed(1);
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 px-5 py-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Tag Health Overview</span>
        <span className="ml-auto text-xs text-muted-foreground">{total} tags analyzed</span>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted/30">
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct(pass)}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="bg-emerald-500" />
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct(warn)}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }} className="bg-amber-400" />
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct(fail)}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} className="bg-rose-500" />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        <LegendItem color="bg-emerald-500" label="Passed"   count={pass} pct={pct(pass)} />
        <LegendItem color="bg-amber-400"   label="Warnings" count={warn} pct={pct(warn)} />
        <LegendItem color="bg-rose-500"    label="Errors"   count={fail} pct={pct(fail)} />
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

/* ─────────────── Google preview ─────────────── */
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
            {data.googlePreview.description || <span className="italic text-amber-500/80">No meta description — Google will auto-generate a snippet.</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────── Social preview ─────────────── */
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
        <img src={src} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
      ) : (
        <span className="text-xs text-muted-foreground/50">No image</span>
      )}
    </div>
  );
}

function EmptyLabel() { return <span className="italic text-muted-foreground/50">Not set</span>; }

/* ─────────────── Issue group ─────────────── */
function IssueGroup({ label, icon, tags, borderClass, bgClass, dividerClass, badgeClass }: {
  label: string; icon: React.ReactNode; tags: SeoTag[];
  borderClass: string; bgClass: string; dividerClass: string; badgeClass: string;
}) {
  return (
    <div className={`overflow-hidden ${bgClass}`}>
      <div className={`flex items-center gap-2 border-b border-border/30 bg-muted/10 px-5 py-2.5`}>
        {icon}
        <span className="text-sm font-semibold">{label}</span>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>{tags.length}</span>
      </div>
      <div className={`divide-y ${dividerClass}`}>
        {tags.map((tag, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/10 transition-colors">
            <StatusIcon status={tag.status} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="text-sm font-semibold">{tag.label}</span>
                <code className="rounded bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground">{tag.name}</code>
              </div>
              {tag.value ? (
                <div className="mb-1.5 break-all rounded border border-border/30 bg-muted/30 px-2.5 py-1 font-mono text-[11px] text-foreground/70">{tag.value}</div>
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

/* ─────────────── Tag table ─────────────── */
function TagTable({ tags }: { tags: SeoTag[] }) {
  if (tags.length === 0) {
    return <div className="px-5 py-10 text-center text-sm text-muted-foreground">No tags found for this category.</div>;
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
              <code className="rounded bg-muted/40 px-1.5 py-0.5 text-[11px] text-muted-foreground">{tag.name}</code>
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

/* ─────────────── Shared small components ─────────────── */
function CountPill({ count }: { count: number }) {
  return (
    <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
      {count}
    </span>
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
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{label}</span>;
}

