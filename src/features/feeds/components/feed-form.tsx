"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, X } from "lucide-react";
import { useUrlValidation } from "../hooks/use-url-validation";
import { FeedValidation } from "./feed-validation";

interface FeedFormProps {
  onSubmit: (
    data: FeedFormData
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel?: () => void;
  initialData?: Partial<FeedFormData>;
  isSubmitting?: boolean;
  showCancel?: boolean;
}

export interface FeedFormData {
  name: string;
  url: string;
  description?: string;
  category?: string;
  source_type?: "rss" | "website" | "youtube" | "twitter" | "newsletter";
  isActive?: boolean;
}

export function FeedForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
  showCancel = false,
}: FeedFormProps) {
  const [formData, setFormData] = useState<FeedFormData>({
    name: initialData?.name || "",
    url: initialData?.url || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    source_type: initialData?.source_type || undefined,
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof FeedFormData, string>>
  >({});
  const { validateUrl, isValidating, lastResult } = useUrlValidation();

  // Auto-fill name and description when URL validation succeeds
  useEffect(() => {
    if (lastResult?.isValid && lastResult.preview) {
      setFormData((prev) => {
        const updates: Partial<FeedFormData> = {};

        // Auto-fill name if we have a title
        if (lastResult.preview?.title) {
          updates.name = lastResult.preview.title;
        }

        // Auto-fill description if we have a description
        if (
          lastResult.preview?.description &&
          lastResult.preview.description !== "No description available"
        ) {
          updates.description = lastResult.preview.description;
        }

        // Auto-detect source_type from validation result
        if (lastResult.type) {
          updates.source_type = lastResult.type;
        }

        return { ...prev, ...updates };
      });
    }
  }, [lastResult]);

  const handleUrlChange = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      url,
      // Clear auto-filled fields when URL changes
      name: "",
      description: "",
      source_type: undefined,
    }));

    // Clear previous URL errors
    if (errors.url) {
      setErrors((prev) => ({ ...prev, url: undefined }));
    }

    // Validate URL if it looks complete
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      validateUrl(url);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name }));

    // Clear name errors
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  const handleDescriptionChange = (description: string) => {
    setFormData((prev) => ({ ...prev, description }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleActiveToggle = (isActive: boolean) => {
    setFormData((prev) => ({ ...prev, isActive }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FeedFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.url.trim()) {
      newErrors.url = "URL é obrigatória";
    } else if (!formData.url.match(/^https?:\/\/.+/)) {
      newErrors.url = "URL deve começar com http:// ou https://";
    }

    // Check URL validation result
    if (lastResult && !lastResult.isValid) {
      newErrors.url = lastResult.error || "URL inválida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await onSubmit(formData);

    if (!result.success && result.error) {
      // Try to map API errors to form fields
      if (result.error.toLowerCase().includes("url")) {
        setErrors({ url: result.error });
      } else if (result.error.toLowerCase().includes("name")) {
        setErrors({ name: result.error });
      } else {
        // Generic error - could show in a toast
        setErrors({ url: result.error });
      }
    }
  };

  const isFormValid =
    formData.name.trim() &&
    formData.url.trim() &&
    (!lastResult || lastResult.isValid);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {initialData ? "Editar Feed" : "Adicionar Novo Feed"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Field */}
          <div className="space-y-2">
            <Label htmlFor="url">URL do Feed *</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com/feed.xml"
              value={formData.url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={errors.url ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.url && <p className="text-sm text-red-600">{errors.url}</p>}
          </div>

          {/* URL Validation Display */}
          {(formData.url || isValidating || lastResult) && (
            <FeedValidation
              validationResult={lastResult}
              isValidating={isValidating}
            />
          )}

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Feed *</Label>
            <Input
              id="name"
              placeholder="Digite um nome para o feed"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={errors.name ? "border-red-500" : ""}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Adicione uma descrição para este feed..."
              value={formData.description || ""}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria (opcional)</Label>
            <Input
              id="category"
              placeholder="Digite uma categoria para o feed"
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Active Toggle */}
          <div className="space-y-2">
            <Label htmlFor="isActive" className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleActiveToggle(e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4"
              />
              Feed Ativo
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            {showCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}

            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting || isValidating}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {initialData ? "Salvando..." : "Adicionando..."}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  {initialData ? "Salvar Alterações" : "Adicionar Feed"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
