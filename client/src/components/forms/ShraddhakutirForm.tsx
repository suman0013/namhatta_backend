import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Shraddhakutir } from "@/lib/types";

interface ShraddhakutirFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  districtCode: string;
}

export default function ShraddhakutirForm({ onClose, onSuccess }: ShraddhakutirFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: "",
      districtCode: "",
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => {
      // Generate code automatically: SK-<DISTRICT-CODE>-<SERIAL>
      const serial = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const code = `SK-${data.districtCode.toUpperCase()}-${serial}`;
      
      return api.createShraddhakutir({
        name: data.name,
        code,
        districtCode: data.districtCode.toUpperCase(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shraddhakutirs"] });
      toast({
        title: "Success",
        description: "Shraddhakutir created successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create Shraddhakutir",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const isLoading = createMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Shraddhakutir</DialogTitle>
        </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Shraddhakutir Name *</Label>
              <Input
                {...register("name", { required: "Name is required" })}
                placeholder="Enter Shraddhakutir name"
                autoFocus
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="districtCode">District Code *</Label>
              <Input
                {...register("districtCode", { 
                  required: "District code is required",
                  pattern: {
                    value: /^[A-Za-z0-9]+$/,
                    message: "District code must be alphanumeric"
                  }
                })}
                placeholder="Enter district code (e.g., KOL, MUM)"
                style={{ textTransform: 'uppercase' }}
              />
              {errors.districtCode && (
                <p className="text-sm text-red-500 mt-1">{errors.districtCode.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Code will be auto-generated as: SK-DISTRICT-###
              </p>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Creating..." : "Create Shraddhakutir"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
}