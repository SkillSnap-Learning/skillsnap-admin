"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { calculatorsApi } from "@/lib/api";
import { Calculator } from "@/types";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, ExternalLink } from "lucide-react";

export default function CalculatorsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Calculator | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const params: Record<string, unknown> = {};
  if (search) params.search = search;
  if (typeFilter !== "all") params.type = typeFilter;
  if (statusFilter !== "all") params.isActive = statusFilter === "active";

  const { data, isLoading } = useQuery({
    queryKey: ["calculators", params],
    queryFn: async () => {
      const res = await calculatorsApi.getAll(params);
      return res.data.data as Calculator[];
    },
  });

  const calculators = data ?? [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calculatorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calculators"] });
      setDeleteOpen(false);
      setSelected(null);
      toast.success("Calculator deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const TYPES = ["sip","emi","tax","education","term","ppf","rd","fd","nps","other"];

  return (
    <div>
      <Header title="Calculators" description="Manage finance calculators" />

      <div className="p-6 space-y-6">
        {/* Filters row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search calculators..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => router.push("/calculators/new")}
            className="bg-blue-950 hover:bg-blue-900 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Calculator
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Heading</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Slug</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Type</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Variant</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-slate-500 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : calculators.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No calculators found</td></tr>
              ) : calculators.map(calc => (
                <tr key={calc._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{calc.heading}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{calc.slug}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold uppercase">
                      {calc.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {calc.variant || <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      calc.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {calc.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`http://localhost:3000/calculators/${calc.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded"
                        title="Preview"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        onClick={() => router.push(`/calculators/${calc._id}/edit`)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setSelected(calc); setDeleteOpen(true); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Calculator"
        description={`Are you sure you want to delete "${selected?.heading}"? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => { if (selected) deleteMutation.mutate(selected._id); }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}