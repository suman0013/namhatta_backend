import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import type { Devotee, Namhatta } from "@/lib/types";

interface ChangeNamhattaModalProps {
  isOpen: boolean;
  onClose: () => void;
  devotee: Devotee;
  currentNamhattaName?: string;
}

export default function ChangeNamhattaModal({
  isOpen,
  onClose,
  devotee,
  currentNamhattaName,
}: ChangeNamhattaModalProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNamhattaId, setSelectedNamhattaId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Fetch namhattas with search
  const { data: namhattasData, isLoading: isLoadingNamhattas } = useQuery({
    queryKey: ["/api/namhattas", searchTerm],
    queryFn: () => api.getNamhattas(1, 50, { search: searchTerm, status: "APPROVED" }),
    enabled: isOpen,
  });

  // Update validation when inputs change
  useEffect(() => {
    setIsValid(
      selectedNamhattaId !== null && 
      selectedNamhattaId !== devotee.namhattaId && 
      reason.trim().length > 0
    );
  }, [selectedNamhattaId, reason, devotee.namhattaId]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedNamhattaId(null);
      setReason("");
      setIsValid(false);
    }
  }, [isOpen]);

  const updateDevoteeMutation = useMutation({
    mutationFn: async () => {
      const selectedNamhatta = namhattasData?.data.find(n => n.id === selectedNamhattaId);
      const currentTimestamp = new Date().toISOString();
      const assignmentNote = `\n\n--- Namhatta Assignment Change (${currentTimestamp}) ---\nFrom: ${currentNamhattaName || 'Unknown'} (ID: ${devotee.namhattaId || 'None'})\nTo: ${selectedNamhatta?.name} (ID: ${selectedNamhattaId})\nReason: ${reason.trim()}\n`;
      
      const updatedAdditionalComments = (devotee.additionalComments || "") + assignmentNote;
      
      return api.updateDevotee(devotee.id, {
        namhattaId: selectedNamhattaId!,
        additionalComments: updatedAdditionalComments,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Namhatta assignment changed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/devotees", devotee.id.toString()] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to change namhatta assignment",
        variant: "destructive",
      });
      console.error("Failed to update devotee:", error);
    },
  });

  const handleSubmit = () => {
    if (isValid) {
      updateDevoteeMutation.mutate();
    }
  };

  const selectedNamhatta = namhattasData?.data.find(n => n.id === selectedNamhattaId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Namhatta Assignment</DialogTitle>
          <DialogDescription>
            Change the namhatta assignment for {devotee.legalName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Assignment */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
            <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Current Assignment
            </Label>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {currentNamhattaName || "No namhatta assigned"}
            </p>
          </div>

          {/* Namhatta Search */}
          <div className="space-y-2">
            <Label htmlFor="namhatta-search">Search Namhatta *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="namhatta-search"
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-namhatta-search"
              />
            </div>
          </div>

          {/* Namhatta Selection */}
          <div className="space-y-2">
            <Label htmlFor="namhatta-select">Select New Namhatta *</Label>
            <Select 
              value={selectedNamhattaId?.toString() || ""} 
              onValueChange={(value) => setSelectedNamhattaId(parseInt(value))}
            >
              <SelectTrigger data-testid="select-namhatta">
                <SelectValue placeholder="Select a namhatta" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingNamhattas ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : namhattasData?.data.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No namhattas found
                  </div>
                ) : (
                  namhattasData?.data
                    .filter(namhatta => namhatta.id !== devotee.namhattaId) // Exclude current namhatta
                    .map((namhatta) => (
                      <SelectItem key={namhatta.id} value={namhatta.id.toString()}>
                        {namhatta.name} ({namhatta.code})
                      </SelectItem>
                    ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Namhatta Preview */}
          {selectedNamhatta && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <Label className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Selected Namhatta
              </Label>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {selectedNamhatta.name} ({selectedNamhatta.code})
              </p>
              {selectedNamhatta.meetingDay && selectedNamhatta.meetingTime && (
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Meetings: {selectedNamhatta.meetingDay} at {selectedNamhatta.meetingTime}
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Change *</Label>
            <Textarea
              id="reason"
              placeholder="Please provide a reason for this assignment change..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              data-testid="textarea-reason"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={updateDevoteeMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || updateDevoteeMutation.isPending}
              data-testid="button-save"
            >
              {updateDevoteeMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Namhatta"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}