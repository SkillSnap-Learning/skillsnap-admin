"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadFilters as LeadFiltersType } from "@/types";
import { Search, X, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { teamsApi, usersApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFiltersChange: (filters: LeadFiltersType) => void;
}

export function LeadFilters({ filters, onFiltersChange }: LeadFiltersProps) {
  const [search, setSearch] = useState(filters.search || "");
  const [showFilters, setShowFilters] = useState(false);
  const { canManageTeams } = useAuthStore();

  // Fetch teams for filter dropdown
  const { data: teamsData } = useQuery({
    queryKey: ["teamsActive"],
    queryFn: async () => {
      const response = await teamsApi.getActive();
      return response.data.data;
    },
    enabled: canManageTeams(),
  });

  // Fetch sales users for filter dropdown
  const { data: salesUsersData } = useQuery({
    queryKey: ["salesUsers"],
    queryFn: async () => {
      const response = await usersApi.getSalesUsers();
      return response.data.data;
    },
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        onFiltersChange({ ...filters, search, page: 1 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleFilterChange = (key: keyof LeadFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? "" : value,
      page: 1,
    });
  };

  const clearFilters = () => {
    setSearch("");
    onFiltersChange({
      page: 1,
      limit: 20,
    });
  };

  const hasActiveFilters =
    filters.status ||
    filters.source ||
    filters.assignedTo ||
    filters.team ||
    filters.search;

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "bg-slate-100" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 h-2 w-2 bg-orange-500 rounded-full" />
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter Dropdowns */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Status</label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Source Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Source</label>
            <Select
              value={filters.source || "all"}
              onValueChange={(value) => handleFilterChange("source", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Sources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="contact_form">Contact Form</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assigned To Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Assigned To</label>
            <Select
              value={filters.assignedTo || "all"}
              onValueChange={(value) => handleFilterChange("assignedTo", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {salesUsersData?.map((user: any) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Filter */}
          {canManageTeams() && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-500">Team</label>
              <Select
                value={filters.team || "all"}
                onValueChange={(value) => handleFilterChange("team", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Teams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  {teamsData?.map((team: any) => (
                    <SelectItem key={team._id} value={team._id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}