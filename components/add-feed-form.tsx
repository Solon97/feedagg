"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, CheckCircle } from "lucide-react";
import { TopicSelector } from "@/components/topic-selector";
import { useFeeds } from "@/hooks/use-feeds";

interface AddFeedFormProps {
  onSuccess?: () => void;
}

export function AddFeedForm({ onSuccess }: AddFeedFormProps) {
  const [url, setUrl] = useState("");
  const [topicId, setTopicId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { subscribeFeed } = useFeeds();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim() || !topicId) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await subscribeFeed(url.trim(), topicId);

      if (result.success) {
        setSuccess(true);
        setUrl("");
        setTopicId("");
        onSuccess?.();

        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Failed to subscribe to feed");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Feed
        </CardTitle>
        <CardDescription className="text-gray-400">
          Subscribe to RSS feeds or YouTube channels by providing their URL and
          selecting a topic
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="url" className="text-sm font-medium text-gray-200">
              Feed URL <span className="text-red-400">*</span>
            </Label>
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/feed.xml or https://youtube.com/channel/..."
              className="mt-1 bg-slate-700 border-slate-600 text-white placeholder-gray-400"
              disabled={isSubmitting}
            />
          </div>

          <TopicSelector value={topicId} onValueChange={setTopicId} required />

          {error && (
            <Alert className="border-red-600 bg-red-900/20">
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-600 bg-green-900/20">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-400 ml-2">
                Feed subscribed successfully!
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || !url.trim() || !topicId}
            className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Subscribe to Feed
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
