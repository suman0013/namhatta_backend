import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Crown, 
  UserCheck, 
  Users, 
  MapPin, 
  ChevronDown, 
  ChevronRight,
  Building,
  Map
} from "lucide-react";
import { useState } from "react";
import type { Leader } from "@/lib/types";

const hierarchyLevels = [
  { value: "DISTRICT_SUPERVISOR", label: "District Supervisor" },
  { value: "MALA_SENAPOTI", label: "Mala Senapoti" },
  { value: "MAHA_CHAKRA_SENAPOTI", label: "Maha Chakra Senapoti" },
  { value: "CHAKRA_SENAPOTI", label: "Chakra Senapoti" },
  { value: "UPA_CHAKRA_SENAPOTI", label: "Upa Chakra Senapoti" },
];

export default function Hierarchy() {
  const { level } = useParams();
  const [selectedLevel, setSelectedLevel] = useState(level || "");
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set([1]));

  const { data: hierarchy, isLoading: hierarchyLoading } = useQuery({
    queryKey: ["/api/hierarchy"],
    queryFn: () => api.getHierarchy(),
  });

  const { data: levelLeaders, isLoading: levelLoading } = useQuery({
    queryKey: ["/api/hierarchy", selectedLevel],
    queryFn: () => api.getLeadersByLevel(selectedLevel),
    enabled: !!selectedLevel,
  });

  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  if (hierarchyLoading) {
    return <HierarchySkeleton />;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organization Hierarchy</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage the organizational structure and leadership roles
          </p>
        </div>
        <div className="flex space-x-3">
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-64 glass border-0">
              <SelectValue placeholder="Select hierarchy level to view" />
            </SelectTrigger>
            <SelectContent>
              {hierarchyLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hierarchy Tree */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="mr-2 h-5 w-5" />
                Leadership Tree
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* GBC Level */}
              {hierarchy?.gbc?.map((leader) => (
                <HierarchyNode
                  key={leader.id}
                  leader={leader}
                  level={0}
                  isExpanded={expandedNodes.has(leader.id)}
                  onToggle={() => toggleNode(leader.id)}
                  hasChildren={true}
                >
                  {/* Regional Directors */}
                  {expandedNodes.has(leader.id) && hierarchy?.regionalDirectors?.map((director) => (
                    <HierarchyNode
                      key={director.id}
                      leader={director}
                      level={1}
                      isExpanded={expandedNodes.has(director.id)}
                      onToggle={() => toggleNode(director.id)}
                      hasChildren={true}
                    >
                      {/* Co-Regional Directors */}
                      {expandedNodes.has(director.id) && hierarchy?.coRegionalDirectors?.map((coDirector) => (
                        <HierarchyNode
                          key={coDirector.id}
                          leader={coDirector}
                          level={2}
                          isExpanded={false}
                          onToggle={() => {}}
                          hasChildren={false}
                        />
                      ))}
                    </HierarchyNode>
                  ))}
                </HierarchyNode>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Level Details */}
        <div className="space-y-6">
          {/* Hierarchy Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Hierarchy Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">GBC Members</span>
                <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                  {hierarchy?.gbc?.length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Regional Directors</span>
                <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                  {hierarchy?.regionalDirectors?.length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Co-Regional Directors</span>
                <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                  {hierarchy?.coRegionalDirectors?.length || 0}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Selected Level Leaders */}
          {selectedLevel && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  {hierarchyLevels.find(l => l.value === selectedLevel)?.label || "Selected Level"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {levelLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : levelLeaders && levelLeaders.length > 0 ? (
                  <div className="space-y-3">
                    {levelLeaders.map((leader) => (
                      <LeaderCard key={leader.id} leader={leader} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No leaders found at this level
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function HierarchyNode({ 
  leader, 
  level, 
  isExpanded, 
  onToggle, 
  hasChildren, 
  children 
}: {
  leader: Leader;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  hasChildren: boolean;
  children?: React.ReactNode;
}) {
  const getNodeStyle = (level: number) => {
    switch (level) {
      case 0:
        return "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200/50 dark:border-purple-700/50";
      case 1:
        return "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200/50 dark:border-blue-700/50";
      case 2:
        return "glass border-gray-200/50 dark:border-slate-600/50";
      default:
        return "glass border-gray-200/50 dark:border-slate-600/50";
    }
  };

  const getIconStyle = (level: number) => {
    switch (level) {
      case 0:
        return "bg-gradient-to-br from-purple-500 to-indigo-600";
      case 1:
        return "bg-gradient-to-br from-blue-500 to-cyan-600";
      case 2:
        return "bg-gradient-to-br from-teal-400 to-green-500";
      default:
        return "bg-gradient-to-br from-gray-400 to-gray-600";
    }
  };

  const getIcon = (level: number) => {
    switch (level) {
      case 0:
        return Crown;
      case 1:
      case 2:
        return UserCheck;
      default:
        return Users;
    }
  };

  const Icon = getIcon(level);

  return (
    <div className={`ml-${level * 6}`}>
      <div className={`flex items-center space-x-4 p-4 rounded-xl border ${getNodeStyle(level)}`}>
        {hasChildren && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        
        <div className={`w-${level === 0 ? '12' : level === 1 ? '10' : '8'} h-${level === 0 ? '12' : level === 1 ? '10' : '8'} ${getIconStyle(level)} rounded-${level === 0 ? 'xl' : 'lg'} flex items-center justify-center`}>
          <Icon className={`h-${level === 0 ? '6' : level === 1 ? '5' : '4'} w-${level === 0 ? '6' : level === 1 ? '5' : '4'} text-white`} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">{leader.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{leader.role.replace(/_/g, ' ')}</p>
          {leader.location && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
              <MapPin className="mr-1 h-3 w-3" />
              <span>
                {[
                  leader.location.district,
                  leader.location.state,
                  leader.location.country
                ].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {children && isExpanded && (
        <div className="mt-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

function LeaderCard({ leader }: { leader: Leader }) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg glass border border-gray-200/50 dark:border-slate-600/50">
      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg flex items-center justify-center">
        <UserCheck className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{leader.name}</h4>
        {leader.location && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {[
              leader.location.district,
              leader.location.state
            ].filter(Boolean).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

function HierarchySkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
