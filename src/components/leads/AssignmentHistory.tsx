"use client";

import { AssignmentHistoryItem } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, getInitials } from "@/lib/utils";
import { UserCheck, ArrowRight } from "lucide-react";

interface AssignmentHistoryProps {
  history: AssignmentHistoryItem[];
}

const reasonColors: Record<string, string> = {
  manual: "bg-blue-100 text-blue-700",
  auto: "bg-green-100 text-green-700",
  reassigned: "bg-yellow-100 text-yellow-700",
};

export function AssignmentHistory({ history }: AssignmentHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Assignment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <UserCheck className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p>No assignment history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Assignment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.map((item, index) => {
            const assignedTo = typeof item.assignedTo === "object" 
              ? item.assignedTo 
              : { name: "Unknown", email: "" };
            const assignedBy = typeof item.assignedBy === "object" 
              ? item.assignedBy 
              : { name: "System", email: "" };

            return (
              <div
                key={item._id || index}
                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-950 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-white">
                    {getInitials(assignedTo.name || "U")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {assignedTo.name || "Unknown"}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${reasonColors[item.reason] || ""}`}
                    >
                      {item.reason}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Assigned by {assignedBy.name || "System"} •{" "}
                    {formatDateTime(item.assignedAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}