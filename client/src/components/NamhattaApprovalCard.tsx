import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Check, X, MapPin, Users, Calendar, Clock, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Namhatta } from "@/lib/types";

interface NamhattaApprovalCardProps {
  namhatta: Namhatta;
}

export default function NamhattaApprovalCard({ namhatta }: NamhattaApprovalCardProps) {
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Only ADMIN and OFFICE users can approve/reject
  const canApprove = user?.role === 'ADMIN' || user?.role === 'OFFICE';

  const approveMutation = useMutation({
    mutationFn: () => apiRequest(`/api/namhattas/${namhatta.id}/approve`, {
      method: "POST",
    }),
    onSuccess: () => {
      toast({
        title: "Namhatta Approved",
        description: `${namhatta.name} has been successfully approved.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/namhattas"] });
      setShowApprovalDialog(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve namhatta. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reason: string) => apiRequest(`/api/namhattas/${namhatta.id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
    onSuccess: () => {
      toast({
        title: "Namhatta Rejected",
        description: `${namhatta.name} has been rejected.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/namhattas"] });
      setShowRejectionDialog(false);
      setRejectionReason("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject namhatta. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-1 rounded-full text-xs font-medium">Approved</Badge>;
      case "PENDING_APPROVAL":
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded-full text-xs font-medium">Pending</Badge>;
      case "REJECTED":
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">{namhatta.name}</CardTitle>
            {getStatusBadge(namhatta.status)}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Code: {namhatta.code}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="text-sm">
              <p>{namhatta.address?.village}, {namhatta.address?.district}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {namhatta.address?.state}, {namhatta.address?.country}
              </p>
            </div>
          </div>

          {/* Meeting Schedule */}
          {(namhatta.meetingDay || namhatta.meetingTime) && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">
                {namhatta.meetingDay} {namhatta.meetingTime && `at ${namhatta.meetingTime}`}
              </span>
            </div>
          )}

          {/* Leadership */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Leadership</span>
            </div>
            <div className="ml-6 space-y-1 text-xs">
              {namhatta.malaSenapoti && (
                <p><span className="font-medium">Mala Senapoti:</span> {namhatta.malaSenapoti}</p>
              )}
              {namhatta.mahaChakraSenapoti && (
                <p><span className="font-medium">Maha Chakra Senapoti:</span> {namhatta.mahaChakraSenapoti}</p>
              )}
              {namhatta.chakraSenapoti && (
                <p><span className="font-medium">Chakra Senapoti:</span> {namhatta.chakraSenapoti}</p>
              )}
              {namhatta.secretary && (
                <p><span className="font-medium">Secretary:</span> {namhatta.secretary}</p>
              )}
            </div>
          </div>

          {/* Registration Date */}
          <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Registered: {new Date(namhatta.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Action Buttons - Only show for ADMIN and OFFICE users */}
          {namhatta.status === "PENDING_APPROVAL" && canApprove && (
            <div className="flex space-x-2 pt-4">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowApprovalDialog(true)}
                disabled={approveMutation.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => setShowRejectionDialog(true)}
                disabled={rejectMutation.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Confirmation Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Namhatta</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve "{namhatta.name}"? This action will activate the namhatta and allow it to operate officially.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Namhatta</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting "{namhatta.name}". This will help the applicant understand what needs to be improved.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a detailed reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => rejectMutation.mutate(rejectionReason)}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}