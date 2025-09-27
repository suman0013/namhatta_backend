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
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  UserCheck, 
  UserMinus, 
  UserX, 
  AlertTriangle,
  ChevronRight,
  Users
} from "lucide-react";
import type { Devotee } from "@/lib/types";

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  devotee: Devotee;
  districtCode: string;
}

type RoleAction = 'promote' | 'demote' | 'remove';

interface RoleOption {
  value: string;
  label: string;
  description: string;
}

const SENAPOTI_ROLES: RoleOption[] = [
  { 
    value: 'DISTRICT_SUPERVISOR', 
    label: 'District Supervisor', 
    description: 'Top-level district management' 
  },
  { 
    value: 'MALA_SENAPOTI', 
    label: 'Mala Senapoti', 
    description: 'Reports to District Supervisor' 
  },
  { 
    value: 'MAHA_CHAKRA_SENAPOTI', 
    label: 'Maha Chakra Senapoti', 
    description: 'Reports to Mala Senapoti' 
  },
  { 
    value: 'CHAKRA_SENAPOTI', 
    label: 'Chakra Senapoti', 
    description: 'Reports to Maha Chakra Senapoti' 
  },
  { 
    value: 'UPA_CHAKRA_SENAPOTI', 
    label: 'Upa Chakra Senapoti', 
    description: 'Reports to Chakra Senapoti' 
  },
];

export default function RoleManagementModal({
  isOpen,
  onClose,
  devotee,
  districtCode,
}: RoleManagementModalProps) {
  const { toast } = useToast();
  const [action, setAction] = useState<RoleAction | null>(null);
  const [targetRole, setTargetRole] = useState<string>('');
  const [newSupervisor, setNewSupervisor] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Get available supervisors for the target role
  const { data: availableSupervisors, isLoading: isLoadingSupervisors } = useQuery({
    queryKey: ['/api/senapoti/available-supervisors', districtCode, targetRole],
    queryFn: () => api.getAvailableSupervisors(districtCode, targetRole, [devotee.id]),
    enabled: isOpen && !!targetRole && action !== 'remove',
  });

  // Get current subordinates
  const { data: subordinatesData, isLoading: isLoadingSubordinates } = useQuery({
    queryKey: ['/api/senapoti/subordinates', devotee.id, 'all'],
    queryFn: () => api.getAllSubordinates(devotee.id),
    enabled: isOpen && !!devotee.leadershipRole,
  });

  // Determine current role level for hierarchy logic
  const getCurrentRoleLevel = (role: string | null | undefined): number => {
    if (!role) return -1;
    const levels = {
      'DISTRICT_SUPERVISOR': 0,
      'MALA_SENAPOTI': 1,
      'MAHA_CHAKRA_SENAPOTI': 2,
      'CHAKRA_SENAPOTI': 3,
      'UPA_CHAKRA_SENAPOTI': 4,
    };
    return levels[role as keyof typeof levels] ?? -1;
  };

  const currentLevel = getCurrentRoleLevel(devotee.leadershipRole);

  // Get valid target roles based on current role and action
  const getValidTargetRoles = (): RoleOption[] => {
    if (action === 'remove') return [];
    
    const allRoles = SENAPOTI_ROLES;
    
    if (action === 'promote') {
      // Can promote to higher levels (lower index numbers)
      return allRoles.filter((_, index) => index < currentLevel);
    } else if (action === 'demote') {
      // Can demote to lower levels (higher index numbers)
      return allRoles.filter((_, index) => index > currentLevel);
    }
    
    return allRoles;
  };

  const validTargetRoles = getValidTargetRoles();

  // Update validation when inputs change
  useEffect(() => {
    if (action === 'remove') {
      setIsValid(reason.trim().length > 0);
    } else {
      setIsValid(
        !!targetRole && 
        reason.trim().length > 0 &&
        (action === 'promote' || !!newSupervisor) // Promotions may not need supervisor, demotions do
      );
    }
  }, [action, targetRole, newSupervisor, reason]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setAction(null);
      setTargetRole('');
      setNewSupervisor('');
      setReason('');
      setIsValid(false);
    }
  }, [isOpen]);

  // Promote mutation
  const promoteMutation = useMutation({
    mutationFn: async () => {
      return api.promoteDevotee({
        devoteeId: devotee.id,
        targetRole,
        newReportingTo: newSupervisor ? parseInt(newSupervisor) : undefined,
        reason,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Devotee promoted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/senapoti"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to promote devotee",
        variant: "destructive",
      });
    },
  });

  // Demote mutation
  const demoteMutation = useMutation({
    mutationFn: async () => {
      return api.demoteDevotee({
        devoteeId: devotee.id,
        targetRole: targetRole || null,
        newReportingTo: newSupervisor ? parseInt(newSupervisor) : undefined,
        reason,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Devotee demoted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/senapoti"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to demote devotee",
        variant: "destructive",
      });
    },
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async () => {
      return api.removeDevoteeRole({
        devoteeId: devotee.id,
        reason,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/senapoti"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!isValid) return;

    if (action === 'promote') {
      promoteMutation.mutate();
    } else if (action === 'demote') {
      demoteMutation.mutate();
    } else if (action === 'remove') {
      removeRoleMutation.mutate();
    }
  };

  const isLoading = promoteMutation.isPending || demoteMutation.isPending || removeRoleMutation.isPending;

  const getActionIcon = (actionType: RoleAction) => {
    switch (actionType) {
      case 'promote': return <UserCheck className="w-4 h-4 text-green-600" />;
      case 'demote': return <UserMinus className="w-4 h-4 text-yellow-600" />;
      case 'remove': return <UserX className="w-4 h-4 text-red-600" />;
    }
  };

  const getActionColor = (actionType: RoleAction) => {
    switch (actionType) {
      case 'promote': return 'border-green-200 bg-green-50 hover:bg-green-100 dark:border-green-800 dark:bg-green-900/20';
      case 'demote': return 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'remove': return 'border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-800 dark:bg-red-900/20';
    }
  };

  const subordinatesCount = subordinatesData?.count || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-role-management">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Role Management - {devotee.legalName}
          </DialogTitle>
          <DialogDescription>
            Manage senapoti roles with automatic subordinate transfer and hierarchy maintenance
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Status</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {devotee.leadershipRole ? (
                      SENAPOTI_ROLES.find(r => r.value === devotee.leadershipRole)?.label || devotee.leadershipRole
                    ) : (
                      'No Leadership Role'
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    District: {districtCode}
                  </p>
                </div>
                {subordinatesCount > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {subordinatesCount} subordinate{subordinatesCount !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Selection */}
          {!action && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Select Action</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3">
                  {currentLevel > 0 && (
                    <button
                      className={`p-4 border rounded-lg text-left transition-colors cursor-pointer ${getActionColor('promote')}`}
                      onClick={() => setAction('promote')}
                      data-testid="button-promote"
                    >
                      <div className="flex items-center gap-3">
                        {getActionIcon('promote')}
                        <div>
                          <h3 className="font-medium">Promote</h3>
                          <p className="text-sm text-muted-foreground">Promote to a higher leadership role</p>
                        </div>
                      </div>
                    </button>
                  )}
                  
                  {devotee.leadershipRole && currentLevel < 4 && (
                    <button
                      className={`p-4 border rounded-lg text-left transition-colors cursor-pointer ${getActionColor('demote')}`}
                      onClick={() => setAction('demote')}
                      data-testid="button-demote"
                    >
                      <div className="flex items-center gap-3">
                        {getActionIcon('demote')}
                        <div>
                          <h3 className="font-medium">Demote</h3>
                          <p className="text-sm text-muted-foreground">Demote to a lower leadership role</p>
                        </div>
                      </div>
                    </button>
                  )}
                  
                  {devotee.leadershipRole && (
                    <button
                      className={`p-4 border rounded-lg text-left transition-colors cursor-pointer ${getActionColor('remove')}`}
                      onClick={() => setAction('remove')}
                      data-testid="button-remove-role"
                    >
                      <div className="flex items-center gap-3">
                        {getActionIcon('remove')}
                        <div>
                          <h3 className="font-medium">Remove Role</h3>
                          <p className="text-sm text-muted-foreground">Remove all leadership responsibilities</p>
                        </div>
                      </div>
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Configuration */}
          {action && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  {getActionIcon(action)}
                  Configure {action === 'promote' ? 'Promotion' : action === 'demote' ? 'Demotion' : 'Role Removal'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {/* Target Role Selection */}
                {action !== 'remove' && (
                  <div className="space-y-2">
                    <Label htmlFor="select-target-role">Target Role</Label>
                    <Select value={targetRole} onValueChange={setTargetRole}>
                      <SelectTrigger data-testid="select-target-role">
                        <SelectValue placeholder="Select new role" />
                      </SelectTrigger>
                      <SelectContent>
                        {validTargetRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-sm text-muted-foreground">{role.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Supervisor Selection */}
                {action !== 'remove' && targetRole && (
                  <div className="space-y-2">
                    <Label htmlFor="select-supervisor">
                      New Supervisor {action === 'demote' && <span className="text-red-500">*</span>}
                    </Label>
                    {isLoadingSupervisors ? (
                      <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading available supervisors...
                      </div>
                    ) : availableSupervisors?.length === 0 ? (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No available supervisors found for this role in district {districtCode}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Select value={newSupervisor} onValueChange={setNewSupervisor}>
                        <SelectTrigger data-testid="select-supervisor">
                          <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSupervisors?.map((supervisor: any) => (
                            <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                              <div>
                                <div className="font-medium">{supervisor.legalName}</div>
                                <div className="text-sm text-muted-foreground">{supervisor.leadershipRole}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor="textarea-reason">Reason <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="textarea-reason"
                    placeholder="Provide a reason for this role change"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    data-testid="textarea-reason"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Impact Preview */}
          {action && subordinatesCount > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Impact Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Alert>
                  <AlertDescription>
                    <strong>{subordinatesCount} subordinate{subordinatesCount !== 1 ? 's' : ''}</strong> will be automatically transferred to appropriate supervisors within the district hierarchy.
                  </AlertDescription>
                </Alert>
                {isLoadingSubordinates ? (
                  <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading subordinate details...
                  </div>
                ) : subordinatesData?.subordinates && (
                  <div className="mt-3 max-h-32 overflow-y-auto">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Affected Subordinates:</div>
                    {subordinatesData.subordinates.map((sub: any, index: number) => (
                      <div key={sub.id} className="text-sm py-1 flex items-center gap-2">
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                        {sub.legalName} ({sub.leadershipRole || 'Member'})
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            {action && (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid || isLoading}
                className="flex-1"
                data-testid="button-confirm"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Confirm {action === 'promote' ? 'Promotion' : action === 'demote' ? 'Demotion' : 'Role Removal'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}