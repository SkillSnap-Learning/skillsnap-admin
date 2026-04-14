"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/components/dashboard/StatsCardSkeleton";
import { RecentLeadsTable } from "@/components/dashboard/RecentLeadsTable";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useAuthStore } from "@/stores/authStore";
import { leadsApi, feedbackApi } from "@/lib/api";
import { LeadStats, Lead, SalesDashboardStats, OtherFeedback } from "@/types";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  Clock,
  ClipboardList,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { user, isSales } = useAuthStore();

  // Sales dashboard
  const { data: salesStats, isLoading: salesLoading } = useQuery({
    queryKey: ["salesDashboardStats"],
    queryFn: async () => {
      const response = await feedbackApi.getSalesDashboardStats();
      return response.data.data as SalesDashboardStats;
    },
    enabled: isSales(),
  });

  // Regular dashboard
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["leadStats"],
    queryFn: async () => {
      const response = await leadsApi.getStats();
      return response.data.data as LeadStats;
    },
    enabled: !isSales(),
  });

  const {
    data: leadsData,
    isLoading: leadsLoading,
    refetch: refetchLeads,
  } = useQuery({
    queryKey: ["recentLeads"],
    queryFn: async () => {
      const response = await leadsApi.getAll({
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      return response.data.data.leads as Lead[];
    },
    enabled: !isSales(),
  });

  // ─────────────────────────────────────────
  // SALES DASHBOARD
  // ─────────────────────────────────────────
  if (isSales()) {
    return (
      <div>
        <Header
          title="Dashboard"
          description={`Welcome back, ${user?.name || "User"}!`}
        />

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {salesLoading ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : (
              <>
                <StatsCard
                  title="Today's Feedback"
                  value={salesStats?.todayFeedbackSubmitted ? "Submitted" : "Pending"}
                  subtitle={
                    salesStats?.todayFeedbackSubmitted
                      ? "Great job! Done for today"
                      : "Please submit today's feedback"
                  }
                  icon={ClipboardList}
                  iconColor={
                    salesStats?.todayFeedbackSubmitted
                      ? "text-green-600"
                      : "text-orange-600"
                  }
                  iconBg={
                    salesStats?.todayFeedbackSubmitted
                      ? "bg-green-100"
                      : "bg-orange-100"
                  }
                />
                <StatsCard
                  title="Total Feedbacks"
                  value={salesStats?.totalFeedbacksSubmitted || 0}
                  subtitle="All time submissions"
                  icon={ClipboardList}
                  iconColor="text-blue-600"
                  iconBg="bg-blue-100"
                />
                <StatsCard
                  title="Pending Issues"
                  value={salesStats?.pendingIssues || 0}
                  subtitle="Awaiting reply"
                  icon={AlertCircle}
                  iconColor="text-yellow-600"
                  iconBg="bg-yellow-100"
                />
                <StatsCard
                  title="Resolved Issues"
                  value={salesStats?.resolvedIssues || 0}
                  subtitle="Replied by admin"
                  icon={CheckCircle2}
                  iconColor="text-green-600"
                  iconBg="bg-green-100"
                />
              </>
            )}
          </div>

          {/* Recent Replies */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-sm font-semibold text-blue-950 mb-4">
              Recent Replies from Admin
            </h2>

            {salesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : salesStats?.recentReplies?.length === 0 ? (
              <p className="text-sm text-slate-400">No replies yet.</p>
            ) : (
              <div className="space-y-3">
                {salesStats?.recentReplies?.map((item: OtherFeedback) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-1 p-4 rounded-lg bg-slate-50 border"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-700 line-clamp-1">
                        {item.message}
                      </p>
                      <Badge className="bg-green-100 text-green-700 text-xs shrink-0 ml-2">
                        Replied
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {item.reply}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.repliedAt
                        ? formatDistanceToNow(new Date(item.repliedAt), {
                            addSuffix: true,
                          })
                        : ""}
                      {item.repliedBy ? ` · by ${item.repliedBy.name}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // REGULAR DASHBOARD (all other roles)
  // ─────────────────────────────────────────
  return (
    <div>
      <Header
        title="Dashboard"
        description={`Welcome back, ${user?.name || "User"}!`}
      />

      <div className="p-6 space-y-6">
        <QuickActions onAutoAssignComplete={() => refetchLeads()} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Leads"
                value={statsData?.total || 0}
                subtitle="All time"
                icon={Users}
                iconColor="text-blue-600"
                iconBg="bg-blue-100"
              />
              <StatsCard
                title="New Leads"
                value={statsData?.byStatus?.new || 0}
                subtitle="Pending contact"
                icon={UserPlus}
                iconColor="text-yellow-600"
                iconBg="bg-yellow-100"
              />
              <StatsCard
                title="Converted"
                value={statsData?.byStatus?.converted || 0}
                subtitle={`${statsData?.conversionRate || 0}% conversion`}
                icon={UserCheck}
                iconColor="text-green-600"
                iconBg="bg-green-100"
              />
              <StatsCard
                title="Unassigned"
                value={statsData?.unassigned || 0}
                subtitle="Needs assignment"
                icon={Clock}
                iconColor="text-orange-600"
                iconBg="bg-orange-100"
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Contacted"
                value={statsData?.byStatus?.contacted || 0}
                subtitle="In progress"
                icon={TrendingUp}
                iconColor="text-purple-600"
                iconBg="bg-purple-100"
              />
              <StatsCard
                title="Lost"
                value={statsData?.byStatus?.lost || 0}
                subtitle="Did not convert"
                icon={UserX}
                iconColor="text-red-600"
                iconBg="bg-red-100"
              />
              <StatsCard
                title="Assigned"
                value={statsData?.assigned || 0}
                subtitle="Being worked on"
                icon={UserCheck}
                iconColor="text-teal-600"
                iconBg="bg-teal-100"
              />
            </>
          )}
        </div>

        <RecentLeadsTable leads={leadsData || []} isLoading={leadsLoading} />
      </div>
    </div>
  );
}