import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle, ArrowRight, Stethoscope } from "lucide-react";

interface AnalysisResult {
  summary: string;
  possible_conditions: string[];
  severity: "low" | "medium" | "high";
  next_steps: string[];
}

interface ResultCardProps {
  result: AnalysisResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "low":
        return {
          color: "bg-success/10 text-success border-success/20",
          icon: CheckCircle2,
          label: "Low Severity",
          barColor: "bg-success",
          barWidth: "33%",
        };
      case "high":
        return {
          color: "bg-destructive/10 text-destructive border-destructive/20",
          icon: AlertCircle,
          label: "High Severity",
          barColor: "bg-destructive",
          barWidth: "100%",
        };
      default:
        return {
          color: "bg-warning/10 text-warning border-warning/20",
          icon: AlertTriangle,
          label: "Medium Severity",
          barColor: "bg-warning",
          barWidth: "66%",
        };
    }
  };

  const severityConfig = getSeverityConfig(result.severity);
  const SeverityIcon = severityConfig.icon;

  return (
    <div className="space-y-4 animate-scale-in">
      {/* Summary Card */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-card overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              Assessment Summary
            </CardTitle>
            <Badge variant="outline" className={severityConfig.color}>
              <SeverityIcon className="w-3 h-3 mr-1" />
              {severityConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">{result.summary}</p>
          
          {/* Severity Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Severity Level</span>
              <span className="capitalize">{result.severity}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full ${severityConfig.barColor} rounded-full transition-all duration-500`}
                style={{ width: severityConfig.barWidth }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Possible Conditions */}
      {result.possible_conditions.length > 0 && (
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Possible Causes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.possible_conditions.map((condition, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="px-3 py-1.5 text-sm font-medium bg-secondary/80"
                >
                  {condition}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {result.next_steps.length > 0 && (
        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-lg">Recommended Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.next_steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3 text-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ArrowRight className="w-3 h-3 text-primary" />
                  </div>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          ⚕️ This is not a medical diagnosis. Please consult a healthcare professional for proper evaluation.
        </p>
      </div>
    </div>
  );
}
