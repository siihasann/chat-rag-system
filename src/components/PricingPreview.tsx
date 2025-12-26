import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for individuals getting started",
    features: [
      "5 documents per workspace",
      "100 AI chat messages/month",
      "1 workspace",
      "Email support"
    ]
  },
  {
    name: "Pro",
    price: "$29",
    description: "For professionals and small teams",
    features: [
      "Unlimited documents",
      "Unlimited AI chat messages",
      "5 workspaces",
      "Priority support",
      "Advanced analytics",
      "Custom AI models"
    ],
    popular: true
  },
  {
    name: "Business",
    price: "$99",
    description: "For growing organizations",
    features: [
      "Everything in Pro",
      "Unlimited workspaces",
      "Team collaboration tools",
      "SSO & advanced security",
      "Dedicated account manager",
      "Custom integrations"
    ]
  }
];

const PricingPreview = () => {
  return (
    <section className="py-24 bg-accent/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? 'border-primary border-2 shadow-xl scale-105' : 'border-2'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full mb-6" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  Get Started
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
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