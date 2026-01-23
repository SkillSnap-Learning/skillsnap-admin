"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { AdmissionsTable } from "@/components/admissions/AdmissionsTable";
import { AdmissionFilters } from "@/components/admissions/AdmissionFilters";
import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { admissionsApi } from "@/lib/api";
import { AdmissionFilters as AdmissionFiltersType } from "@/types";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { Download, TrendingUp } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";

export default function AdmissionsPage() {
  const { canExportLeads, canViewReports } = useAuthStore();

  // State
  const [filters, setFilters] = useState<AdmissionFiltersType>({
    page: 1,
    limit: 20,
  });

  // Fetch admissions
  const { data, isLoading } = useQuery({
    queryKey: ["admissions", filters],
    queryFn: async () => {
      const response = await admissionsApi.getAll(filters);
      return response.data.data;
    },
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ["admissions-stats"],
    queryFn: async () => {
      const response = await admissionsApi.getStats();
      return response.data.data;
    },
    enabled: canViewReports(),
  });

  const admissions = data?.admissions || [];
  const pagination = data?.pagination || { page: 1, total: 0, pages: 1, limit: 20 };

  // Calculate stats from statsData
  const stats = {
    total: pagination.total,
    paid: statsData?.paymentStatusCounts?.find((s: any) => s._id === "paid")?.count || 0,
    partial: statsData?.paymentStatusCounts?.find((s: any) => s._id === "partial")?.count || 0,
    unpaid: statsData?.paymentStatusCounts?.find((s: any) => s._id === "unpaid")?.count || 0,
    totalRevenue: statsData?.paymentStats?.[0]?.totalRevenue || 0,
    totalPending: statsData?.paymentStats?.[0]?.totalPending || 0,
  };

  // Handlers
  const handleExport = async () => {
    try {
      // TODO: Implement export endpoint in backend
      toast.info("Export feature coming soon");
    } catch (error) {
      toast.error("Export failed");
    }
  };

  return (
    <div>
      <Header title="Admissions" description="Manage student admissions and payments" />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        {canViewReports() && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Admissions"
              value={stats.total.toString()}
              icon={TrendingUp}
            />
            <StatsCard
              title="Fully Paid"
              value={stats.paid.toString()}
              subtitle={`₹${stats.totalRevenue.toLocaleString('en-IN')}`}
              icon={TrendingUp}
            />
            <StatsCard
              title="Partial Payment"
              value={stats.partial.toString()}
              subtitle={`₹${stats.totalPending.toLocaleString('en-IN')} pending`}
              icon={TrendingUp}
            />
            <StatsCard
              title="Unpaid"
              value={stats.unpaid.toString()}
              icon={TrendingUp}
            />
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {canExportLeads() && (
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <AdmissionFilters filters={filters} onFiltersChange={setFilters} />

        {/* Table */}
        <AdmissionsTable admissions={admissions} isLoading={isLoading} />

        {/* Pagination */}
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      </div>
    </div>
  );
}