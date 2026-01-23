"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { admissionsApi } from "@/lib/api";
import { Admission, AdmissionStatus } from "@/types";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";
import { ArrowLeft, Download, Plus, User, CreditCard, GraduationCap, Wifi } from "lucide-react";
import { AddPaymentModal } from "@/components/admissions/AddPaymentModal";
import { PaymentTimeline } from "@/components/admissions/PaymentTimeline";
import { useState } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
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

export default function AdmissionDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { canManageUsers } = useAuthStore();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Fetch admission details
  const { data: admission, isLoading } = useQuery({
    queryKey: ["admission", id],
    queryFn: async () => {
      const response = await admissionsApi.getById(id);
      return response.data.data as Admission;
    },
  });

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: (paymentData: any) => admissionsApi.recordPayment(id, paymentData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["admission", id] });
      queryClient.invalidateQueries({ queryKey: ["admissions"] });
      queryClient.invalidateQueries({ queryKey: ["admissions-stats"] });
      setPaymentModalOpen(false);
      
      const isFullyPaid = response.data.data?.payment?.isFullyPaid;
      if (isFullyPaid) {
        toast.success("Payment recorded! Student account created successfully.");
      } else {
        toast.success("Payment recorded successfully");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddPayment = async (paymentData: any) => {
    await recordPaymentMutation.mutateAsync(paymentData);
  };

  const handleDownloadInvoice = () => {
    if (admission?.invoice?.number) {
      window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/public/admission/${admission.admissionId}/invoice`,
        '_blank'
      );
    }
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Admission Details" />
        <div className="p-6 space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64 lg:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  if (!admission) {
    return (
      <div>
        <Header title="Admission Not Found" />
        <div className="p-6">
          <p className="text-slate-500">The requested admission could not be found.</p>
          <Button onClick={() => router.push("/admissions")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admissions
          </Button>
        </div>
      </div>
    );
  }

  const paymentProgress = Math.min(
    Math.round((admission.payment.paidAmount / admission.payment.totalAmount) * 100),
    100
  );

  const isPaidInFull = admission.payment.paidAmount >= admission.payment.totalAmount;
  const canAddPayment = canManageUsers() && admission.status !== 'enrolled';

  return (
    <div>
      <Header
        title={admission.admissionId}
        description={`${admission.student.name} - Class ${admission.student.class}`}
      />

      <div className="p-6 space-y-6">
        {/* Back button and status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => router.push("/admissions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admissions
          </Button>

          <div className="flex items-center gap-3">
            <Badge className={statusColors[admission.status]}>
              {statusLabels[admission.status]}
            </Badge>
            {admission.invoice?.number && (
              <Button variant="outline" size="sm" onClick={handleDownloadInvoice}>
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Info Cards */}
          <div className="space-y-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-medium">{admission.student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(admission.student.dateOfBirth).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Gender</p>
                  <p className="font-medium">{admission.student.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Class</p>
                  <p className="font-medium">Class {admission.student.class}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Board</p>
                  <p className="font-medium">{admission.student.board}</p>
                </div>
                {admission.student.schoolName && (
                  <div>
                    <p className="text-sm text-slate-500">School</p>
                    <p className="font-medium">{admission.student.schoolName}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Parent Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Parent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-medium">{admission.parent.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Relationship</p>
                  <p className="font-medium">{admission.parent.relationship}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium">{admission.parent.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{admission.parent.email}</p>
                </div>
                {admission.parent.whatsappPhone && (
                  <div>
                    <p className="text-sm text-slate-500">WhatsApp</p>
                    <p className="font-medium">{admission.parent.whatsappPhone}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technology Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  Technology Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">Device</p>
                  <p className="font-medium">{admission.technology.device}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Internet</p>
                  <p className="font-medium">{admission.technology.internetAvailability}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Summary
                  </CardTitle>
                  {canAddPayment && (
                    <Button
                      size="sm"
                      onClick={() => setPaymentModalOpen(true)}
                      disabled={isPaidInFull}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Payment Progress</span>
                    <span className="font-medium">{paymentProgress}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isPaidInFull ? "bg-green-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                </div>

                {/* Amount Details */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                    <p className="text-xl font-bold">
                      ₹{(admission.payment?.totalAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Paid</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{(admission.payment?.paidAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-1">Pending</p>
                    <p className="text-xl font-bold text-orange-600">
                      ₹{(admission.payment?.pendingAmount || 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Student Account Status */}
                {isPaidInFull && admission.userId && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">
                      ✓ Student account created
                    </p>
                    <p className="text-sm text-purple-700 mt-1">
                      Login credentials have been sent to parent's email
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Timeline */}
            <PaymentTimeline installments={admission.payment.installments} />
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        admission={admission}
        onSubmit={handleAddPayment}
        isSubmitting={recordPaymentMutation.isPending}
      />
    </div>
  );
}