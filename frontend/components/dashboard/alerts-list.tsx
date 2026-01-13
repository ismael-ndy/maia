"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, User } from "lucide-react"
import type { Alert } from "./therapist-dashboard"
import { cn } from "@/lib/utils"

interface AlertsListProps {
  alerts: Alert[]
}

export function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No alerts</h3>
        <p className="text-muted-foreground max-w-sm">
          Safety alerts from Maia's monitoring will appear here. No alerts currently require your attention.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={cn(
            "border-l-4",
            alert.risk_level === "high"
              ? "border-l-destructive"
              : alert.risk_level === "medium"
                ? "border-l-amber-500"
                : "border-l-muted",
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{alert.patient_name}</span>
                  <Badge
                    variant={
                      alert.risk_level === "high"
                        ? "destructive"
                        : alert.risk_level === "medium"
                          ? "secondary"
                          : "outline"
                    }
                    className={cn(alert.risk_level === "medium" && "bg-amber-100 text-amber-800 border-amber-200")}
                  >
                    {alert.risk_level} risk
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.urgency}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" />
                <span>{new Date(alert.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <p className="text-xs text-muted-foreground text-center mt-6">
        Alerts are safety signals and do not contain raw chat content for privacy.
      </p>
    </div>
  )
}
