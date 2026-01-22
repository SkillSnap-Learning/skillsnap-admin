"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { teamsApi } from "@/lib/api";
import { User, UserRole, UserStatus } from "@/types";
import { Loader2 } from "lucide-react";

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface UserFormData {
  [key: string]: string | UserRole | UserStatus | undefined; // Add this
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  team?: string;
  status: UserStatus;
}

const roles: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "sales-manager", label: "Sales Manager" },
  { value: "team-lead", label: "Team Lead" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "instructor", label: "Instructor" },
  { value: "student", label: "Student" },
];

const statuses: { value: UserStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

export function UserModal({
  open,
  onOpenChange,
  user,
  onSubmit,
  isSubmitting,
}: UserModalProps) {
  const isEditing = !!user;

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "sales",
    team: "",
    status: "active",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch teams
  const { data: teams } = useQuery({
    queryKey: ["teamsActive"],
    queryFn: async () => {
      const response = await teamsApi.getActive();
      return response.data.data;
    },
    enabled: open,
  });

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          password: "",
          role: user.role,
          team: typeof user.team === "object" ? user.team?._id : user.team || "",
          status: user.status,
        });
      } else {
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "sales",
          team: "",
          status: "active",
        });
      }
      setErrors({});
    }
  }, [open, user]);

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!isEditing && !formData.password) {
      newErrors.password = "Password is required for new users";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const submitData = { ...formData };
    if (isEditing && !submitData.password) {
      delete submitData.password;
    }
    if (!submitData.team) {
      delete submitData.team;
    }

    await onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user information below."
              : "Fill in the details to create a new user."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@example.com"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+91 9876543210"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEditing ? "(leave blank to keep current)" : "*"}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder={isEditing ? "••••••••" : "Min 6 characters"}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Role & Status Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Role */}
            <div className="space-y-2">
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Team */}
          <div className="space-y-2">
            <Label>Team</Label>
            {teams ? (
              <Select
                value={formData.team || "none"}
                onValueChange={(value) =>
                  handleChange("team", value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Team</SelectItem>
                  {teams.map((team: any) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="h-10 w-full rounded-md border border-input bg-muted animate-pulse" />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-950 hover:bg-blue-900"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}