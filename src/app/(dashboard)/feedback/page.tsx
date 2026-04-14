"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/stores/authStore";
import { feedbackApi } from "@/lib/api";
import {
  SalesFeedback,
  OtherFeedback,
  SalesFeedbackResponse,
  OtherFeedbackResponse,
} from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { CheckCircle2, AlertCircle, Clock, Send, ChevronDown, ChevronUp } from "lucide-react";

// ─────────────────────────────────────────
// SALES FEEDBACK FORM (sales only)
// ─────────────────────────────────────────

function SalesFeedbackForm() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    reasonsInterested: "",
    reasonsNotInterested: "",
    followUpColdReasons: "",
    conversionSuggestions: "",
  });

  // Check if today's feedback already submitted
  const { data: todayData, isLoading: todayLoading } = useQuery({
    queryKey: ["todayFeedbackStatus"],
    queryFn: async () => {
      const response = await feedbackApi.getTodayStatus();
      return response.data.data;
    },
  });

  // Pre-fill form if already submitted today
  useState(() => {
    if (todayData?.feedback) {
      setForm({
        reasonsInterested: todayData.feedback.reasonsInterested,
        reasonsNotInterested: todayData.feedback.reasonsNotInterested,
        followUpColdReasons: todayData.feedback.followUpColdReasons,
        conversionSuggestions: todayData.feedback.conversionSuggestions,
      });
    }
  });

  const submitMutation = useMutation({
    mutationFn: () => feedbackApi.submitSalesFeedback(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todayFeedbackStatus"] });
      queryClient.invalidateQueries({ queryKey: ["mySalesFeedback"] });
      queryClient.invalidateQueries({ queryKey: ["salesDashboardStats"] });
      toast.success(
        todayData?.submitted ? "Feedback updated successfully" : "Feedback submitted successfully"
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    if (
      !form.reasonsInterested.trim() ||
      !form.reasonsNotInterested.trim() ||
      !form.followUpColdReasons.trim() ||
      !form.conversionSuggestions.trim()
    ) {
      toast.error("All four fields are required");
      return;
    }
    submitMutation.mutate();
  };

  if (todayLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status banner */}
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border ${
          todayData?.submitted
            ? "bg-green-50 border-green-200"
            : "bg-orange-50 border-orange-200"
        }`}
      >
        {todayData?.submitted ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
        )}
        <p
          className={`text-sm font-medium ${
            todayData?.submitted ? "text-green-700" : "text-orange-700"
          }`}
        >
          {todayData?.submitted
            ? "Today's feedback submitted. You can still update it."
            : "You haven't submitted today's feedback yet."}
        </p>
      </div>

      {/* Form fields */}
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Reasons Why Customers Are Showing Interest
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Textarea
            placeholder="What reasons did customers give for showing interest today?"
            value={form.reasonsInterested}
            onChange={(e) =>
              setForm({ ...form, reasonsInterested: e.target.value })
            }
            rows={3}
            maxLength={2000}
            className="resize-none"
          />
          <p className="text-xs text-slate-400 text-right">
            {form.reasonsInterested.length}/2000
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Why Customers Are Not Showing Interest
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Textarea
            placeholder="What objections or reasons did customers give for not being interested?"
            value={form.reasonsNotInterested}
            onChange={(e) =>
              setForm({ ...form, reasonsNotInterested: e.target.value })
            }
            rows={3}
            maxLength={2000}
            className="resize-none"
          />
          <p className="text-xs text-slate-400 text-right">
            {form.reasonsNotInterested.length}/2000
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Why Follow Ups Are Turning Into Cold Leads
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Textarea
            placeholder="What patterns are you noticing with follow-ups going cold?"
            value={form.followUpColdReasons}
            onChange={(e) =>
              setForm({ ...form, followUpColdReasons: e.target.value })
            }
            rows={3}
            maxLength={2000}
            className="resize-none"
          />
          <p className="text-xs text-slate-400 text-right">
            {form.followUpColdReasons.length}/2000
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Suggestions to Make More Conversions
            <span className="text-red-500 ml-1">*</span>
          </label>
          <Textarea
            placeholder="What changes or strategies do you think could improve conversions?"
            value={form.conversionSuggestions}
            onChange={(e) =>
              setForm({ ...form, conversionSuggestions: e.target.value })
            }
            rows={3}
            maxLength={2000}
            className="resize-none"
          />
          <p className="text-xs text-slate-400 text-right">
            {form.conversionSuggestions.length}/2000
          </p>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={submitMutation.isPending}
        className="bg-blue-950 hover:bg-blue-900"
      >
        <Send className="h-4 w-4 mr-2" />
        {submitMutation.isPending
          ? "Saving..."
          : todayData?.submitted
          ? "Update Today's Feedback"
          : "Submit Today's Feedback"}
      </Button>

      {/* History */}
      <SalesFeedbackHistory />
    </div>
  );
}

function SalesFeedbackHistory() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: feedbacks, isLoading } = useQuery({
    queryKey: ["mySalesFeedback"],
    queryFn: async () => {
      const response = await feedbackApi.getMySalesFeedback();
      return response.data.data as SalesFeedback[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3 mt-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!feedbacks?.length) return null;

  return (
    <div className="space-y-3 mt-2">
      <h3 className="text-sm font-semibold text-slate-700">
        Last 30 Days History
      </h3>
      {feedbacks.map((item) => (
        <div key={item.id} className="border rounded-lg overflow-hidden">
          <button
            onClick={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <span className="text-sm font-medium text-slate-700">
              {format(new Date(item.date), "dd MMM yyyy")}
            </span>
            {expandedId === item.id ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {expandedId === item.id && (
            <div className="px-4 py-4 space-y-4 bg-white">
              {[
                {
                  label: "Reasons Customers Showed Interest",
                  value: item.reasonsInterested,
                },
                {
                  label: "Reasons Customers Not Interested",
                  value: item.reasonsNotInterested,
                },
                {
                  label: "Why Follow Ups Went Cold",
                  value: item.followUpColdReasons,
                },
                {
                  label: "Suggestions for More Conversions",
                  value: item.conversionSuggestions,
                },
              ].map((field) => (
                <div key={field.label} className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {field.label}
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// OTHER FEEDBACK (sales only)
// ─────────────────────────────────────────

function OtherFeedbackPanel() {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");

  const { data: myIssues, isLoading } = useQuery({
    queryKey: ["myOtherFeedback"],
    queryFn: async () => {
      const response = await feedbackApi.getMyOtherFeedback();
      return response.data.data as OtherFeedback[];
    },
  });

  const submitMutation = useMutation({
    mutationFn: () => feedbackApi.submitOtherFeedback(message),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["myOtherFeedback"] });
      queryClient.invalidateQueries({ queryKey: ["salesDashboardStats"] });
      toast.success("Issue submitted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div className="space-y-6">
      {/* Submit new issue */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">
          Describe your issue or concern
        </label>
        <Textarea
          placeholder="Write anything you want to raise with the admin..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={2000}
          className="resize-none"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">{message.length}/2000</p>
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="bg-blue-950 hover:bg-blue-900"
          >
            <Send className="h-4 w-4 mr-2" />
            {submitMutation.isPending ? "Submitting..." : "Submit Issue"}
          </Button>
        </div>
      </div>

      {/* My issues list */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">My Issues</h3>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !myIssues?.length ? (
          <p className="text-sm text-slate-400">No issues submitted yet.</p>
        ) : (
          myIssues.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm text-slate-700">{item.message}</p>
                <Badge
                  className={
                    item.status === "resolved"
                      ? "bg-green-100 text-green-700 shrink-0"
                      : "bg-yellow-100 text-yellow-700 shrink-0"
                  }
                >
                  {item.status === "resolved" ? "Replied" : "Pending"}
                </Badge>
              </div>

              <p className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </p>

              {item.reply && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1">
                  <p className="text-xs font-semibold text-blue-700">
                    Reply from {item.repliedBy?.name || "Admin"}
                  </p>
                  <p className="text-sm text-slate-700">{item.reply}</p>
                  {item.repliedAt && (
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(item.repliedAt), {
                        addSuffix: true,
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// ADMIN VIEW — SALES FEEDBACK
// ─────────────────────────────────────────

function AdminSalesFeedbackView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["allSalesFeedback"],
    queryFn: async () => {
      const response = await feedbackApi.getAllSalesFeedback();
      return response.data.data as SalesFeedbackResponse;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.feedbacks?.length) {
    return (
      <p className="text-sm text-slate-400">No sales feedback submitted yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {data.feedbacks.map((item) => (
        <div key={item.id} className="border rounded-lg overflow-hidden">
          <button
            onClick={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-blue-950">
                {typeof item.userId === "object" ? item.userId.name : ""}
              </span>
              <span className="text-xs text-slate-400">
                {format(new Date(item.date), "dd MMM yyyy")}
              </span>
            </div>
            {expandedId === item.id ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {expandedId === item.id && (
            <div className="px-4 py-4 space-y-4 bg-white">
              {[
                {
                  label: "Reasons Customers Showed Interest",
                  value: item.reasonsInterested,
                },
                {
                  label: "Reasons Customers Not Interested",
                  value: item.reasonsNotInterested,
                },
                {
                  label: "Why Follow Ups Went Cold",
                  value: item.followUpColdReasons,
                },
                {
                  label: "Suggestions for More Conversions",
                  value: item.conversionSuggestions,
                },
              ].map((field) => (
                <div key={field.label} className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {field.label}
                  </p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// ADMIN VIEW — OTHER FEEDBACK
// ─────────────────────────────────────────

function AdminOtherFeedbackView() {
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["allOtherFeedback"],
    queryFn: async () => {
      const response = await feedbackApi.getAllOtherFeedback();
      return response.data.data as OtherFeedbackResponse;
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      feedbackApi.replyToOtherFeedback(id, reply),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allOtherFeedback"] });
      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply sent successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleReply = (id: string) => {
    if (!replyText.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }
    replyMutation.mutate({ id, reply: replyText });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.feedbacks?.length) {
    return (
      <p className="text-sm text-slate-400">No issues submitted yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {data.feedbacks.map((item) => (
        <div key={item.id} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-blue-950">
                  {typeof item.userId === "object" ? item.userId.name : ""}
                </span>
                <Badge
                  className={
                    item.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {item.status === "resolved" ? "Resolved" : "Pending"}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">
                {formatDistanceToNow(new Date(item.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>

            {!item.reply && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyingTo(replyingTo === item.id ? null : item.id);
                  setReplyText("");
                }}
              >
                Reply
              </Button>
            )}
          </div>

          <p className="text-sm text-slate-700">{item.message}</p>

          {/* Existing reply */}
          {item.reply && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1">
              <p className="text-xs font-semibold text-blue-700">
                Your reply · {item.repliedBy?.name || "Admin"}
              </p>
              <p className="text-sm text-slate-700">{item.reply}</p>
              {item.repliedAt && (
                <p className="text-xs text-slate-400">
                  {formatDistanceToNow(new Date(item.repliedAt), {
                    addSuffix: true,
                  })}
                </p>
              )}
            </div>
          )}

          {/* Reply input */}
          {replyingTo === item.id && (
            <div className="space-y-2">
              <Textarea
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
                maxLength={2000}
                className="resize-none"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={replyMutation.isPending}
                  onClick={() => handleReply(item.id)}
                  className="bg-blue-950 hover:bg-blue-900"
                >
                  <Send className="h-3 w-3 mr-1" />
                  {replyMutation.isPending ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────

export default function FeedbackPage() {
  const { isSales, canViewSalesFeedback, canManageOtherFeedback } = useAuthStore();

  return (
    <div>
      <Header
        title="Feedback"
        description={
          isSales()
            ? "Submit your daily feedback and raise issues"
            : "View sales team feedback"
        }
      />

      <div className="p-6">
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList>
            {/* Sales tab — visible to all who can access this page */}
            {(isSales() || canViewSalesFeedback()) && (
              <TabsTrigger value="sales">Regarding Sales</TabsTrigger>
            )}
            {/* Other Issues tab — sales person + admin/superadmin */}
            {(isSales() || canManageOtherFeedback()) && (
              <TabsTrigger value="other">Other Issues</TabsTrigger>
            )}
          </TabsList>

          {/* Regarding Sales tab */}
          <TabsContent value="sales" className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              {isSales() ? (
                <SalesFeedbackForm />
              ) : (
                <AdminSalesFeedbackView />
              )}
            </div>
          </TabsContent>

          {/* Other Issues tab */}
          <TabsContent value="other" className="space-y-6">
            <div className="bg-white rounded-xl border p-6">
              {isSales() ? (
                <OtherFeedbackPanel />
              ) : (
                <AdminOtherFeedbackView />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}