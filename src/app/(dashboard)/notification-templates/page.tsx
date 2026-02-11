"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationTemplatesApi } from "@/lib/api";
import { NotificationTemplate } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { TemplateModal } from "@/components/templates/TemplateModal";
import { TemplatesTable } from "@/components/templates/TemplatesTable";

export default function NotificationTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notification-templates", searchTerm],
    queryFn: async () => {
      const params = searchTerm ? { search: searchTerm } : {};
      const res = await notificationTemplatesApi.getAll(params);
      return res.data.data as NotificationTemplate[];
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      notificationTemplatesApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      toast.success("Template updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-blue-950">Notification Templates</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Template
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <TemplatesTable
        templates={data || []}
        isLoading={isLoading}
        onEdit={(t) => { setEditingTemplate(t); setModalOpen(true); }}
        onToggleActive={(id, isActive) => toggleActiveMutation.mutate({ id, isActive })}
      />

      <TemplateModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTemplate(null); }}
        template={editingTemplate}
      />
    </div>
  );
}