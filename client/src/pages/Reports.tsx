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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20" data-testid="reports-loading">
        <div className="container mx-auto p-4 lg:p-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="text-center space-y-4">
              <Skeleton className="h-12 w-64 mx-auto" />
              <Skeleton className="h-4 w-96 mx-auto" />
            </div>
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16" />
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* List Skeleton */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="border-0 shadow-lg">
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
      </div>
    );
  }

  if (statesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20" data-testid="reports-error">
        <div className="container mx-auto p-4 lg:p-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-800 dark:text-red-200 text-xl">Error Loading Reports</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-red-700 dark:text-red-300">Failed to load hierarchical reports. Please try again later.</p>
              <Button onClick={handleRefresh} className="mt-4" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalNamhattas = statesData?.reduce((sum, state) => sum + state.namhattaCount, 0) || 0;
  const totalDevotees = statesData?.reduce((sum, state) => sum + state.devoteeCount, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20" data-testid="reports-page">
      <div className="container mx-auto p-4 lg:p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
              <BarChart3 className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Hierarchical Reports
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive geographic breakdown of Namhattas and Devotees with intelligent lazy loading
              {user?.role === 'DISTRICT_SUPERVISOR' && (
                <span className="block mt-2 text-sm px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full inline-block">
                  🔒 Filtered to your assigned districts
                </span>
              )}
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="lg"
                className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 shadow-lg" 
                disabled={statesFetching} 
                data-testid="refresh-reports"
              >
                <RefreshCw className={`h-5 w-5 ${statesFetching ? 'animate-spin' : ''}`} />
                {statesFetching ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white group hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-blue-100">Total States</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Globe className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1" data-testid="total-states">{statesData?.length || 0}</div>
                <p className="text-blue-100 text-sm flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Geographic regions
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white group hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-green-100">Total Namhattas</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1" data-testid="total-namhattas">{totalNamhattas}</div>
                <p className="text-green-100 text-sm flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Active centers
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white group hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-purple-100">Total Devotees</CardTitle>
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1" data-testid="total-devotees">{totalDevotees}</div>
                <p className="text-purple-100 text-sm flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Community members
                </p>
              </CardContent>
            </Card>
          </div>

          {/* States List */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
              <MapPin className="h-6 w-6 text-blue-600" />
              Geographic Breakdown
            </h2>
            <div className="space-y-4">
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
          </div>

          {(!statesData || statesData.length === 0) && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardContent className="text-center py-12">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-gray-200">No Data Available</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  No geographic data found for your access level. Contact your administrator for access to more regions.
                </p>
              </CardContent>
            </Card>
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
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <CardHeader className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 cursor-pointer transition-all duration-300" data-testid={`state-header-${state.name.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-white" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{state.name}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {state.country}
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <Badge className="mb-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 px-3 py-1">
                    <Building2 className="h-3 w-3 mr-1" />
                    {state.namhattaCount}
                  </Badge>
                  <p className="text-xs font-medium text-muted-foreground">Namhattas</p>
                </div>
                <div className="text-center">
                  <Badge variant="outline" className="mb-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 px-3 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    {state.devoteeCount}
                  </Badge>
                  <p className="text-xs font-medium text-muted-foreground">Devotees</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 border-t border-gray-100 dark:border-gray-700 bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-blue-900/10">
            <div className="space-y-3 p-4">
              {districtsLoading ? (
                <div className="flex items-center justify-center gap-3 py-8">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300 font-medium">Loading districts...</span>
                </div>
              ) : districtsData?.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPin className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">No districts found for {state.name}</p>
                </div>
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
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
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