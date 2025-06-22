import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DevotionalStatus } from "@/lib/types";

interface StatusFormProps {
  status?: DevotionalStatus;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
}

export default function StatusForm({ status, onClose, onSuccess }: StatusFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!status;

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: status?.name || "",
    }
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => api.createStatus(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/statuses"] });
      toast({
        title: "Success",
        description: "Status created successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create status",
        variant: "destructive",
      });
    },
  });

  const renameMutation = useMutation({
    mutationFn: (newName: string) => api.renameStatus(status!.id, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/statuses"] });
      toast({
        title: "Success",
        description: "Status renamed successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to rename status",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      renameMutation.mutate(data.name);
    } else {
      createMutation.mutate(data.name);
    }
  };

  const isLoading = createMutation.isPending || renameMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? "Rename Status" : "Add New Status"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Status Name *</Label>
              <Input
                {...register("name", { required: "Status name is required" })}
                placeholder="Enter status name"
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : (isEditing ? "Rename Status" : "Create Status")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}