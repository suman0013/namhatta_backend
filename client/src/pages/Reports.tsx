import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, MapPin, Users, Home, BarChart3, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";

interface VillageData {
  name: string;
  subDistrict: string;
  namhattaCount: number;
  devoteeCount: number;
}

interface SubDistrictData {
  name: string;
  district: string;
  namhattaCount: number;
  devoteeCount: number;
  villages: VillageData[];
}

interface DistrictData {
  name: string;
  state: string;
  namhattaCount: number;
  devoteeCount: number;
  subDistricts: SubDistrictData[];
}

interface StateData {
  name: string;
  country: string;
  namhattaCount: number;
  devoteeCount: number;
  districts: DistrictData[];
}

interface HierarchicalReportsData {
  states: StateData[];
}

export default function Reports() {
  const { user } = useAuth();
  const [openStates, setOpenStates] = useState<Set<string>>(new Set());
  const [openDistricts, setOpenDistricts] = useState<Set<string>>(new Set());
  const [openSubDistricts, setOpenSubDistricts] = useState<Set<string>>(new Set());

  const { data: reportsData, isLoading, error, refetch, isFetching } = useQuery<HierarchicalReportsData>({
    queryKey: ["/api/reports/hierarchical"],
    staleTime: 0, // Override global settings to always consider data stale
    refetchOnWindowFocus: true, // Override global settings to refetch on focus
  });

  const handleRefresh = async () => {
    // Invalidate the cache and trigger a fresh fetch
    await queryClient.invalidateQueries({ queryKey: ["/api/reports/hierarchical"] });
    refetch();
  };

  const toggleState = (stateName: string) => {
    const newOpenStates = new Set(openStates);
    if (newOpenStates.has(stateName)) {
      newOpenStates.delete(stateName);
    } else {
      newOpenStates.add(stateName);
    }
    setOpenStates(newOpenStates);
  };

  const toggleDistrict = (districtKey: string) => {
    const newOpenDistricts = new Set(openDistricts);
    if (newOpenDistricts.has(districtKey)) {
      newOpenDistricts.delete(districtKey);
    } else {
      newOpenDistricts.add(districtKey);
    }
    setOpenDistricts(newOpenDistricts);
  };

  const toggleSubDistrict = (subDistrictKey: string) => {
    const newOpenSubDistricts = new Set(openSubDistricts);
    if (newOpenSubDistricts.has(subDistrictKey)) {
      newOpenSubDistricts.delete(subDistrictKey);
    } else {
      newOpenSubDistricts.add(subDistrictKey);
    }
    setOpenSubDistricts(newOpenSubDistricts);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6" data-testid="reports-loading">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Hierarchical Reports</h1>
              <p className="text-muted-foreground">Geographic breakdown of Namhattas and Devotees</p>
            </div>
          </div>
          
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6" data-testid="reports-error">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load hierarchical reports. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalNamhattas = reportsData?.states.reduce((sum, state) => sum + state.namhattaCount, 0) || 0;
  const totalDevotees = reportsData?.states.reduce((sum, state) => sum + state.devoteeCount, 0) || 0;

  return (
    <div className="container mx-auto p-6" data-testid="reports-page">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Hierarchical Reports
            </h1>
            <p className="text-muted-foreground">
              Geographic breakdown of Namhattas and Devotees
              {user?.role === 'DISTRICT_SUPERVISOR' && (
                <span className="ml-2 text-sm text-orange-600 dark:text-orange-400">
                  (Filtered to your assigned districts)
                </span>
              )}
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2" disabled={isFetching} data-testid="refresh-reports">
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total States</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-states">{reportsData?.states.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Namhattas</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-namhattas">{totalNamhattas}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Devotees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="total-devotees">{totalDevotees}</div>
            </CardContent>
          </Card>
        </div>

        {/* States List */}
        <div className="space-y-4">
          {reportsData?.states.map((state) => {
            const stateKey = `${state.name}_${state.country}`;
            const isStateOpen = openStates.has(stateKey);
            
            return (
              <Card key={stateKey} className="overflow-hidden">
                <Collapsible open={isStateOpen} onOpenChange={() => toggleState(stateKey)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors" data-testid={`state-header-${state.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Button variant="ghost" size="sm" className="p-0 h-auto">
                            {isStateOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                          <div>
                            <CardTitle className="text-lg">{state.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{state.country}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <div className="text-center">
                            <Badge variant="secondary" className="mb-1">
                              <Home className="h-3 w-3 mr-1" />
                              {state.namhattaCount}
                            </Badge>
                            <p className="text-xs text-muted-foreground">Namhattas</p>
                          </div>
                          <div className="text-center">
                            <Badge variant="outline" className="mb-1">
                              <Users className="h-3 w-3 mr-1" />
                              {state.devoteeCount}
                            </Badge>
                            <p className="text-xs text-muted-foreground">Devotees</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-3 ml-6">
                        {state.districts.map((district) => {
                          const districtKey = `${district.name}_${district.state}`;
                          const isDistrictOpen = openDistricts.has(districtKey);
                          
                          return (
                            <Card key={districtKey} className="border-l-4 border-l-primary/20">
                              <Collapsible open={isDistrictOpen} onOpenChange={() => toggleDistrict(districtKey)}>
                                <CollapsibleTrigger asChild>
                                  <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors py-3" data-testid={`district-header-${district.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="sm" className="p-0 h-auto">
                                          {isDistrictOpen ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </Button>
                                        <div>
                                          <CardTitle className="text-base">{district.name}</CardTitle>
                                          <p className="text-xs text-muted-foreground">District</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-3">
                                        <Badge variant="secondary" className="text-xs">
                                          <Home className="h-3 w-3 mr-1" />
                                          {district.namhattaCount}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          <Users className="h-3 w-3 mr-1" />
                                          {district.devoteeCount}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardHeader>
                                </CollapsibleTrigger>
                                
                                <CollapsibleContent>
                                  <CardContent className="pt-0">
                                    <div className="space-y-2 ml-6">
                                      {district.subDistricts.map((subDistrict) => {
                                        const subDistrictKey = `${subDistrict.name}_${subDistrict.district}`;
                                        const isSubDistrictOpen = openSubDistricts.has(subDistrictKey);
                                        
                                        return (
                                          <Card key={subDistrictKey} className="border-l-4 border-l-secondary/30">
                                            <Collapsible open={isSubDistrictOpen} onOpenChange={() => toggleSubDistrict(subDistrictKey)}>
                                              <CollapsibleTrigger asChild>
                                                <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors py-2" data-testid={`subdistrict-header-${subDistrict.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                                  <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                                                        {isSubDistrictOpen ? (
                                                          <ChevronDown className="h-3 w-3" />
                                                        ) : (
                                                          <ChevronRight className="h-3 w-3" />
                                                        )}
                                                      </Button>
                                                      <div>
                                                        <CardTitle className="text-sm">{subDistrict.name}</CardTitle>
                                                        <p className="text-xs text-muted-foreground">Sub-District</p>
                                                      </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                      <Badge variant="secondary" className="text-xs">
                                                        <Home className="h-2 w-2 mr-1" />
                                                        {subDistrict.namhattaCount}
                                                      </Badge>
                                                      <Badge variant="outline" className="text-xs">
                                                        <Users className="h-2 w-2 mr-1" />
                                                        {subDistrict.devoteeCount}
                                                      </Badge>
                                                    </div>
                                                  </div>
                                                </CardHeader>
                                              </CollapsibleTrigger>
                                              
                                              <CollapsibleContent>
                                                <CardContent className="pt-0">
                                                  <div className="space-y-1 ml-6">
                                                    {subDistrict.villages.map((village) => (
                                                      <div key={`${village.name}_${village.subDistrict}`} 
                                                           className="flex items-center justify-between p-2 rounded border bg-muted/30"
                                                           data-testid={`village-item-${village.name.toLowerCase().replace(/\s+/g, '-')}`}>
                                                        <div>
                                                          <p className="text-sm font-medium">{village.name}</p>
                                                          <p className="text-xs text-muted-foreground">Village</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                          <Badge variant="secondary" className="text-xs">
                                                            <Home className="h-2 w-2 mr-1" />
                                                            {village.namhattaCount}
                                                          </Badge>
                                                          <Badge variant="outline" className="text-xs">
                                                            <Users className="h-2 w-2 mr-1" />
                                                            {village.devoteeCount}
                                                          </Badge>
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </CardContent>
                                              </CollapsibleContent>
                                            </Collapsible>
                                          </Card>
                                        );
                                      })}
                                    </div>
                                  </CardContent>
                                </CollapsibleContent>
                              </Collapsible>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>

        {(!reportsData?.states || reportsData.states.length === 0) && (
          <Card>
            <CardContent className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                No geographic data found for your access level.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}