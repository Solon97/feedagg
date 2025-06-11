"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Rss } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { useFeeds } from "../hooks/use-feeds";
import { FeedForm, type FeedFormData } from "./feed-form";
import { FeedCard } from "./feed-card";
import { FeedStats } from "./feed-stats";

export function FeedsPageContent() {
  const {
    feeds,
    isLoading,
    error,
    filters,
    updateFilters,
    createFeed,
    updateFeed,
    deleteFeed,
    toggleFeed,
    refreshFeeds,
  } = useFeeds();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingFeed, setEditingFeed] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper functions moved to FeedCard component for better separation of concerns

  const handleCreateFeed = async (data: FeedFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createFeed(data);
      if (result.success) {
        setShowAddDialog(false);
      }
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFeed = async (data: FeedFormData) => {
    if (!editingFeed) return { success: false, error: "No feed selected" };

    setIsSubmitting(true);
    try {
      const result = await updateFeed(editingFeed.id, {
        name: data.name,
        url: data.url,
        description: data.description,
        category: data.category,
        isActive: data.isActive,
      });
      if (result.success) {
        setEditingFeed(null);
      }
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeed = async (id: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir este feed?"
    );
    if (!confirmed) return;

    await deleteFeed(id);
  };

  const handleToggleFeed = async (id: string) => {
    await toggleFeed(id);
  };

  const handleEditFeed = (feed: any) => {
    setEditingFeed(feed);
  };

  const handleRefreshFeed = async (feedId: string) => {
    await refreshFeeds();
  };

  const activeFeeds = feeds.filter((f) => f.isActive);
  const totalItems = feeds.reduce(
    (sum, f) => sum + (f.lastFetchedAt ? 1 : 0),
    0
  ); // Simplified

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="px-4 md:px-6 py-4 md:py-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Feeds
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage your RSS feeds and YouTube channels
          </p>
        </div>

        {/* Actions */}
        <div className="mb-6">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feed
          </Button>
        </div>

        {/* Statistics Cards */}
        <FeedStats
          totalFeeds={feeds.length}
          activeFeeds={activeFeeds.length}
          totalItems={totalItems}
        />

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Erro: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Feeds List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Your Feeds
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-3 sm:space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : feeds.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12 px-4 sm:px-6">
                <Rss className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                  No feeds yet
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Get started by adding your first RSS feed or YouTube channel
                </p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Feed
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {feeds.map((feed) => (
                <FeedCard
                  key={feed.id}
                  feed={feed}
                  onEdit={handleEditFeed}
                  onDelete={handleDeleteFeed}
                  onRefresh={handleRefreshFeed}
                  onToggle={handleToggleFeed}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Feed Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingFeed ? "Edit Feed" : "Add New Feed"}
              </DialogTitle>
            </DialogHeader>
            <FeedForm
              onSubmit={handleCreateFeed}
              onCancel={() => setShowAddDialog(false)}
              isSubmitting={isSubmitting}
              showCancel={true}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Feed Dialog */}
        <Dialog open={!!editingFeed} onOpenChange={() => setEditingFeed(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Feed</DialogTitle>
            </DialogHeader>
            {editingFeed && (
              <FeedForm
                onSubmit={handleUpdateFeed}
                onCancel={() => setEditingFeed(null)}
                initialData={{
                  name: editingFeed.name,
                  url: editingFeed.url,
                  description: editingFeed.description,
                  category: editingFeed.category || "",
                  isActive: editingFeed.isActive ?? true,
                }}
                isSubmitting={isSubmitting}
                showCancel={true}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
