"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";
import { RefreshCw, Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { leadsApi } from "@/lib/api";
import { useState } from "react";

interface QuickActionsProps {
  onAutoAssignComplete?: () => void;
}

export function QuickActions({ onAutoAssignComplete }: QuickActionsProps) {
  const { canAssignLeads, canExportLeads } = useAuthStore();
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleAutoAssign = async () => {
    setIsAutoAssigning(true);
    try {
      const response = await leadsApi.autoAssign();
      const { assigned, message } = response.data.data;
      toast.success(message || `${assigned} leads auto-assigned`);
      onAutoAssignComplete?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Auto-assign failed";
      toast.error(message);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await leadsApi.export();
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `leads_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Leads exported successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export failed";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {canAssignLeads() && (
        <Button
          onClick={handleAutoAssign}
          disabled={isAutoAssigning}
          className="bg-blue-950 hover:bg-blue-900"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isAutoAssigning ? "animate-spin" : ""}`} />
          Auto-Assign Leads
        </Button>
      )}

      {canExportLeads() && (
        <Button
          onClick={handleExport}
          disabled={isExporting}
          variant="outline"
        >
          <Download className={`mr-2 h-4 w-4 ${isExporting ? "animate-bounce" : ""}`} />
          Export CSV
        </Button>
      )}
    </div>
  );
}