import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  UserCheck, 
  Users,
  MapPin,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function Hierarchy() {
  const [isDistrictSupervisorsOpen, setIsDistrictSupervisorsOpen] = useState(false);
  
  const { data: hierarchy, isLoading } = useQuery({
    queryKey: ["/api/hierarchy"],
  });

  const { data: districtSupervisors, isLoading: isLoadingDistrictSupervisors } = useQuery({
    queryKey: ["/api/district-supervisors/all"],
  });

  if (isLoading || isLoadingDistrictSupervisors) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Leadership Hierarchy</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Organizational structure and leadership roles</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="glass-card">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Organization Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold gradient-text mb-2">International Society for Krishna Consciousness</h1>
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Leadership Hierarchy</h2>
        <p className="text-gray-600 dark:text-gray-400">Organizational structure and leadership roles</p>
      </div>

      {/* Hierarchy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {/* ISKCON Founder Acharya */}
        <Card className="glass-card col-span-full lg:col-span-2" data-testid="card-founder-acharya">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base">
              <Crown className="mr-2 h-5 w-5 text-amber-500" />
              ISKCON Founder Acharya
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                <Crown className="h-5 w-5 text-white float-animation" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base text-gray-900 dark:text-white" data-testid="text-founder-name">
                  His Divine Grace A. C. Bhaktivedanta Swami Prabhupada
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">ISKCON Founder Acharya</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ISKCON GBC & Namhatta Preaching Minister */}
        <Card className="glass-card" data-testid="card-gbc-minister">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <Crown className="mr-2 h-4 w-4 text-purple-500" />
              ISKCON GBC & Namhatta Preaching Minister
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Crown className="h-3 w-3 text-white float-animation" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm text-gray-900 dark:text-white" data-testid="text-gbc-name">
                  His Holiness Jayapataka Swami
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-300">GBC & Namhatta Preaching Minister</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ISKCON Namhatta Regional Directors */}
        <Card className="glass-card col-span-full lg:col-span-2" data-testid="card-regional-directors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <UserCheck className="mr-2 h-4 w-4 text-blue-500" />
              ISKCON Namhatta Regional Directors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <UserCheck className="h-3 w-3 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white" data-testid="text-regional-director-1">
                    His Holiness Gauranga Prem Swami
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300">ISKCON Namhatta Regional Director</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                  <UserCheck className="h-3 w-3 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white" data-testid="text-regional-director-2">
                    His Holiness Bhaktivilasa Gaurachandra Swami
                  </h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300">ISKCON Namhatta Regional Director</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Co-Regional Director */}
        <Card className="glass-card" data-testid="card-co-regional-director">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-emerald-500" />
              Co-Regional Director
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                <Users className="h-3 w-3 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-sm text-gray-900 dark:text-white" data-testid="text-co-regional-director">
                  His Grace Padmanetra Das
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Co-Regional Director</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devotee Leadership Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Mala Senapotis */}
        {(hierarchy as any)?.malaSenapotis && (hierarchy as any).malaSenapotis.length > 0 && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <Crown className="mr-2 h-4 w-4 text-red-500" />
                Mala Senapotis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {(hierarchy as any).malaSenapotis.map((leader: any) => (
                  <div key={leader.id} className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center">
                      <Crown className="h-3 w-3 text-white float-animation" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-xs text-gray-900 dark:text-white truncate" title={leader.name}>
                        {leader.name}
                      </h3>
                      <p className="text-xs text-red-700 dark:text-red-300">Mala Senapoti</p>
                      {leader.namhattaName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={leader.namhattaName}>
                          {leader.namhattaName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Maha Chakra Senapotis */}
        {(hierarchy as any)?.mahaChakraSenapotis && (hierarchy as any).mahaChakraSenapotis.length > 0 && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <UserCheck className="mr-2 h-4 w-4 text-indigo-500" />
                Maha Chakra Senapotis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {(hierarchy as any).mahaChakraSenapotis.map((leader: any) => (
                  <div key={leader.id} className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center">
                      <UserCheck className="h-3 w-3 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-xs text-gray-900 dark:text-white truncate" title={leader.name}>
                        {leader.name}
                      </h3>
                      <p className="text-xs text-indigo-700 dark:text-indigo-300">Maha Chakra Senapoti</p>
                      {leader.namhattaName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={leader.namhattaName}>
                          {leader.namhattaName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chakra Senapotis */}
        {(hierarchy as any)?.chakraSenapotis && (hierarchy as any).chakraSenapotis.length > 0 && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <Users className="mr-2 h-4 w-4 text-green-500" />
                Chakra Senapotis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {(hierarchy as any).chakraSenapotis.map((leader: any) => (
                  <div key={leader.id} className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-xs text-gray-900 dark:text-white truncate" title={leader.name}>
                        {leader.name}
                      </h3>
                      <p className="text-xs text-green-700 dark:text-green-300">Chakra Senapoti</p>
                      {leader.namhattaName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={leader.namhattaName}>
                          {leader.namhattaName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upa Chakra Senapotis */}
        {(hierarchy as any)?.upaChakraSenapotis && (hierarchy as any).upaChakraSenapotis.length > 0 && (
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-yellow-500" />
                Upa Chakra Senapotis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {(hierarchy as any).upaChakraSenapotis.map((leader: any) => (
                  <div key={leader.id} className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-xs text-gray-900 dark:text-white truncate" title={leader.name}>
                        {leader.name}
                      </h3>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">Upa Chakra Senapoti</p>
                      {leader.namhattaName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={leader.namhattaName}>
                          {leader.namhattaName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Horizontal Line Separator */}
      <div className="my-8">
        <hr className="border-t border-gray-200 dark:border-gray-700 opacity-50" />
      </div>

      {/* District Supervisors Section - Collapsible */}
      {(districtSupervisors as any[]) && (districtSupervisors as any[]).length > 0 && (
        <Collapsible open={isDistrictSupervisorsOpen} onOpenChange={setIsDistrictSupervisorsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-4 h-auto glass-card hover:bg-gray-50/50 dark:hover:bg-gray-800/50" data-testid="button-district-supervisors-toggle">
              <div className="flex items-center">
                <MapPin className="mr-3 h-5 w-5 text-orange-500" />
                <span className="text-lg font-semibold">District Supervisors</span>
                <span className="ml-2 text-sm text-gray-500">({(districtSupervisors as any[]).length})</span>
              </div>
              {isDistrictSupervisorsOpen ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {(districtSupervisors as any[]).map((supervisor: any) => (
                <Card key={supervisor.id} className="glass-card" data-testid={`card-district-supervisor-${supervisor.id}`}>
                  <CardContent className="p-3">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                          <MapPin className="h-3 w-3 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-xs text-gray-900 dark:text-white truncate" title={supervisor.fullName}>
                            {supervisor.fullName}
                          </h3>
                          <p className="text-xs text-orange-700 dark:text-orange-300">District Supervisor</p>
                        </div>
                      </div>
                      {supervisor.districts && supervisor.districts.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1">Districts:</p>
                          <div className="flex flex-wrap gap-1">
                            {supervisor.districts.map((district: string, index: number) => (
                              <span 
                                key={index}
                                className="inline-block px-2 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full"
                              >
                                {district}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}


    </div>
  );
}