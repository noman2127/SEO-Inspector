import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeSeo } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Activity, 
  Layout, 
  Share2, 
  Code,
  AlertCircle,
  CheckCircle2,
  Info,
  Globe
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [url, setUrl] = useState("");
  const { mutate: analyze, data, isPending, error } = useAnalyzeSeo();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Basic validation
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL.",
        variant: "destructive"
      });
      return;
    }

    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    analyze({ data: { url: targetUrl } }, {
      onError: () => {
        toast({
          title: "Analysis Failed",
          description: "Could not fetch or analyze the URL. Please check the address and try again.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold tracking-tight">SEO Analyzer</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="w-full md:w-auto flex-1 md:max-w-xl flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Enter a URL to analyze (e.g. https://example.com)" 
                  className="pl-9 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/50 font-mono text-sm"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isPending}
                />
              </div>
              <Button type="submit" disabled={isPending || !url} className="min-w-[100px]">
                {isPending ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : "Analyze"}
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {!data && !isPending && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="bg-muted/30 p-6 rounded-full mb-6 border border-border/50">
                <Globe className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Ready to audit</h2>
              <p className="text-muted-foreground max-w-md">
                Enter a URL above to run a deep analysis of its meta tags, social cards, and general SEO structure.
              </p>
            </motion.div>
          )}

          {isPending && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl border border-border/50" />
                ))}
              </div>
              <div className="h-64 bg-muted/20 animate-pulse rounded-xl border border-border/50" />
              <div className="h-96 bg-muted/20 animate-pulse rounded-xl border border-border/50" />
            </motion.div>
          )}

          {data && !isPending && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>Analyzed: <span className="font-mono text-foreground">{data.url}</span></span>
                <span>Found <span className="text-foreground font-bold">{data.rawTagCount}</span> tags</span>
              </div>

              {/* Scores */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ScoreCard title="Overall" score={data.score.overall} size="large" />
                <ScoreCard title="General SEO" score={data.score.general} />
                <ScoreCard title="Open Graph" score={data.score.openGraph} />
                <ScoreCard title="Twitter" score={data.score.twitter} />
                <ScoreCard title="Technical" score={data.score.technical} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Previews */}
                <div className="space-y-8 lg:col-span-1">
                  <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Search className="w-4 h-4" /> Google Search Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 bg-white dark:bg-[#202124]">
                      <div className="max-w-[600px] font-sans">
                        <div className="text-[14px] leading-[1.3] text-[#202124] dark:text-[#dadce0] mb-1 flex items-center gap-2">
                          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-[10px]">
                            {data.googlePreview.url.charAt(8).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-[14px] leading-tight">{new URL(data.url).hostname}</div>
                            <div className="text-[12px] text-[#4d5156] dark:text-[#bdc1c6] leading-tight">{data.googlePreview.url}</div>
                          </div>
                        </div>
                        <h3 className="text-[20px] leading-[1.3] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-1 truncate">
                          {data.googlePreview.title || 'Missing Title'}
                        </h3>
                        <p className="text-[14px] leading-[1.58] text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
                          {data.googlePreview.description || 'Missing meta description. Google will try to find a relevant part of your page text to show here.'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                      <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Share2 className="w-4 h-4" /> Facebook Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="border border-border/50 bg-[#f0f2f5] dark:bg-[#18191a] m-4 font-sans">
                          {data.facebookPreview.image ? (
                            <div className="w-full aspect-[1.91/1] bg-muted relative border-b border-border/50">
                              <img src={data.facebookPreview.image} alt="Facebook Card" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-full aspect-[1.91/1] bg-muted flex items-center justify-center border-b border-border/50 text-muted-foreground/50">
                              No Image
                            </div>
                          )}
                          <div className="p-3 bg-[#f0f2f5] dark:bg-[#242526]">
                            <div className="text-[#606770] dark:text-[#b0b3b8] text-[12px] uppercase tracking-wider mb-1 truncate">{new URL(data.url).hostname}</div>
                            <div className="font-semibold text-[#1d2129] dark:text-[#e4e6eb] text-[16px] leading-tight mb-1 truncate">{data.facebookPreview.title || 'Missing Title'}</div>
                            <div className="text-[#606770] dark:text-[#b0b3b8] text-[14px] leading-snug line-clamp-1">{data.facebookPreview.description || 'Missing description'}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm overflow-hidden">
                      <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Share2 className="w-4 h-4" /> Twitter Card Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="border border-border/50 rounded-xl overflow-hidden m-4 font-sans max-w-[500px]">
                          {data.twitterPreview.image ? (
                            <div className="w-full aspect-[1.91/1] bg-muted relative">
                              <img src={data.twitterPreview.image} alt="Twitter Card" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-full aspect-[1.91/1] bg-muted flex items-center justify-center border-b border-border/50 text-muted-foreground/50">
                              No Image
                            </div>
                          )}
                          <div className="p-3 bg-card">
                            <div className="text-muted-foreground text-[13px] mb-0.5 truncate">{data.twitterPreview.siteName || new URL(data.url).hostname}</div>
                            <div className="font-bold text-[15px] leading-tight mb-1 truncate">{data.twitterPreview.title || 'Missing Title'}</div>
                            <div className="text-muted-foreground text-[14px] leading-snug line-clamp-2">{data.twitterPreview.description || 'Missing description'}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Details */}
                <div className="lg:col-span-2">
                  <Card className="border-border/50 shadow-sm h-full">
                    <Tabs defaultValue="all" className="w-full">
                      <CardHeader className="bg-muted/20 border-b border-border/50 p-0 px-4 py-2">
                        <div className="flex items-center justify-between">
                          <TabsList className="bg-transparent h-auto p-0 border-none gap-4">
                            <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3">All Tags</TabsTrigger>
                            <TabsTrigger value="general" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3">General</TabsTrigger>
                            <TabsTrigger value="open-graph" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3">Open Graph</TabsTrigger>
                            <TabsTrigger value="twitter" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3">Twitter</TabsTrigger>
                            <TabsTrigger value="technical" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3">Technical</TabsTrigger>
                          </TabsList>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0">
                        <TabsContent value="all" className="m-0 border-none p-0 outline-none">
                          <TagTable tags={data.tags} />
                        </TabsContent>
                        <TabsContent value="general" className="m-0 border-none p-0 outline-none">
                          <TagTable tags={data.tags.filter(t => t.category === 'general')} />
                        </TabsContent>
                        <TabsContent value="open-graph" className="m-0 border-none p-0 outline-none">
                          <TagTable tags={data.tags.filter(t => t.category === 'open-graph')} />
                        </TabsContent>
                        <TabsContent value="twitter" className="m-0 border-none p-0 outline-none">
                          <TagTable tags={data.tags.filter(t => t.category === 'twitter')} />
                        </TabsContent>
                        <TabsContent value="technical" className="m-0 border-none p-0 outline-none">
                          <TagTable tags={data.tags.filter(t => t.category === 'technical')} />
                        </TabsContent>
                      </CardContent>
                    </Tabs>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function ScoreCard({ title, score, size = "default" }: { title: string, score: number, size?: "default" | "large" }) {
  const [currentScore, setCurrentScore] = useState(0);

  useEffect(() => {
    setCurrentScore(0);
    const timer = setTimeout(() => {
      setCurrentScore(score);
    }, 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 90) return "text-emerald-500";
    if (s >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  const getBgColor = (s: number) => {
    if (s >= 90) return "bg-emerald-500/10";
    if (s >= 50) return "bg-amber-500/10";
    return "bg-rose-500/10";
  };

  return (
    <Card className={`border-border/50 shadow-sm overflow-hidden relative ${size === 'large' ? 'col-span-2 md:col-span-1' : ''}`}>
      <CardContent className="p-6 flex flex-col items-center justify-center h-full">
        <div className="text-sm font-medium text-muted-foreground mb-2 text-center">{title}</div>
        <div className={`font-mono font-bold tracking-tighter ${getColor(score)} ${size === 'large' ? 'text-5xl' : 'text-3xl'}`}>
          {Math.round(currentScore)}
        </div>
      </CardContent>
      <div className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ease-out ${getBgColor(score)}`} style={{ width: `${currentScore}%` }} />
    </Card>
  );
}

function TagTable({ tags }: { tags: any[] }) {
  return (
    <div className="divide-y divide-border/50">
      {tags.map((tag, i) => (
        <div key={i} className="p-4 hover:bg-muted/10 transition-colors group">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <StatusIcon status={tag.status} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{tag.label}</span>
                <span className="text-xs font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">{tag.name}</span>
              </div>
              <div className="text-sm font-mono break-all mb-2 text-foreground/80 bg-card border border-border/40 p-2 rounded-md">
                {tag.value ? tag.value : <span className="text-muted-foreground/50 italic">Missing</span>}
              </div>
              <p className="text-sm text-muted-foreground">{tag.feedback}</p>
            </div>
          </div>
        </div>
      ))}
      {tags.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No tags found for this category.
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case 'warn':
      return <AlertCircle className="w-5 h-5 text-amber-500" />;
    case 'fail':
      return <AlertCircle className="w-5 h-5 text-rose-500" />;
    case 'info':
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
}
