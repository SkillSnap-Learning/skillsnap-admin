"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdmissionFilters as AdmissionFiltersType } from "@/types";
import { Search } from "lucide-react";

interface AdmissionFiltersProps {
  filters: AdmissionFiltersType;
  onFiltersChange: (filters: AdmissionFiltersType) => void;
}

export function AdmissionFilters({ filters, onFiltersChange }: AdmissionFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
      page: 1, // Reset to first page on filter change
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by student name or admission ID..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="payment_initiated">Payment Initiated</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="enrolled">Enrolled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="payment_failed">Payment Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {/* Payment Status Filter */}
        <Select
          value={filters.paymentStatus || "all"}
          onValueChange={(value) => handleFilterChange("paymentStatus", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Payment Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="unpaid">Unpaid (₹0)</SelectItem>
            <SelectItem value="partial">Partial Payment</SelectItem>
            <SelectItem value="paid">Fully Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}