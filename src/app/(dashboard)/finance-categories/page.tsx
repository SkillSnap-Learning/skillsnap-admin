"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { financeCategoriesApi } from "@/lib/api";
import { FinanceCategory } from "@/types";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");

function CategoryForm({
  initial,
  onSubmit,
  isSubmitting,
  onCancel,
}: {
  initial?: FinanceCategory | null;
  onSubmit: (data: { name: string; slug: string; description: string; order: number; isActive: boolean }) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const handleName = (val: string) => {
    setName(val);
    if (!initial) setSlug(generateSlug(val));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Name *</Label>
          <Input value={name} onChange={e => handleName(e.target.value)} placeholder="Investing" />
        </div>
        <div className="space-y-1.5">
          <Label>Slug *</Label>
          <Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="investing" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Description</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Articles about investing" />
        </div>
        <div className="space-y-1.5">
          <Label>Order</Label>
          <Input type="number" value={order} onChange={e => setOrder(parseInt(e.target.value) || 0)} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="accent-blue-950 w-4 h-4" />
          <Label className="cursor-pointer">Active</Label>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
        <Button
          onClick={() => onSubmit({ name, slug, description, order, isActive })}
          disabled={isSubmitting || !name || !slug}
          className="bg-blue-950 hover:bg-blue-900 text-white"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          {initial ? "Update" : "Create"}
        </Button>
      </div>
    </div>
  );
}

export default function FinanceCategoriesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FinanceCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinanceCategory | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["finance-categories"],
    queryFn: async () => {
      const res = await financeCategoriesApi.getAll({ includeInactive: true });
      return res.data.data as FinanceCategory[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: any) => financeCategoriesApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-categories"] });
      setFormOpen(false);
      toast.success("Category created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: (d: any) => financeCategoriesApi.update(editing!._id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-categories"] });
      setEditing(null);
      toast.success("Category updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeCategoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-categories"] });
      setDeleteTarget(null);
      toast.success("Category deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Header title="Finance Categories" description="Manage categories for finance articles" />
      <div className="p-6 space-y-6">

        {/* New category form */}
        {formOpen && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">New Category</h3>
            <CategoryForm
              onSubmit={d => createMutation.mutate(d)}
              isSubmitting={createMutation.isPending}
              onCancel={() => setFormOpen(false)}
            />
          </div>
        )}

        {/* Edit form */}
        {editing && (
          <div className="bg-white rounded-xl border border-blue-200 p-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Edit Category</h3>
            <CategoryForm
              initial={editing}
              onSubmit={d => updateMutation.mutate(d)}
              isSubmitting={updateMutation.isPending}
              onCancel={() => setEditing(null)}
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">All Categories</h2>
            {!formOpen && !editing && (
              <Button onClick={() => setFormOpen(true)} className="bg-blue-950 hover:bg-blue-900 text-white" size="sm">
                <Plus className="h-4 w-4 mr-1" /> New Category
              </Button>
            )}
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Name</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Slug</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Order</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Status</th>
                <th className="text-right px-4 py-3 text-slate-500 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No categories yet</td></tr>
              ) : data.map(cat => (
                <tr key={cat._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{cat.slug}</td>
                  <td className="px-4 py-3 text-slate-500">{cat.order}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cat.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditing(cat); setFormOpen(false); }} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(cat)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
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
        open={!!deleteTarget}
        onOpenChange={open => { if (!open) setDeleteTarget(null); }}
        title="Delete Category"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget._id); }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}