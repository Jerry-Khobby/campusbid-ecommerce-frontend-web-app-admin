"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotification } from "@/lib/notification-context";
import { ApiError } from "@/lib/api/client";
import {
  createCategory,
  deactivateCategory,
  fetchAdminCategories,
  updateCategory,
  type Category,
} from "@/lib/api/categories";

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

interface CategoryFormState {
  name: string;
  icon: string;
  sortOrder: string;
}

const EMPTY_FORM: CategoryFormState = { name: "", icon: "", sortOrder: "0" };

export default function AdminCategoriesPage() {
  const { addNotification } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateForm = () => {
    setEditingCategory(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEditForm = (category: Category) => {
    setEditingCategory(category);
    setForm({ name: category.name, icon: category.icon ?? "", sortOrder: String(category.sortOrder) });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setIsSubmitting(true);
    try {
      const input = {
        name: form.name.trim(),
        icon: form.icon.trim() || undefined,
        sortOrder: Number(form.sortOrder) || 0,
      };

      if (editingCategory) {
        const updated = await updateCategory(editingCategory.id, input);
        setCategories((current) => current.map((c) => (c.id === updated.id ? updated : c)));
        addNotification(`"${updated.name}" updated`, "success");
      } else {
        const created = await createCategory(input);
        setCategories((current) => [...current, created]);
        addNotification(`"${created.name}" created`, "success");
      }
      setIsFormOpen(false);
    } catch (error) {
      addNotification(getErrorMessage(error), "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    setPendingActionId(category.id);
    try {
      let updated: Category;
      if (category.isActive) {
        await deactivateCategory(category.id);
        updated = { ...category, isActive: false };
      } else {
        updated = await updateCategory(category.id, { isActive: true });
      }
      setCategories((current) => current.map((c) => (c.id === category.id ? updated : c)));
      addNotification(
        `"${category.name}" ${category.isActive ? "deactivated" : "reactivated"}`,
        "success"
      );
    } catch (error) {
      addNotification(getErrorMessage(error), "error");
    } finally {
      setPendingActionId(null);
    }
  };

  const activeCount = categories.filter((c) => c.isActive).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Manage the categories products and vendors are organized under</p>
        </div>
        <Button onClick={openCreateForm} className="bg-gradient-to-r from-purple-600 to-blue-600">
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
            <p className="text-sm text-gray-600">Active Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
            <p className="text-sm text-gray-600">Total Categories</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loadError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Couldn&apos;t load categories: {loadError}
            </div>
          )}

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sort Order</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      Loading categories...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {category.icon && <span className="text-lg">{category.icon}</span>}
                          <span className="font-medium text-sm text-gray-900">{category.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-900">{category.productCount}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-600">{category.sortOrder}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            category.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditForm(category)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant={category.isActive ? "destructive" : "default"}
                            disabled={pendingActionId === category.id}
                            onClick={() => handleToggleActive(category)}
                          >
                            {category.isActive ? "Deactivate" : "Reactivate"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {!isLoading && !loadError && categories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      No categories yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update this category's details." : "Create a new product category."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Food"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-icon">Icon (optional)</Label>
              <Input
                id="category-icon"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                placeholder="e.g. 🍔 or an icon URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-sort-order">Sort Order</Label>
              <Input
                id="category-sort-order"
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
