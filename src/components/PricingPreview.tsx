import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For solo researchers and early pilots",
    features: [
      "5 documents per workspace",
      "100 AI chat messages",
      "1 workspace",
      "Email support"
    ]
  },
  {
    name: "Pro",
    price: "$29",
    description: "Built for teams that review weekly",
    features: [
      "Unlimited documents",
      "Unlimited AI chat messages",
      "5 workspaces",
      "Priority support",
      "Advanced analytics"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "$99",
    description: "Governance and compliance at scale",
    features: [
      "Everything in Pro",
      "Unlimited workspaces",
      "SSO & advanced security",
      "Dedicated success manager",
      "Custom integrations"
    ]
  }
];

const PricingPreview = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16 space-y-4">
          <Badge className="mx-auto w-fit bg-primary/10 text-primary hover:bg-primary/20">Pricing</Badge>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold">
            Transparent pricing that scales with you.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when your workflows expand, and keep full control of your data.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border border-border/80 ${plan.popular ? "shadow-xl bg-primary text-primary-foreground" : "bg-card/90"}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-background text-foreground shadow">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Most chosen
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  <span className={`${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>/month</span>
                </div>
                <p className={`text-sm mt-2 ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full mb-6"
                  variant={plan.popular ? "secondary" : "outline"}
                >
                  Get started
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`h-5 w-5 shrink-0 mt-0.5 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                      <span className={`text-sm ${plan.popular ? "text-primary-foreground/80" : ""}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingPreview;
