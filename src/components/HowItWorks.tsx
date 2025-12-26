import { Upload, Brain, MessageCircle } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Documents",
    description: "Drag and drop your PDF, DOCX, or TXT files. We handle the rest automatically."
  },
  {
    icon: Brain,
    title: "AI Embedding",
    description: "Our AI processes and indexes your documents using advanced vector embeddings."
  },
  {
    icon: MessageCircle,
    title: "Start Chatting",
    description: "Ask questions, get insights, and understand your documents like never before."
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to unlock the power of your documents
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -z-10" />

            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center relative">
                  <div className="inline-flex h-20 w-20 rounded-full bg-primary items-center justify-center mb-6 relative z-10 border-4 border-background shadow-xl">
                    <Icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-primary/10 -z-10">
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;