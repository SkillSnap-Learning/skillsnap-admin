"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Admission, PaymentMethod } from "@/types";

interface AddPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admission: Admission;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

export function AddPaymentModal({
  open,
  onOpenChange,
  admission,
  onSubmit,
  isSubmitting,
}: AddPaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    method: "" as PaymentMethod | "",
    transactionId: "",
    paidAt: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    const amount = parseFloat(formData.amount);
    if (amount > admission.payment.pendingAmount) {
      newErrors.amount = `Amount cannot exceed pending balance of ₹${admission.payment.pendingAmount.toLocaleString("en-IN")}`;
    }

    if (!formData.method) {
      newErrors.method = "Please select a payment method";
    }

    if (!formData.paidAt) {
      newErrors.paidAt = "Please select payment date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    await onSubmit({
      amount: parseFloat(formData.amount),
      method: formData.method,
      transactionId: formData.transactionId || undefined,
      paidAt: formData.paidAt,
      notes: formData.notes || undefined,
    });

    // Reset form
    setFormData({
      amount: "",
      method: "",
      transactionId: "",
      paidAt: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Add a new payment for {admission.student.name} (
              {admission.admissionId})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Payment Summary */}
            <div className="p-4 bg-slate-50 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Amount:</span>
                <span className="font-medium">
                  ₹{admission.payment.totalAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Already Paid:</span>
                <span className="font-medium text-green-600">
                  ₹{admission.payment.paidAmount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="text-slate-600 font-medium">Remaining:</span>
                <span className="font-bold text-orange-600">
                  ₹{admission.payment.pendingAmount.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                min="1"
                max={admission.payment.pendingAmount}
                step="1"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="method">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.method}
                onValueChange={(value) => handleChange("method", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="razorpay">Razorpay</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.method && (
                <p className="text-sm text-red-500">{errors.method}</p>
              )}
            </div>

            {/* Transaction ID */}
            <div className="space-y-2">
              <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
              <Input
                id="transactionId"
                placeholder="e.g., UPI123456, NEFT789"
                value={formData.transactionId}
                onChange={(e) => handleChange("transactionId", e.target.value)}
              />
            </div>

            {/* Payment Date */}
            <div className="space-y-2">
              <Label htmlFor="paidAt">
                Payment Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="paidAt"
                type="date"
                value={formData.paidAt}
                onChange={(e) => handleChange("paidAt", e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.paidAt && (
                <p className="text-sm text-red-500">{errors.paidAt}</p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}