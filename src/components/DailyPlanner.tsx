import { useState, useRef } from "react";
import { Sparkles, Calendar, Clock, Loader2, Send, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-plan`;

export function DailyPlanner() {
  const [userInput, setUserInput] = useState("");
  const [plan, setPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const generatePlan = async () => {
    if (!userInput.trim()) {
      toast({
        title: "Please enter your tasks",
        description: "Tell me what you need to accomplish today",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setPlan("");

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ userInput }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate plan");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullPlan = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullPlan += content;
              setPlan(fullPlan);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      toast({
        title: "Plan generated!",
        description: "Your daily plan is ready",
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("Error generating plan:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate plan",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPlan = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setPlan("");
    setUserInput("");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Planning
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Plan Your Day with{" "}
              <span className="text-gradient">Intelligence</span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground">
              Tell me your tasks, goals, and priorities. I'll create a structured daily plan 
              tailored to maximize your productivity.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <Card className="relative overflow-hidden border-0 bg-card shadow-card">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-accent" />
            
            <div className="p-6 md:p-8">
              {/* Input Section */}
              <div className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">What's on your agenda?</h2>
                    <p className="text-sm text-muted-foreground">List your tasks, meetings, and goals</p>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Example:
- Team standup at 9 AM
- Finish project proposal
- Review design mockups
- Gym session
- Prepare presentation for Friday
- Call with client at 3 PM"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="min-h-[180px] resize-none border-muted bg-muted/30 font-mono text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:border-primary focus:ring-primary"
                  disabled={isLoading}
                />
                
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    onClick={generatePlan}
                    disabled={isLoading || !userInput.trim()}
                    className="group relative overflow-hidden bg-primary px-6 font-medium text-primary-foreground shadow-soft transition-all hover:shadow-glow"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        Generate My Plan
                      </>
                    )}
                  </Button>
                  
                  {(plan || userInput) && (
                    <Button
                      variant="outline"
                      onClick={resetPlan}
                      className="border-muted-foreground/20 hover:bg-muted"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Start Over
                    </Button>
                  )}
                </div>
              </div>

              {/* Output Section */}
              {(plan || isLoading) && (
                <div className="border-t border-border pt-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                      <Clock className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Your Daily Plan</h2>
                      <p className="text-sm text-muted-foreground">
                        {isLoading ? "Creating your optimized schedule..." : "Optimized for productivity"}
                      </p>
                    </div>
                    {isLoading && (
                      <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="animate-typing">●●●</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="rounded-xl border border-border/50 bg-muted/20 p-6">
                    {plan ? (
                      <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-ul:text-foreground">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {plan}
                        </pre>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <div className="h-2 w-48 overflow-hidden rounded-full bg-muted">
                          <div className="h-full w-1/2 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" style={{ backgroundSize: "200% 100%" }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Features */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "Smart Prioritization",
                description: "AI organizes tasks by importance and urgency",
              },
              {
                icon: Clock,
                title: "Time Optimization",
                description: "Suggested time blocks for maximum focus",
              },
              {
                icon: Calendar,
                title: "Balanced Schedule",
                description: "Includes breaks and buffer time",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-border/50 bg-card/50 p-6 transition-all hover:border-primary/20 hover:shadow-card"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
