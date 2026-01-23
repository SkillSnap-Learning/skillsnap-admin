"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Admission, AdmissionStatus } from "@/types";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdmissionsTableProps {
  admissions: Admission[];
  isLoading: boolean;
}

const statusColors: Record<AdmissionStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  payment_initiated: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  enrolled: "bg-purple-100 text-purple-700",
  expired: "bg-red-100 text-red-700",
  payment_failed: "bg-orange-100 text-orange-700",
  cancelled: "bg-slate-100 text-slate-700",
};

const statusLabels: Record<AdmissionStatus, string> = {
  pending: "Pending",
  payment_initiated: "Payment Initiated",
  paid: "Paid",
  enrolled: "Enrolled",
  expired: "Expired",
  payment_failed: "Payment Failed",
  cancelled: "Cancelled",
};

export function AdmissionsTable({ admissions, isLoading }: AdmissionsTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (admissions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-slate-500">No admissions found</p>
      </div>
    );
  }

  const getPaymentProgress = (admission: Admission) => {
    const paidAmount = admission.payment?.paidAmount || 0;
    const totalAmount = admission.payment?.totalAmount || 1; // Use 1 to avoid division by zero
    const percentage = (paidAmount / totalAmount) * 100;
    return Math.min(Math.round(percentage), 100);
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Admission ID</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admissions.map((admission) => {
            const progress = getPaymentProgress(admission);
            const isPaidInFull = (admission.payment?.paidAmount || 0) >= (admission.payment?.totalAmount || 1);

            return (
              <TableRow key={admission._id}>
                <TableCell className="font-medium">
                  {admission.admissionId}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{admission.student.name}</div>
                    <div className="text-sm text-slate-500">
                      DOB: {new Date(admission.student.dateOfBirth).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{admission.parent.name}</div>
                    <div className="text-sm text-slate-500">{admission.parent.phone}</div>
                  </div>
                </TableCell>
                <TableCell>Class {admission.student.class}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            isPaidInFull ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 min-w-[40px]">
                        {progress}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      ₹{(admission.payment?.paidAmount || 0).toLocaleString('en-IN')} / 
                      ₹{(admission.payment?.totalAmount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-green-600">
                      ₹{(admission.payment?.paidAmount || 0).toLocaleString('en-IN')}
                    </div>
                    {(admission.payment?.pendingAmount || 0) > 0 && (
                      <div className="text-sm text-orange-600">
                        ₹{(admission.payment?.pendingAmount || 0).toLocaleString('en-IN')} pending
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[admission.status]}>
                    {statusLabels[admission.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(admission.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(`/admissions/${admission.admissionId}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}