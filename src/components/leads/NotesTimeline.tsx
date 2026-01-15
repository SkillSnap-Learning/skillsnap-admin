"use client";

import { useState } from "react";
import { LeadNote } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, getInitials } from "@/lib/utils";
import { MessageSquare, Plus, Loader2 } from "lucide-react";

interface NotesTimelineProps {
  notes: LeadNote[];
  onAddNote: (content: string) => Promise<void>;
  isAdding?: boolean;
}

export function NotesTimeline({ notes, onAddNote, isAdding }: NotesTimelineProps) {
  const [newNote, setNewNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async () => {
    if (!newNote.trim()) return;
    await onAddNote(newNote.trim());
    setNewNote("");
    setShowForm(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notes
        </CardTitle>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        {showForm && (
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
            <Textarea
              placeholder="Write a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {newNote.length}/500 characters
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowForm(false);
                    setNewNote("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!newNote.trim() || isAdding}
                  className="bg-blue-950 hover:bg-blue-900"
                >
                  {isAdding && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  Save Note
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Notes Timeline */}
        {notes.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p>No notes yet</p>
            <p className="text-sm text-slate-400">Add a note to track progress</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

            <div className="space-y-4">
              {notes.map((note, index) => {
                const author = typeof note.createdBy === "object" 
                  ? note.createdBy 
                  : { name: "System", email: "" };
                
                return (
                  <div key={note._id || index} className="relative pl-10">
                    {/* Timeline dot */}
                    <div className="absolute left-2.5 top-1 w-3 h-3 bg-blue-950 rounded-full border-2 border-white" />
                    
                    <div className="bg-white border rounded-lg p-4">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-slate-600">
                            {getInitials(author.name || "S")}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {author.name || "System"}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400">
                          {formatDateTime(note.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}