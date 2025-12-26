import { Card, CardContent } from "@/components/ui/card";
import { FileText, MessageSquare, FolderOpen, Shield, Zap, Users } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Document Upload",
    description: "Upload PDF, DOCX, TXT files. Automatic text extraction and AI embedding for instant searchability."
  },
  {
    icon: MessageSquare,
    title: "Interactive AI Chat",
    description: "Ask questions, get summaries, extract insights. Conversational interface with context-aware responses."
  },
  {
    icon: FolderOpen,
    title: "Multi-File Knowledge",
    description: "Combine multiple documents into one workspace. Query across all files for comprehensive analysis."
  },
  {
    icon: Shield,
    title: "Role-Based Access",
    description: "Control permissions with Owner, Member, and Viewer roles. Secure collaboration for teams."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Powered by advanced vector search and AI models. Get answers in seconds, not hours."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Invite team members, share workspaces, and collaborate on document analysis in real-time."
  }
];

const Features = () => {
  return (
    <section className="py-24 bg-accent/30">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to understand and analyze documents with AI
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;