"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTopics } from "@/hooks/use-topics";
import { Check, Palette, Plus } from "lucide-react";
import { useState } from "react";

const TOPIC_COLORS = [
  "#8B5CF6", // violet-500
  "#06B6D4", // cyan-500
  "#3B82F6", // blue-500
  "#22C55E", // green-500
  "#EAB308", // yellow-500
  "#EC4899", // pink-500
  "#6B7280", // gray-500
  "#14B8A6", // teal-500
  "#A855F7", // purple-500
  "#10B981", // emerald-500
];

interface TopicSelectorProps {
  value?: string;
  onValueChange: (topicId: string) => void;
  required?: boolean;
}

export function TopicSelector({
  value,
  onValueChange,
  required = false,
}: TopicSelectorProps) {
  const { topics, loading, createTopic } = useTopics();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TOPIC_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;

    setIsCreating(true);
    try {
      const result = await createTopic({
        name: newTopicName.trim(),
        color: selectedColor,
      });

      if (result.success && result.topic) {
        onValueChange(result.topic.id);
        setIsCreateDialogOpen(false);
        setNewTopicName("");
        setSelectedColor(TOPIC_COLORS[0]);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const selectedTopic = topics.find((topic) => topic.id === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="topic" className="text-sm font-medium text-gray-200">
        Topic {required && <span className="text-red-400">*</span>}
      </Label>

      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange} disabled={loading}>
          <SelectTrigger className="flex-1 bg-slate-800 border-slate-600 text-white">
            <SelectValue
              placeholder={loading ? "Loading topics..." : "Select a topic"}
            >
              {selectedTopic && (
                <div className="flex items-center gap-2">
                  {selectedTopic.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedTopic.color }}
                    />
                  )}
                  {selectedTopic.name}
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            {topics.map((topic) => (
              <SelectItem
                key={topic.id}
                value={topic.id}
                className="text-white"
              >
                <div className="flex items-center gap-2">
                  {topic.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: topic.color }}
                    />
                  )}
                  {topic.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="border-slate-600 text-gray-300 hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-600 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Topic
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label
                  htmlFor="topicName"
                  className="text-sm font-medium text-gray-200"
                >
                  Topic Name
                </Label>
                <Input
                  id="topicName"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Enter topic name"
                  maxLength={50}
                  className="mt-1 bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-200 flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Color (optional)
                </Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {TOPIC_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? "border-white scale-110"
                          : "border-slate-600"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <Check className="h-4 w-4 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-slate-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateTopic}
                  disabled={!newTopicName.trim() || isCreating}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isCreating ? "Creating..." : "Create Topic"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
