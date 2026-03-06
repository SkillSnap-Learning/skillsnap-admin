"use client";

import { Plan } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface PlansTableProps {
  plans: Plan[];
  isLoading: boolean;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}

export function PlansTable({ plans, isLoading, onEdit, onDelete }: PlansTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-slate-500">No plans found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan._id}>
              <TableCell className="font-medium">{plan.name}</TableCell>
              <TableCell>
                <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                  {plan.slug}
                </code>
              </TableCell>
              <TableCell>
                {plan.isGuestPlan ? (
                  <Badge className="bg-orange-100 text-orange-700">Guest</Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-700">Paid</Badge>
                )}
              </TableCell>
              <TableCell>
                {plan.isGuestPlan ? (
                  <span className="text-slate-400 text-sm">Free</span>
                ) : (
                  <span className="text-sm">
                    ₹{plan.price.amount.toLocaleString()}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  className={
                    plan.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {plan.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-500">
                {plan.createdAt
                    ? formatDistanceToNow(new Date(plan.createdAt), { addSuffix: true })
                    : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/plans/${plan._id}/subjects`}>
                    <Button variant="ghost" size="sm" title="View Subjects">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(plan)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(plan)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}