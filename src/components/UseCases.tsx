import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, FileSearch, Landmark, Stethoscope } from "lucide-react";

const cases = [
  {
    icon: FileSearch,
    title: "Legal review",
    description: "Extract renewal clauses, risks, and obligations across contract libraries.",
    metric: "42% faster review cycles",
  },
  {
    icon: Landmark,
    title: "Finance diligence",
    description: "Summarize financial reports, flag anomalies, and cross-check footnotes.",
    metric: "18x faster reporting checks",
  },
  {
    icon: Stethoscope,
    title: "Healthcare compliance",
    description: "Audit policies and procedures with traceable citations and updates.",
    metric: "3x fewer policy misses",
  },
  {
    icon: Briefcase,
    title: "People operations",
    description: "Centralize HR policies and answer employee questions instantly.",
    metric: "65% fewer support tickets",
  },
];

const UseCases = () => {
  return (
    <section id="use-cases" className="py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12 space-y-4">
          <Badge className="mx-auto w-fit bg-primary/10 text-primary hover:bg-primary/20">Use cases</Badge>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold">
            Built for the teams that live in documents.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Whether you run audits, onboard teams, or review contracts, PaperChat AI keeps answers
            consistent and grounded.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {cases.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border border-border/80 bg-card/90">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="text-sm font-medium text-primary">{item.metric}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
