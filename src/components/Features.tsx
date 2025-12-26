import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, FileStack, MessageSquareText, ShieldCheck, Timer, Users } from "lucide-react";

const features = [
  {
    icon: FileStack,
    title: "Unified workspace",
    description: "Group contracts, reports, and policies into a single searchable space for every team."
  },
  {
    icon: MessageSquareText,
    title: "Conversational analysis",
    description: "Ask questions in natural language and get grounded, cited answers with full context."
  },
  {
    icon: Brain,
    title: "Auto summaries",
    description: "Instant briefs, highlights, and risks generated for each upload and updated continuously."
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description: "Granular permissions, audit trails, and encrypted storage keep sensitive data protected."
  },
  {
    icon: Users,
    title: "Team handoffs",
    description: "Share insights and saved prompts across legal, finance, HR, and operations."
  },
  {
    icon: Timer,
    title: "Minutes, not days",
    description: "Cut review cycles with instant extraction, tagged insights, and ready-to-share exports."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="container px-4 mx-auto">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
          <div className="space-y-6 animate-fade-right">
            <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20">Features</Badge>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold">
              Everything you need to move from files to decisions.
            </h2>
            <p className="text-lg text-muted-foreground">
              PaperChat AI gives teams a secure, structured way to understand documents, save insights,
              and keep everyone aligned.
            </p>
            <div className="rounded-2xl border border-border/80 bg-accent/40 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Key outcome</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                10x faster reviews with traceable sources.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 animate-fade-up animate-delay-200">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border border-border/80 bg-card/90 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
