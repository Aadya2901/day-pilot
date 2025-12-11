import { useState } from "react";
import { LandingHero } from "@/components/LandingHero";
import { ChatInterface } from "@/components/ChatInterface";

type View = "landing" | "chat";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("landing");

  return (
    <>
      {currentView === "landing" ? (
        <LandingHero onStartChat={() => setCurrentView("chat")} />
      ) : (
        <ChatInterface onBack={() => setCurrentView("landing")} />
      )}
    </>
  );
};

export default Index;
