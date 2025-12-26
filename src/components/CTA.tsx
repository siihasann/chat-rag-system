import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-12 text-center border-2 border-primary/20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform How You Work with Documents?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who are already using PaperChat AI to understand files faster and work smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 group">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTA;