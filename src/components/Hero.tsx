import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FileText, MessageSquareText, ShieldCheck } from "lucide-react";

const quickFacts = [
  { label: "SOC 2-ready", icon: ShieldCheck },
  { label: "50+ formats", icon: FileText },
  { label: "Live answers", icon: MessageSquareText },
];

const Hero = () => {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute inset-0 landing-aurora" />
      <div className="absolute inset-0 landing-grid opacity-30" />
      <div className="container relative z-10 px-4 py-16 md:py-20">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div className="space-y-6 animate-fade-up">
            <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20">
              Document intelligence for teams
            </Badge>
            <h1 className="text-4xl md:text-6xl font-serif font-semibold tracking-tight">
              Turn documents into a living knowledge base.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              PaperChat AI indexes contracts, reports, and policies so your team can ask
              questions in natural language and get precise, sourced answers in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-base" asChild>
                <Link to="/auth">
                  Get started free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <a href="#workflow">View product tour</a>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              {quickFacts.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative animate-fade-left">
            <Card className="border-2 shadow-xl bg-card/95">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
                    <h3 className="text-xl font-semibold">Q4 Strategy Pack</h3>
                  </div>
                  <Badge variant="secondary">Synced</Badge>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border border-border/80 p-3 bg-background">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Board Report.pdf</p>
                        <p className="text-xs text-muted-foreground">32 pages indexed</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </div>
                  <div className="rounded-lg border border-border/80 p-4 bg-background">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">AI Summary</p>
                    <p className="mt-2 text-sm text-foreground">
                      Revenue is up 18% QoQ, with churn reduced by 6%. Key risks: enterprise renewals in EMEA.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-border/80 p-4 bg-background">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Ask PaperChat</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    “Summarize contract renewal risks across all Q4 docs.”
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="absolute -bottom-10 right-6 w-[78%] border-2 shadow-lg bg-primary text-primary-foreground animate-float hidden sm:block">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Instant answer</p>
                <p className="mt-2 text-sm">
                  Three contracts in EMEA renew within 45 days. Two include price escalators above 8%.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
