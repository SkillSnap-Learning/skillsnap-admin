"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { categoriesApi } from "@/lib/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  isActive: boolean;
}

const generateSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

/* ── Inline form for create / edit ── */
function CategoryForm({
  initial,
  onSubmit,
  isSubmitting,
  onCancel,
}: {
  initial?: Category | null;
  onSubmit: (data: Partial<Category>) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [order, setOrder] = useState(initial?.order?.toString() ?? "0");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initial) setSlug(generateSlug(val));
  };

  const handleSubmit = async () => {
    if (!name || !slug) {
      toast.error("Name and slug are required");
      return;
    }
    await onSubmit({
      name,
      slug,
      description,
      order: parseInt(order) || 0,
      isActive,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        {initial ? "Edit Category" : "New Category"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Name *</Label>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. CBSE"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Slug *</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="e.g. cbse"
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Description</Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Display Order</Label>
          <Input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-blue-950 w-4 h-4"
            />
            <span className="text-sm text-slate-700">Active</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-950 hover:bg-blue-900"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          {initial ? "Update Category" : "Create Category"}
        </Button>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await categoriesApi.getAll({ includeInactive: true });
      return res.data.data as Category[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Category>) => categoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowForm(false);
      toast.success("Category created");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      categoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
      toast.success("Category updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeletingCategory(null);
      toast.success("Category deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Header title="Categories" description="Manage blog categories" />

      <div className="p-6 space-y-6">

        {/* New Category button — hide when a form is open */}
        {!showForm && !editingCategory && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-950 hover:bg-blue-900"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        )}

        {/* Create form */}
        {showForm && (
          <CategoryForm
            onSubmit={async (data) => {
              await createMutation.mutateAsync(data);
            }}
            isSubmitting={createMutation.isPending}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Edit form */}
        {editingCategory && (
          <CategoryForm
            initial={editingCategory}
            onSubmit={async (data) => {
              await updateMutation.mutateAsync({
                id: editingCategory._id,
                data,
              });
            }}
            isSubmitting={updateMutation.isPending}
            onCancel={() => setEditingCategory(null)}
          />
        )}

        {/* Table */}
        {isLoading ? (
          <p className="text-slate-500 text-sm">Loading categories...</p>
        ) : categories.length === 0 ? (
          <div className="rounded-lg border border-slate-200 p-8 text-center text-slate-500 text-sm">
            No categories yet. Create one to get started.
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-600 font-medium">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-slate-600 font-medium">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-slate-600 font-medium">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-slate-600 font-medium">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-slate-600 font-medium">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-slate-600 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{cat.order}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {cat.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">
                      {cat.description || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cat.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(cat);
                            setShowForm(false);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeletingCategory(cat)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null);
        }}
        title="Delete Category"
        description={`Are you sure you want to delete "${deletingCategory?.name}"? Blogs assigned to this category will lose their category reference.`}
        confirmText="Delete"
        onConfirm={() => {
          if (deletingCategory) deleteMutation.mutate(deletingCategory._id);
        }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}