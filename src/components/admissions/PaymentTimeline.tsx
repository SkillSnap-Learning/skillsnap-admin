"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentInstallment } from "@/types";
import { Calendar, CreditCard, User, FileText } from "lucide-react";

interface PaymentTimelineProps {
  installments: PaymentInstallment[];
}

const methodLabels: Record<string, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  upi: "UPI",
  razorpay: "Razorpay",
  other: "Other",
};

const methodColors: Record<string, string> = {
  cash: "bg-green-100 text-green-700",
  bank_transfer: "bg-blue-100 text-blue-700",
  upi: "bg-purple-100 text-purple-700",
  razorpay: "bg-orange-100 text-orange-700",
  other: "bg-gray-100 text-gray-700",
};

export function PaymentTimeline({ installments }: PaymentTimelineProps) {
  if (!installments || installments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 text-center py-8">
            No payments recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort installments by paidAt date (newest first)
  const sortedInstallments = [...installments].sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedInstallments.map((installment, index) => {
            const recordedBy =
              typeof installment.recordedBy === "object"
                ? installment.recordedBy.name
                : "Unknown";

            return (
              <div
                key={installment._id || index}
                className="flex gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  {index !== sortedInstallments.length - 1 && (
                    <div className="w-0.5 h-full bg-slate-200 mt-2" />
                  )}
                </div>

                {/* Payment details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-lg text-green-600">
                        ₹{installment.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(installment.paidAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge className={methodColors[installment.method]}>
                      {methodLabels[installment.method]}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {installment.transactionId && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="h-4 w-4" />
                        <span className="font-mono">{installment.transactionId}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="h-4 w-4" />
                      <span>Recorded by {recordedBy}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Recorded on{" "}
                        {new Date(installment.recordedAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {installment.notes && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700">{installment.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}