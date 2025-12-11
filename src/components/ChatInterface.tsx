import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, Send, Loader2, ArrowLeft, Plus, User, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResultCard } from "./ResultCard";
import { VoiceInput } from "./VoiceInput";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  result?: {
    summary: string;
    possible_conditions: string[];
    severity: "low" | "medium" | "high";
    next_steps: string[];
  };
  timestamp: Date;
}

interface ChatInterfaceProps {
  onBack: () => void;
}

export function ChatInterface({ onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "assistant",
      content: "Hello! I'm SympSense, your caring health assistant. 💜\n\nTell me about the symptoms you're experiencing, and I'll help you understand them better. You can type or use the microphone button to speak.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const analyzeSymptoms = async (symptoms: string) => {
    if (!symptoms.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: symptoms,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-symptoms", {
        body: { symptoms },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Based on what you've shared, here's my analysis:",
        result: data,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "I couldn't analyze your symptoms. Please try again.",
        variant: "destructive",
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I'm sorry, I had trouble analyzing your symptoms. Could you please try describing them again?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    analyzeSymptoms(input);
  };

  const handleVoiceTranscript = (text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: "welcome-" + Date.now(),
        type: "assistant",
        content: "Hello! I'm SympSense, your caring health assistant. 💜\n\nTell me about the symptoms you're experiencing, and I'll help you understand them better. You can type or use the microphone button to speak.",
        timestamp: new Date(),
      },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="rounded-xl hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <Heart className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-foreground">SympSense</h1>
                <p className="text-xs text-muted-foreground">AI Health Assistant</p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            className="rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1" />
            New Chat
          </Button>
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-fade-up ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.type === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              
              <div className={`max-w-[85%] ${message.type === "user" ? "order-first" : ""}`}>
                {message.type === "user" ? (
                  <Card className="px-4 py-3 bg-primary text-primary-foreground rounded-2xl rounded-tr-md shadow-soft">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    <Card className="px-4 py-3 bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl rounded-tl-md shadow-card">
                      <p className="whitespace-pre-wrap text-foreground">{message.content}</p>
                    </Card>
                    {message.result && <ResultCard result={message.result} />}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              {message.type === "user" && (
                <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-secondary-foreground" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 animate-fade-up">
              <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <Card className="px-4 py-3 bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl rounded-tl-md">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-typing" style={{ animationDelay: "0s" }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-typing" style={{ animationDelay: "0.2s" }} />
                    <span className="w-2 h-2 bg-primary/60 rounded-full animate-typing" style={{ animationDelay: "0.4s" }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Analyzing symptoms...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background/80 backdrop-blur-md border-t border-border/50 px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your symptoms... (e.g., headache, fever, fatigue)"
                className="min-h-[56px] max-h-[200px] pr-12 rounded-2xl bg-card border-border/50 resize-none focus-visible:ring-primary"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <div className="absolute right-2 bottom-2">
                <VoiceInput onTranscript={handleVoiceTranscript} disabled={isLoading} />
              </div>
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-14 px-6 rounded-2xl bg-gradient-primary hover:opacity-90 shadow-soft transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Press Enter to send • Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
