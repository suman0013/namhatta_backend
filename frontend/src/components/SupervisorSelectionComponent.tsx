import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Users, 
  User, 
  ChevronRight, 
  Crown,
  Shield,
  Star,
  Circle,
  Loader2,
  AlertTriangle
} from "lucide-react";
import type { Devotee } from "@/lib/types";

interface SupervisorSelectionComponentProps {
  districtCode: string;
  targetRole: string;
  excludeIds?: number[];
  selectedSupervisorId?: string;
  onSelect: (supervisorId: string | null, supervisor: Devotee | null) => void;
  showWorkloadInfo?: boolean;
  showHierarchyContext?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

interface SupervisorWithWorkload extends Devotee {
  subordinateCount?: number;
  workloadLevel?: 'low' | 'medium' | 'high';
  hierarchyLevel?: number;
}

const ROLE_HIERARCHY = {
  'DISTRICT_SUPERVISOR': { level: 0, icon: Crown, color: 'text-purple-600' },
  'MALA_SENAPOTI': { level: 1, icon: Shield, color: 'text-blue-600' },
  'MAHA_CHAKRA_SENAPOTI': { level: 2, icon: Star, color: 'text-green-600' },
  'CHAKRA_SENAPOTI': { level: 3, icon: Circle, color: 'text-yellow-600' },
  'UPA_CHAKRA_SENAPOTI': { level: 4, icon: User, color: 'text-gray-600' },
};

export default function SupervisorSelectionComponent({
  districtCode,
  targetRole,
  excludeIds = [],
  selectedSupervisorId,
  onSelect,
  showWorkloadInfo = true,
  showHierarchyContext = true,
  placeholder = "Search supervisors...",
  disabled = false,
}: SupervisorSelectionComponentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState<SupervisorWithWorkload | null>(null);

  // Fetch available supervisors
  const { data: availableSupervisors, isLoading, error } = useQuery({
    queryKey: ['/api/senapoti/available-supervisors', districtCode, targetRole, excludeIds],
    queryFn: () => api.getAvailableSupervisors(districtCode, targetRole, excludeIds),
    enabled: !!districtCode && !!targetRole,
  });

  // Fetch subordinate counts for workload information
  const { data: subordinateCounts } = useQuery({
    queryKey: ['/api/senapoti/subordinate-counts', availableSupervisors?.map(s => s.id)],
    queryFn: async () => {
      if (!availableSupervisors || !showWorkloadInfo) return {};
      
      const counts: Record<number, number> = {};
      await Promise.all(
        availableSupervisors.map(async (supervisor) => {
          try {
            const result = await api.getDirectSubordinates(supervisor.id);
            counts[supervisor.id] = result.count;
          } catch {
            counts[supervisor.id] = 0;
          }
        })
      );
      return counts;
    },
    enabled: !!availableSupervisors && showWorkloadInfo,
  });

  // Enhanced supervisors with workload and hierarchy info
  const enhancedSupervisors: SupervisorWithWorkload[] = availableSupervisors?.map(supervisor => {
    const subordinateCount = subordinateCounts?.[supervisor.id] || 0;
    const hierarchyInfo = ROLE_HIERARCHY[supervisor.leadershipRole as keyof typeof ROLE_HIERARCHY];
    
    // Calculate workload level
    let workloadLevel: 'low' | 'medium' | 'high' = 'low';
    if (subordinateCount > 10) workloadLevel = 'high';
    else if (subordinateCount > 5) workloadLevel = 'medium';

    return {
      ...supervisor,
      subordinateCount,
      workloadLevel,
      hierarchyLevel: hierarchyInfo?.level || 999,
    };
  }) || [];

  // Filter supervisors based on search term
  const filteredSupervisors = enhancedSupervisors.filter(supervisor =>
    supervisor.legalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supervisor.name && supervisor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supervisor.leadershipRole && supervisor.leadershipRole.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort by hierarchy level, then by workload (lower is better)
  const sortedSupervisors = filteredSupervisors.sort((a, b) => {
    if (a.hierarchyLevel !== b.hierarchyLevel) {
      return (a.hierarchyLevel || 999) - (b.hierarchyLevel || 999);
    }
    return (a.subordinateCount || 0) - (b.subordinateCount || 0);
  });

  // Handle supervisor selection
  const handleSelectSupervisor = (supervisor: SupervisorWithWorkload | null) => {
    setSelectedSupervisor(supervisor);
    onSelect(supervisor?.id.toString() || null, supervisor);
  };

  // Update selected supervisor when prop changes
  useEffect(() => {
    if (selectedSupervisorId) {
      const supervisor = enhancedSupervisors.find(s => s.id.toString() === selectedSupervisorId);
      setSelectedSupervisor(supervisor || null);
    } else {
      setSelectedSupervisor(null);
    }
  }, [selectedSupervisorId, enhancedSupervisors]);

  // Get role icon and color
  const getRoleIcon = (role: string) => {
    const roleInfo = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY];
    if (!roleInfo) return { Icon: User, color: 'text-gray-600' };
    return { Icon: roleInfo.icon, color: roleInfo.color };
  };

  // Get workload badge variant
  const getWorkloadBadge = (level: 'low' | 'medium' | 'high', count: number) => {
    const variants = {
      low: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
      high: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400',
    };
    return { variant: variants[level], text: `${count} subordinates` };
  };

  if (isLoading) {
    return (
      <div className="space-y-2" data-testid="supervisor-selection-loading">
        <Label>Supervisor Selection</Label>
        <div className="flex items-center gap-2 p-4 border rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading available supervisors...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2" data-testid="supervisor-selection-error">
        <Label>Supervisor Selection</Label>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load supervisors. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!availableSupervisors || availableSupervisors.length === 0) {
    return (
      <div className="space-y-2" data-testid="supervisor-selection-empty">
        <Label>Supervisor Selection</Label>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No available supervisors found for role "{targetRole}" in district {districtCode}.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="supervisor-selection">
      <Label>Supervisor Selection</Label>
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          disabled={disabled}
          data-testid="input-supervisor-search"
        />
      </div>

      {/* Selected Supervisor Display */}
      {selectedSupervisor && (
        <Card className="border-primary/20 bg-primary/5" data-testid="selected-supervisor">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4" />
              Selected Supervisor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedSupervisor.legalName}</p>
                {selectedSupervisor.name && selectedSupervisor.name !== selectedSupervisor.legalName && (
                  <p className="text-sm text-muted-foreground">({selectedSupervisor.name})</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {(() => {
                    const { Icon, color } = getRoleIcon(selectedSupervisor.leadershipRole || '');
                    return <Icon className={`w-3 h-3 ${color}`} />;
                  })()}
                  <span className="text-xs text-muted-foreground">
                    {selectedSupervisor.leadershipRole?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
              {showWorkloadInfo && selectedSupervisor.subordinateCount !== undefined && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {selectedSupervisor.subordinateCount}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSelectSupervisor(null)}
              className="mt-2"
              data-testid="button-clear-supervisor"
            >
              Clear Selection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Supervisor List */}
      {!selectedSupervisor && (
        <Card data-testid="supervisor-list">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Available Supervisors ({filteredSupervisors.length})</span>
              {showHierarchyContext && (
                <Badge variant="secondary" className="text-xs">
                  District: {districtCode}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {sortedSupervisors.map((supervisor, index) => {
                  const { Icon, color } = getRoleIcon(supervisor.leadershipRole || '');
                  const workloadBadge = showWorkloadInfo && supervisor.subordinateCount !== undefined 
                    ? getWorkloadBadge(supervisor.workloadLevel || 'low', supervisor.subordinateCount)
                    : null;

                  return (
                    <div key={supervisor.id}>
                      <button
                        className="w-full p-3 text-left border rounded-lg hover:bg-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handleSelectSupervisor(supervisor)}
                        disabled={disabled}
                        data-testid={`button-select-supervisor-${supervisor.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${color}`} />
                              <span className="font-medium">{supervisor.legalName}</span>
                            </div>
                            {supervisor.name && supervisor.name !== supervisor.legalName && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Initiated: {supervisor.name}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {supervisor.leadershipRole?.replace(/_/g, ' ')}
                              </span>
                              {showHierarchyContext && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    Level {supervisor.hierarchyLevel}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {workloadBadge && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${workloadBadge.variant}`}
                              >
                                <Users className="w-3 h-3 mr-1" />
                                {supervisor.subordinateCount}
                              </Badge>
                            )}
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </button>
                      {index < sortedSupervisors.length - 1 && <Separator className="my-1" />}
                    </div>
                  );
                })}
                
                {filteredSupervisors.length === 0 && searchTerm && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No supervisors found matching "{searchTerm}"
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Hierarchy Context Info */}
      {showHierarchyContext && (
        <div className="text-xs text-muted-foreground">
          <p>Supervisors are sorted by hierarchy level and current workload.</p>
          <p>Lower hierarchy levels and fewer subordinates are recommended for better distribution.</p>
        </div>
      )}
    </div>
  );
}