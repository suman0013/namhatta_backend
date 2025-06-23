import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { X, Award } from "lucide-react";
import type { DevotionalStatus } from "@/lib/types";

interface StatusFormProps {
  status?: DevotionalStatus;
  onClose: () => void;
  onSuccess?: () => void;
}

const formSchema = z.object({
  name: z.string().min(1, "Status name is required").max(100, "Name too long"),
});

type FormData = z.infer<typeof formSchema>;

export default function StatusForm({ status, onClose, onSuccess }: StatusFormProps) {
  const { toast } = useToast();
  const isEditing = !!status;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: status?.name || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.createStatus(data.name),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Status created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/statuses"] });
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
    mutationFn: (data: FormData) => api.renameStatus(status!.id, data.name),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Status renamed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/statuses"] });
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
      renameMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || renameMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-indigo-500" />
            <span>{isEditing ? "Rename Status" : "Create New Status"}</span>
          </DialogTitle>
        </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter status name..." 
                        className="glass border-0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 gradient-button"
                >
                  {isPending ? "Saving..." : isEditing ? "Rename Status" : "Create Status"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="glass"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
  );
}