import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  Users, 
  User, 
  ArrowRight, 
  CheckCircle,
  AlertTriangle,
  Info,
  Shuffle,
  UserCheck
} from "lucide-react";
import SupervisorSelectionComponent from "./SupervisorSelectionComponent";
import type { Devotee } from "@/lib/types";

interface SubordinateTransferInterfaceProps {
  fromDevoteeId: number | null; // null for orphaned subordinates
  fromDevoteeName?: string;
  districtCode: string;
  targetRole?: string; // Role level needed for new supervisor
  subordinates?: Devotee[];
  onTransferComplete?: (result: { transferred: number, subordinates: Devotee[] }) => void;
  disabled?: boolean;
  showIndividualAssignment?: boolean;
}

interface SubordinateAssignment {
  subordinate: Devotee;
  selectedSupervisorId: string | null;
  selectedSupervisor: Devotee | null;
}

export default function SubordinateTransferInterface({
  fromDevoteeId,
  fromDevoteeName,
  districtCode,
  targetRole = "MALA_SENAPOTI", // Default to requiring Mala Senapoti or higher
  subordinates: providedSubordinates,
  onTransferComplete,
  disabled = false,
  showIndividualAssignment = true,
}: SubordinateTransferInterfaceProps) {
  const { toast } = useToast();
  const [selectedSubordinateIds, setSelectedSubordinateIds] = useState<Set<number>>(new Set());
  const [bulkSupervisorId, setBulkSupervisorId] = useState<string | null>(null);
  const [bulkSupervisor, setBulkSupervisor] = useState<Devotee | null>(null);
  const [individualAssignments, setIndividualAssignments] = useState<Map<number, SubordinateAssignment>>(new Map());
  const [reason, setReason] = useState("");
  const [transferMode, setTransferMode] = useState<'bulk' | 'individual'>('bulk');

  // Fetch subordinates if not provided
  const { data: fetchedSubordinatesData, isLoading: isLoadingSubordinates } = useQuery({
    queryKey: ['/api/senapoti/subordinates', fromDevoteeId, 'all'],
    queryFn: () => fromDevoteeId ? api.getAllSubordinates(fromDevoteeId) : Promise.resolve({ subordinates: [], count: 0 }),
    enabled: !!fromDevoteeId && !providedSubordinates,
  });

  const subordinates = providedSubordinates || fetchedSubordinatesData?.subordinates || [];

  // Initialize selections
  useEffect(() => {
    if (subordinates.length > 0) {
      // Select all subordinates by default
      setSelectedSubordinateIds(new Set(subordinates.map(s => s.id)));
      
      // Initialize individual assignments
      const assignments = new Map<number, SubordinateAssignment>();
      subordinates.forEach(subordinate => {
        assignments.set(subordinate.id, {
          subordinate,
          selectedSupervisorId: null,
          selectedSupervisor: null,
        });
      });
      setIndividualAssignments(assignments);
    }
  }, [subordinates]);

  // Transfer mutation
  const transferMutation = useMutation({
    mutationFn: async () => {
      const subordinateIds = Array.from(selectedSubordinateIds);
      
      if (transferMode === 'bulk') {
        // Bulk transfer to single supervisor
        return api.transferSubordinates({
          fromDevoteeId,
          toDevoteeId: bulkSupervisorId ? parseInt(bulkSupervisorId) : null,
          subordinateIds,
          reason,
          districtCode,
        });
      } else {
        // Individual transfers - we need to handle multiple API calls
        const results = [];
        for (const subordinateId of Array.from(subordinateIds)) {
          const assignment = individualAssignments.get(subordinateId);
          if (assignment?.selectedSupervisorId) {
            const result = await api.transferSubordinates({
              fromDevoteeId,
              toDevoteeId: parseInt(assignment.selectedSupervisorId),
              subordinateIds: [subordinateId],
              reason,
              districtCode,
            });
            results.push(result);
          }
        }
        return {
          message: `Successfully transferred ${results.length} subordinates`,
          transferred: results.reduce((sum, r) => sum + r.transferred, 0),
          subordinates: results.flatMap(r => r.subordinates),
        };
      }
    },
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: result.message,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/senapoti"] });
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      onTransferComplete?.(result);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to transfer subordinates",
        variant: "destructive",
      });
    },
  });

  // Handle subordinate selection
  const handleSubordinateSelection = (subordinateId: number, checked: boolean) => {
    const newSelection = new Set(selectedSubordinateIds);
    if (checked) {
      newSelection.add(subordinateId);
    } else {
      newSelection.delete(subordinateId);
    }
    setSelectedSubordinateIds(newSelection);
  };

  // Handle select all/none
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubordinateIds(new Set(subordinates.map(s => s.id)));
    } else {
      setSelectedSubordinateIds(new Set());
    }
  };

  // Handle individual supervisor assignment
  const handleIndividualSupervisorAssignment = (subordinateId: number, supervisorId: string | null, supervisor: Devotee | null) => {
    const newAssignments = new Map(individualAssignments);
    const assignment = newAssignments.get(subordinateId);
    if (assignment) {
      assignment.selectedSupervisorId = supervisorId;
      assignment.selectedSupervisor = supervisor;
      newAssignments.set(subordinateId, assignment);
      setIndividualAssignments(newAssignments);
    }
  };

  // Handle bulk supervisor assignment
  const handleBulkSupervisorAssignment = (supervisorId: string | null, supervisor: Devotee | null) => {
    setBulkSupervisorId(supervisorId);
    setBulkSupervisor(supervisor);
  };

  // Validation
  const isValid = () => {
    if (selectedSubordinateIds.size === 0 || !reason.trim()) return false;
    
    if (transferMode === 'bulk') {
      return !!bulkSupervisorId;
    } else {
      // Check if all selected subordinates have supervisors assigned
      for (const subordinateId of Array.from(selectedSubordinateIds)) {
        const assignment = individualAssignments.get(subordinateId);
        if (!assignment?.selectedSupervisorId) return false;
      }
      return true;
    }
  };

  const handleSubmit = () => {
    if (!isValid()) return;
    transferMutation.mutate();
  };

  const selectedCount = selectedSubordinateIds.size;
  const totalCount = subordinates.length;

  if (isLoadingSubordinates) {
    return (
      <div className="flex items-center gap-2 p-4 border rounded-lg" data-testid="subordinate-transfer-loading">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading subordinates...</span>
      </div>
    );
  }

  if (subordinates.length === 0) {
    return (
      <Alert data-testid="subordinate-transfer-empty">
        <Info className="h-4 w-4" />
        <AlertDescription>
          No subordinates found to transfer.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4" data-testid="subordinate-transfer-interface">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Shuffle className="w-5 h-5" />
            Subordinate Transfer
          </CardTitle>
          {fromDevoteeName && (
            <p className="text-sm text-muted-foreground">
              Transferring subordinates from: <strong>{fromDevoteeName}</strong>
            </p>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {totalCount} total subordinate{totalCount !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                {selectedCount} selected
              </Badge>
            </div>
            
            {/* Transfer Mode Toggle */}
            {showIndividualAssignment && (
              <div className="flex items-center gap-2">
                <Label className="text-sm">Transfer Mode:</Label>
                <div className="flex gap-1">
                  <Button
                    variant={transferMode === 'bulk' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTransferMode('bulk')}
                    data-testid="button-bulk-mode"
                  >
                    Bulk
                  </Button>
                  <Button
                    variant={transferMode === 'individual' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTransferMode('individual')}
                    data-testid="button-individual-mode"
                  >
                    Individual
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subordinate Selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Select Subordinates</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedCount === totalCount}
                onCheckedChange={handleSelectAll}
                disabled={disabled}
                data-testid="checkbox-select-all"
              />
              <Label className="text-sm">Select All</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {subordinates.map((subordinate, index) => (
                <div key={subordinate.id}>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedSubordinateIds.has(subordinate.id)}
                        onCheckedChange={(checked) => handleSubordinateSelection(subordinate.id, checked as boolean)}
                        disabled={disabled}
                        data-testid={`checkbox-subordinate-${subordinate.id}`}
                      />
                      <div>
                        <p className="font-medium">{subordinate.legalName}</p>
                        {subordinate.name && subordinate.name !== subordinate.legalName && (
                          <p className="text-sm text-muted-foreground">({subordinate.name})</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {subordinate.leadershipRole?.replace(/_/g, ' ') || 'Member'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Individual Supervisor Assignment */}
                    {transferMode === 'individual' && selectedSubordinateIds.has(subordinate.id) && (
                      <div className="w-64">
                        <SupervisorSelectionComponent
                          districtCode={districtCode}
                          targetRole={targetRole}
                          excludeIds={[subordinate.id]}
                          selectedSupervisorId={individualAssignments.get(subordinate.id)?.selectedSupervisorId || undefined}
                          onSelect={(supervisorId, supervisor) => 
                            handleIndividualSupervisorAssignment(subordinate.id, supervisorId, supervisor)
                          }
                          showWorkloadInfo={false}
                          showHierarchyContext={false}
                          placeholder="Assign supervisor..."
                          disabled={disabled}
                        />
                      </div>
                    )}
                  </div>
                  {index < subordinates.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Bulk Supervisor Selection */}
      {transferMode === 'bulk' && selectedCount > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Select Target Supervisor</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <SupervisorSelectionComponent
              districtCode={districtCode}
              targetRole={targetRole}
              excludeIds={Array.from(selectedSubordinateIds)}
              selectedSupervisorId={bulkSupervisorId || undefined}
              onSelect={handleBulkSupervisorAssignment}
              showWorkloadInfo={true}
              showHierarchyContext={true}
              placeholder="Search and select target supervisor..."
              disabled={disabled}
            />
          </CardContent>
        </Card>
      )}

      {/* Transfer Preview */}
      {selectedCount > 0 && (transferMode === 'bulk' ? bulkSupervisor : true) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Transfer Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>{selectedCount} subordinate{selectedCount !== 1 ? 's' : ''}</strong> will be transferred:
                </AlertDescription>
              </Alert>
              
              {transferMode === 'bulk' && bulkSupervisor && (
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <span className="text-sm">All selected subordinates</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-400">{bulkSupervisor.legalName}</p>
                    <p className="text-xs text-green-600 dark:text-green-500">
                      {bulkSupervisor.leadershipRole?.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              )}
              
              {transferMode === 'individual' && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {Array.from(selectedSubordinateIds).map(subordinateId => {
                    const assignment = individualAssignments.get(subordinateId);
                    if (!assignment?.selectedSupervisor) return null;
                    
                    return (
                      <div key={subordinateId} className="flex items-center gap-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                        <span className="text-sm">{assignment.subordinate.legalName}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-400 text-sm">
                            {assignment.selectedSupervisor.legalName}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-500">
                            {assignment.selectedSupervisor.leadershipRole?.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reason for Transfer */}
      <div className="space-y-2">
        <Label htmlFor="textarea-transfer-reason">Reason for Transfer <span className="text-red-500">*</span></Label>
        <Textarea
          id="textarea-transfer-reason"
          placeholder="Provide a reason for this subordinate transfer"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          disabled={disabled}
          data-testid="textarea-transfer-reason"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={!isValid() || disabled || transferMutation.isPending}
          className="flex-1"
          data-testid="button-confirm-transfer"
        >
          {transferMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          Transfer {selectedCount} Subordinate{selectedCount !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}