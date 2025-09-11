import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Users, Shield, UserCheck, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import type { Devotee, Namhatta } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";

type LeadershipRole = 
  | "MALA_SENAPOTI"
  | "MAHA_CHAKRA_SENAPOTI"
  | "CHAKRA_SENAPOTI"
  | "UPA_CHAKRA_SENAPOTI";

interface LeadershipAssignment {
  leadershipRole: LeadershipRole;
  reportingToDevoteeId?: number;
  hasSystemAccess: boolean;
}

const LEADERSHIP_ROLES: { value: LeadershipRole; label: string; description: string }[] = [
  { value: "MALA_SENAPOTI", label: "Mala Senapoti", description: "Senior leadership position" },
  { value: "MAHA_CHAKRA_SENAPOTI", label: "Maha Chakra Senapoti", description: "Senior chakra leadership" },
  { value: "CHAKRA_SENAPOTI", label: "Chakra Senapoti", description: "Chakra leadership" },
  { value: "UPA_CHAKRA_SENAPOTI", label: "Upa Chakra Senapoti", description: "Assistant chakra leadership" },
];

export default function Leadership() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDevotee, setSelectedDevotee] = useState<Devotee | null>(null);
  const [newAssignment, setNewAssignment] = useState<Partial<LeadershipAssignment>>({});

  // Fetch devotees and namhattas
  const { data: devoteesData, isLoading: devoteesLoading } = useQuery({
    queryKey: ["/api/devotees"],
    queryFn: () => api.getDevotees(1, 1000),
  });

  const { data: namhattasData, isLoading: namhattasLoading } = useQuery({
    queryKey: ["/api/namhattas"],
    queryFn: () => api.getNamhattas(1, 1000),
  });

  const devotees = devoteesData?.data || [];
  const namhattas = namhattasData?.data || [];

  // Filter devotees based on search and role
  const filteredDevotees = devotees.filter((devotee: Devotee) => {
    const matchesSearch = !searchTerm || 
      (devotee.name && devotee.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (devotee.legalName && devotee.legalName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (devotee.email && devotee.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === "all" || devotee.leadershipRole === roleFilter || (roleFilter === "DEVOTEE" && !devotee.leadershipRole);
    
    return matchesSearch && matchesRole;
  });

  // Get leadership statistics
  const leadershipStats = {
    totalLeaders: devotees.filter((d: Devotee) => d.leadershipRole).length,
    malaSenapotis: devotees.filter((d: Devotee) => d.leadershipRole === "MALA_SENAPOTI").length,
    mahaChakraSenapotis: devotees.filter((d: Devotee) => d.leadershipRole === "MAHA_CHAKRA_SENAPOTI").length,
    withSystemAccess: devotees.filter((d: Devotee) => d.hasSystemAccess).length,
  };

  // Assign leadership role mutation
  const assignLeadershipMutation = useMutation({
    mutationFn: async ({ devoteeId, assignment }: { devoteeId: number; assignment: LeadershipAssignment }) => {
      // Use the dedicated API endpoint for leadership role assignment
      return await api.assignLeadershipRole(devoteeId, assignment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/namhattas"] });
      setIsAssignDialogOpen(false);
      setSelectedDevotee(null);
      setNewAssignment({});
      toast({
        title: "Success",
        description: "Leadership role assigned successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign leadership role",
        variant: "destructive",
      });
    },
  });

  const handleAssignRole = () => {
    if (!selectedDevotee || !newAssignment.leadershipRole) return;
    
    assignLeadershipMutation.mutate({
      devoteeId: selectedDevotee.id,
      assignment: {
        leadershipRole: newAssignment.leadershipRole,
        reportingToDevoteeId: newAssignment.reportingToDevoteeId,
        hasSystemAccess: newAssignment.hasSystemAccess || false,
      },
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "DISTRICT_SUPERVISOR":
      case "REGIONAL_SUPERVISOR":
        return "default";
      case "MALA_SENAPOTI":
      case "MAHA_CHAKRA_SENAPOTI":
        return "secondary";
      case "CHAKRA_SENAPOTI":
      case "UPA_CHAKRA_SENAPOTI":
        return "outline";
      default:
        return "secondary";
    }
  };

  if (devoteesLoading || namhattasLoading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading leadership data...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Leadership Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage leadership roles and responsibilities across the organization
          </p>
        </div>
        
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-assign-leadership">
              <Plus className="h-4 w-4 mr-2" />
              Assign Leadership
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Assign Leadership Role
              </DialogTitle>
            </DialogHeader>
            
            {selectedDevotee && (
              <div className="space-y-4">
                <div>
                  <Label>Devotee</Label>
                  <div className="p-2 bg-muted rounded-md" data-testid="text-selected-devotee">
                    {selectedDevotee.name || selectedDevotee.legalName} ({selectedDevotee.email})
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="leadershipRole">Leadership Role *</Label>
                  <Select
                    value={newAssignment.leadershipRole || ""}
                    onValueChange={(value) => setNewAssignment(prev => ({ ...prev, leadershipRole: value as LeadershipRole }))}
                  >
                    <SelectTrigger data-testid="select-assignment-role">
                      <SelectValue placeholder="Select a leadership role" />
                    </SelectTrigger>
                    <SelectContent>
                      {LEADERSHIP_ROLES.map(role => (
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
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="systemAccess"
                    checked={newAssignment.hasSystemAccess || false}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, hasSystemAccess: e.target.checked }))}
                    data-testid="checkbox-system-access"
                  />
                  <Label htmlFor="systemAccess">Grant system access</Label>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAssignDialogOpen(false)}
                    data-testid="button-cancel-assignment"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignRole}
                    disabled={!newAssignment.leadershipRole || assignLeadershipMutation.isPending}
                    data-testid="button-save-assignment"
                  >
                    {assignLeadershipMutation.isPending ? "Assigning..." : "Assign Role"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leaders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-leaders">{leadershipStats.totalLeaders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mala Senapotis</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-mala-senapotis">{leadershipStats.malaSenapotis}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maha Chakra Senapotis</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-maha-chakra-senapotis">{leadershipStats.mahaChakraSenapotis}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Access</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-system-access">{leadershipStats.withSystemAccess}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Leadership Directory</CardTitle>
          <CardDescription>
            Search and filter devotees to manage their leadership roles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-devotees"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-role-filter">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="DEVOTEE">Devotees</SelectItem>
                {LEADERSHIP_ROLES.map(role => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Separator />
          
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredDevotees.map((devotee: Devotee) => (
                <div key={devotee.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`card-devotee-${devotee.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium" data-testid={`text-devotee-name-${devotee.id}`}>
                        {devotee.name || devotee.legalName}
                      </span>
                      {devotee.leadershipRole && (
                        <Badge variant={getRoleBadgeVariant(devotee.leadershipRole)} data-testid={`badge-role-${devotee.id}`}>
                          {LEADERSHIP_ROLES.find(r => r.value === devotee.leadershipRole)?.label || devotee.leadershipRole}
                        </Badge>
                      )}
                      {devotee.hasSystemAccess && (
                        <Badge variant="outline" className="text-green-600" data-testid={`badge-system-access-${devotee.id}`}>
                          System Access
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid={`text-devotee-email-${devotee.id}`}>
                      {devotee.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDevotee(devotee);
                      setNewAssignment({
                        leadershipRole: devotee.leadershipRole as LeadershipRole,
                        hasSystemAccess: devotee.hasSystemAccess || false,
                      });
                      setIsAssignDialogOpen(true);
                    }}
                    data-testid={`button-edit-devotee-${devotee.id}`}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {filteredDevotees.length === 0 && (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-devotees">
                  No devotees found matching your criteria
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

    </div>
  );
}