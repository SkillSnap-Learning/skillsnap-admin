"use client";

import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StatsCardSkeleton } from "@/components/dashboard/StatsCardSkeleton";
import { RecentLeadsTable } from "@/components/dashboard/RecentLeadsTable";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { useAuthStore } from "@/stores/authStore";
import { leadsApi } from "@/lib/api";
import { LeadStats, Lead } from "@/types";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Fetch lead stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["leadStats"],
    queryFn: async () => {
      const response = await leadsApi.getStats();
      return response.data.data as LeadStats;
    },
  });

  // Fetch recent leads
  const {
    data: leadsData,
    isLoading: leadsLoading,
    refetch: refetchLeads,
  } = useQuery({
    queryKey: ["recentLeads"],
    queryFn: async () => {
      const response = await leadsApi.getAll({ limit: 5, sortBy: "createdAt", sortOrder: "desc" });
      return response.data.data.leads as Lead[];
    },
  });

  const handleAutoAssignComplete = () => {
    refetchLeads();
  };

  return (
    <div>
      <Header
        title="Dashboard"
        description={`Welcome back, ${user?.name || "User"}!`}
      />

      <div className="p-6 space-y-6">
        {/* Quick Actions */}
        <QuickActions onAutoAssignComplete={handleAutoAssignComplete} />

        {/* Stats Cards */}
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

        {/* Secondary Stats Row */}
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

        {/* Recent Leads Table */}
        <RecentLeadsTable
          leads={leadsData || []}
          isLoading={leadsLoading}
        />
      </div>
    </div>
  );
}