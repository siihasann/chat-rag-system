import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";

const CTA = () => {
  return (
    <section id="cta" className="py-24">
      <div className="container px-4 mx-auto">
        <div className="max-w-5xl mx-auto rounded-3xl border border-border/70 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 landing-grid opacity-20" />
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Enterprise-grade security
            </div>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold">
              Replace document chaos with clarity.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bring PaperChat AI to your team in minutes, with guided onboarding and zero setup cost.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-base group" asChild>
                <Link to="/auth">
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <a href="mailto:sales@paperchat.ai">Talk to sales</a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • Cancel anytime • Dedicated onboarding
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
