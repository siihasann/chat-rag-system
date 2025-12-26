import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, MessageCircle, UploadCloud } from "lucide-react";

const steps = [
  {
    icon: UploadCloud,
    title: "Ingest your files",
    description: "Drop PDFs, DOCX, or TXT files. PaperChat handles OCR and indexing automatically."
  },
  {
    icon: Brain,
    title: "Map the knowledge",
    description: "We extract entities, key clauses, and summaries to create a structured knowledge graph."
  },
  {
    icon: MessageCircle,
    title: "Ask and act",
    description: "Ask questions, pull citations, and share exports across your team instantly."
  }
];

const HowItWorks = () => {
  return (
    <section id="workflow" className="py-24 bg-accent/30">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col lg:flex-row items-start gap-10">
          <div className="max-w-xl space-y-6 animate-fade-right">
            <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20">Workflow</Badge>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold">
              A clean workflow built for repeatable analysis.
            </h2>
            <p className="text-lg text-muted-foreground">
              Every upload is tracked, summarized, and ready for collaboration. Your team gets clarity
              without chasing files or revisions.
            </p>
          </div>

          <div className="flex-1 space-y-6 relative animate-fade-up animate-delay-200">
            <div className="absolute left-6 top-6 bottom-6 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent hidden sm:block" />
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="border border-border/80 bg-card/90">
                  <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-mono text-muted-foreground">0{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{step.description}</p>
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

export default HowItWorks;
