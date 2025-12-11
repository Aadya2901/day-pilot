import { Button } from "@/components/ui/button";
import { Heart, Shield, Sparkles, ArrowRight } from "lucide-react";

interface LandingHeroProps {
  onStartChat: () => void;
}

export function LandingHero({ onStartChat }: LandingHeroProps) {
  return (
    <div className="min-h-screen bg-gradient-soft flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">SympSense</span>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/80 text-secondary-foreground text-sm font-medium mb-8 animate-fade-up">
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Powered Health Insights
          </div>

          {/* Main Heading */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            AI Symptom Analysis
            <span className="block text-gradient mt-2">Gentle, Insightful & Caring</span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Get structured health insights quickly. Describe your symptoms and receive helpful guidance — not a medical diagnosis, but a caring first step.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button
              onClick={onStartChat}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-2xl shadow-soft hover:shadow-glow transition-all duration-300 group"
            >
              Start Analyzing Symptoms
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-col items-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">Private & Secure</h3>
              <p className="text-sm text-muted-foreground text-center">Your health data stays confidential</p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-3">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">Empathetic AI</h3>
              <p className="text-sm text-muted-foreground text-center">Caring responses, not cold analysis</p>
            </div>

            <div className="flex flex-col items-center p-6 rounded-2xl bg-card/50 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">Instant Insights</h3>
              <p className="text-sm text-muted-foreground text-center">Get guidance in seconds</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Disclaimer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-sm text-muted-foreground">
          ⚕️ SympSense is not a substitute for professional medical advice, diagnosis, or treatment.
        </p>
      </footer>
    </div>
  );
}
