import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, MapPin, Users, Home, BarChart3, RefreshCw, Loader2, TrendingUp, Building2, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";

interface StateData {
  name: string;
  country: string;
  namhattaCount: number;
  devoteeCount: number;
}

interface DistrictData {
  name: string;
  state: string;
  namhattaCount: number;
  devoteeCount: number;
}

interface SubDistrictData {
  name: string;
  district: string;
  namhattaCount: number;
  devoteeCount: number;
}

interface VillageData {
  name: string;
  subDistrict: string;
  namhattaCount: number;
  devoteeCount: number;
}

export default function Reports() {
  const { user } = useAuth();
  const [openStates, setOpenStates] = useState<Set<string>>(new Set());
  const [openDistricts, setOpenDistricts] = useState<Set<string>>(new Set());
  const [openSubDistricts, setOpenSubDistricts] = useState<Set<string>>(new Set());

  // Query to fetch all states
  const { data: statesData, isLoading: statesLoading, error: statesError, refetch: refetchStates, isFetching: statesFetching } = useQuery<StateData[]>({
    queryKey: ["/api/reports/states"],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const handleRefresh = async () => {
    // Invalidate all cached data and refetch states
    await queryClient.invalidateQueries({ queryKey: ["/api/reports/states"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/reports/districts"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/reports/sub-districts"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/reports/villages"] });
    refetchStates();
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

  if (statesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white" data-testid="reports-loading">
        <div className="container mx-auto p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto mb-3"></div>
                <p className="text-purple-200">Loading Reports...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (statesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white" data-testid="reports-error">
        <div className="container mx-auto p-4">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <BarChart3 className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-red-300 mb-2">Error Loading Reports</h2>
            <p className="text-red-200 mb-4">Failed to load data. Please try again.</p>
            <Button onClick={handleRefresh} variant="outline" className="bg-red-600 hover:bg-red-700 border-red-500">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalNamhattas = statesData?.reduce((sum, state) => sum + state.namhattaCount, 0) || 0;
  const totalDevotees = statesData?.reduce((sum, state) => sum + state.devoteeCount, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white" data-testid="reports-page">
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Hierarchical Reports</h1>
                <p className="text-purple-200 text-sm">
                  Geographic breakdown • {statesData?.length || 0} states • {totalNamhattas} centers • {totalDevotees} devotees
                  {user?.role === 'DISTRICT_SUPERVISOR' && <span className="ml-2 text-orange-300">🔒 District-filtered</span>}
                </p>
              </div>
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              className="bg-purple-700/50 border-purple-500 hover:bg-purple-600 text-white" 
              disabled={statesFetching} 
              data-testid="refresh-reports"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${statesFetching ? 'animate-spin' : ''}`} />
              {statesFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Compact States List */}
          <div className="space-y-2">
            {statesData?.map((state) => {
              const stateKey = `${state.name}_${state.country}`;
              const isStateOpen = openStates.has(stateKey);
              
              return (
                <StateCard 
                  key={stateKey}
                  state={state}
                  isOpen={isStateOpen}
                  onToggle={() => toggleState(stateKey)}
                  openDistricts={openDistricts}
                  onToggleDistrict={toggleDistrict}
                  openSubDistricts={openSubDistricts}
                  onToggleSubDistrict={toggleSubDistrict}
                />
              );
            })}
          </div>

          {(!statesData || statesData.length === 0) && (
            <div className="text-center py-8">
              <MapPin className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-purple-200 mb-2">No Data Available</h3>
              <p className="text-purple-300 text-sm">No geographic data found for your access level.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// State Card Component with lazy loading for districts
function StateCard({ 
  state, 
  isOpen, 
  onToggle, 
  openDistricts, 
  onToggleDistrict,
  openSubDistricts,
  onToggleSubDistrict 
}: {
  state: StateData;
  isOpen: boolean;
  onToggle: () => void;
  openDistricts: Set<string>;
  onToggleDistrict: (key: string) => void;
  openSubDistricts: Set<string>;
  onToggleSubDistrict: (key: string) => void;
}) {
  // Only fetch districts when state is opened
  const { data: districtsData, isLoading: districtsLoading } = useQuery<DistrictData[]>({
    queryKey: [`/api/reports/districts/${encodeURIComponent(state.name)}`],
    enabled: isOpen, // Only fetch when state is expanded
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <div className="border-l-4 border-purple-500 bg-slate-800/50 backdrop-blur-sm rounded-r-lg hover:bg-slate-800/70 transition-all">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-700/50 transition-colors" data-testid={`state-header-${state.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex items-center gap-3">
              <div className="text-purple-400">
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
              <Globe className="h-4 w-4 text-purple-400" />
              <span className="text-white font-semibold">{state.name}</span>
              <span className="text-purple-300 text-sm">({state.country})</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-green-400">
                <Building2 className="h-3 w-3" />
                <span className="text-sm font-medium">{state.namhattaCount}</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <Users className="h-3 w-3" />
                <span className="text-sm font-medium">{state.devoteeCount}</span>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="pl-8 pb-2">
            {districtsLoading ? (
              <div className="flex items-center gap-2 py-3 text-purple-300">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : districtsData?.length === 0 ? (
              <div className="text-purple-400 text-sm py-2">No districts found</div>
            ) : (
              districtsData?.map((district) => (
                <DistrictCard 
                  key={`${district.name}_${district.state}`}
                  district={district}
                  isOpen={openDistricts.has(`${district.name}_${district.state}`)}
                  onToggle={() => onToggleDistrict(`${district.name}_${district.state}`)}
                  openSubDistricts={openSubDistricts}
                  onToggleSubDistrict={onToggleSubDistrict}
                />
              ))
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// District Card Component with lazy loading for sub-districts  
function DistrictCard({ 
  district, 
  isOpen, 
  onToggle,
  openSubDistricts,
  onToggleSubDistrict 
}: {
  district: DistrictData;
  isOpen: boolean;
  onToggle: () => void;
  openSubDistricts: Set<string>;
  onToggleSubDistrict: (key: string) => void;
}) {
  // Only fetch sub-districts when district is opened
  const { data: subDistrictsData, isLoading: subDistrictsLoading } = useQuery<SubDistrictData[]>({
    queryKey: [`/api/reports/sub-districts/${encodeURIComponent(district.state)}/${encodeURIComponent(district.name)}`],
    enabled: isOpen, // Only fetch when district is expanded
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <Card className="border-0 border-l-4 border-l-green-400 dark:border-l-green-600 shadow-md hover:shadow-lg transition-all duration-300 bg-white/90 dark:bg-gray-800/90">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 cursor-pointer transition-all duration-300 py-4" data-testid={`district-header-${district.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-md shadow-sm">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-white" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100">{district.name}</CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    District
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 text-xs px-2 py-1">
                  <Building2 className="h-3 w-3 mr-1" />
                  {district.namhattaCount}
                </Badge>
                <Badge variant="outline" className="border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 text-xs px-2 py-1">
                  <Users className="h-3 w-3 mr-1" />
                  {district.devoteeCount}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-br from-green-50/30 to-emerald-50/30 dark:from-green-900/10 dark:to-emerald-900/10">
            <div className="space-y-3 p-3">
              {subDistrictsLoading ? (
                <div className="flex items-center justify-center gap-2 py-6">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Loading sub-districts...</span>
                </div>
              ) : subDistrictsData?.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                    <MapPin className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No sub-districts found for {district.name}</p>
                </div>
              ) : (
                subDistrictsData?.map((subDistrict) => (
                  <SubDistrictCard 
                    key={`${subDistrict.name}_${subDistrict.district}`}
                    subDistrict={subDistrict}
                    isOpen={openSubDistricts.has(`${subDistrict.name}_${subDistrict.district}`)}
                    onToggle={() => onToggleSubDistrict(`${subDistrict.name}_${subDistrict.district}`)}
                    districtState={district.state}
                  />
                ))
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Sub-District Card Component with lazy loading for villages
function SubDistrictCard({ 
  subDistrict, 
  isOpen, 
  onToggle,
  districtState 
}: {
  subDistrict: SubDistrictData;
  isOpen: boolean;
  onToggle: () => void;
  districtState: string;
}) {
  // Only fetch villages when sub-district is opened
  const { data: villagesData, isLoading: villagesLoading } = useQuery<VillageData[]>({
    queryKey: [`/api/reports/villages/${encodeURIComponent(districtState)}/${encodeURIComponent(subDistrict.district)}/${encodeURIComponent(subDistrict.name)}`],
    enabled: isOpen, // Only fetch when sub-district is expanded
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return (
    <Card className="border-0 border-l-4 border-l-orange-400 dark:border-l-orange-600 shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 dark:bg-gray-800/80">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-orange-900/20 dark:hover:to-amber-900/20 cursor-pointer transition-all duration-300 py-3" data-testid={`subdistrict-header-${subDistrict.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1 bg-gradient-to-br from-orange-500 to-amber-600 rounded shadow-sm">
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3 text-white" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base font-medium text-gray-800 dark:text-gray-100">{subDistrict.name}</CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-2 w-2" />
                    Sub-District
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-0 text-xs px-2 py-0.5">
                  <Home className="h-2 w-2 mr-1" />
                  {subDistrict.namhattaCount}
                </Badge>
                <Badge variant="outline" className="border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 text-xs px-2 py-0.5">
                  <Users className="h-2 w-2 mr-1" />
                  {subDistrict.devoteeCount}
                </Badge>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-br from-orange-50/20 to-amber-50/20 dark:from-orange-900/5 dark:to-amber-900/5">
            <div className="space-y-2 p-2">
              {villagesLoading ? (
                <div className="flex items-center justify-center gap-2 py-4">
                  <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                    <Loader2 className="h-3 w-3 text-white animate-spin" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Loading villages...</span>
                </div>
              ) : villagesData?.length === 0 ? (
                <div className="text-center py-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Home className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">No villages found for {subDistrict.name}</p>
                </div>
              ) : (
                villagesData?.map((village) => (
                  <div key={`${village.name}_${village.subDistrict}`} 
                       className="flex items-center justify-between p-3 rounded-lg border-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                       data-testid={`village-item-${village.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{village.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Home className="h-2 w-2" />
                          Village
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 text-xs px-2 py-0.5">
                        <Building2 className="h-2 w-2 mr-1" />
                        {village.namhattaCount}
                      </Badge>
                      <Badge variant="outline" className="border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 text-xs px-2 py-0.5">
                        <Users className="h-2 w-2 mr-1" />
                        {village.devoteeCount}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}