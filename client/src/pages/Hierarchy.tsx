import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MapPin, Crown, UserCheck, Users, Shield } from "lucide-react";
import iskconLogo from "@assets/iskcon_logo_1757665218141.png";
import namhattaLogo from "@assets/namhatta_logo_1757665218139.png";

interface Leader {
  id: number;
  name: string;
  role: string;
  namhattaName?: string;
}

interface HierarchyData {
  founder: Leader[];
  gbc: Leader[];
  regionalDirectors: Leader[];
  coRegionalDirectors: Leader[];
  malaSenapotis?: Leader[];
  mahaChakraSenapotis?: Leader[];
  chakraSenapotis?: Leader[];
  upaChakraSenapotis?: Leader[];
}

export default function Hierarchy() {
  const [isDistrictSupervisorsOpen, setIsDistrictSupervisorsOpen] = useState(false);
  const [isAdditionalLeadersOpen, setIsAdditionalLeadersOpen] = useState(false);
  
  const { data: hierarchy, isLoading, error } = useQuery<HierarchyData>({
    queryKey: ["/api/hierarchy"],
  });

  const { data: districtSupervisors, isLoading: isLoadingDistrictSupervisors } = useQuery({
    queryKey: ["/api/district-supervisors/all"],
  });

  if (isLoading || isLoadingDistrictSupervisors) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-lg text-slate-300">Loading Leadership Hierarchy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-400">Error loading hierarchy data</p>
        </div>
      </div>
    );
  }

  if (!hierarchy) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-300" data-testid="text-header">
            Leadership Hierarchy
          </h1>
          <p className="text-xl md:text-2xl text-slate-300" data-testid="text-organization">
            International Society for Krishna Consciousness
          </p>
        </div>

        {/* Founder Acharya Card - Full Width */}
        {hierarchy.founder && hierarchy.founder.map((founder) => (
          <Card key={founder.id} className="bg-slate-800/50 border-orange-500/30 shadow-2xl w-full" data-testid="card-founder-acharya">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                    <img 
                      src={iskconLogo} 
                      alt="ISKCON Logo" 
                      className="w-12 h-12 object-contain filter brightness-0 invert"
                      data-testid="img-founder-logo"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold text-orange-400 mb-2" data-testid="text-founder-title">
                    ISKCON Founder Acharya
                  </h2>
                  <div className="space-y-1">
                    <p className="text-lg md:text-xl font-semibold text-orange-200" data-testid="text-founder-name">
                      {founder.name}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Three Cards in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GBC Card */}
          <Card className="bg-slate-800/50 border-purple-500/30 shadow-xl" data-testid="card-gbc">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <img 
                    src={iskconLogo} 
                    alt="ISKCON Logo" 
                    className="w-8 h-8 object-contain filter brightness-0 invert"
                    data-testid="img-gbc-logo"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-300 mb-2" data-testid="text-gbc-title">
                    ISKCON GBC & Namhatta Preaching Minister
                  </h3>
                  <div className="space-y-2">
                    {hierarchy.gbc && hierarchy.gbc.map((gbcMember, index) => (
                      <div key={gbcMember.id}>
                        <p className="text-lg font-semibold text-purple-200" data-testid={`text-gbc-name-${index}`}>
                          {gbcMember.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Regional Director Card */}
          <Card className="bg-slate-800/50 border-blue-500/30 shadow-xl" data-testid="card-regional-director">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <img 
                    src={namhattaLogo} 
                    alt="Namhatta Logo" 
                    className="w-8 h-8 object-contain filter brightness-0 invert"
                    data-testid="img-regional-director-logo"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-300 mb-2" data-testid="text-regional-director-title">
                    ISKCON Namhatta Regional Director
                  </h3>
                  <div className="space-y-2">
                    {hierarchy.regionalDirectors && hierarchy.regionalDirectors.map((director, index) => (
                      <div key={director.id}>
                        <p className="text-lg font-semibold text-blue-200" data-testid={`text-regional-director-name-${index}`}>
                          {director.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Co-Regional Director Card */}
          <Card className="bg-slate-800/50 border-teal-500/30 shadow-xl" data-testid="card-co-regional-director">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center mx-auto">
                  <img 
                    src={namhattaLogo} 
                    alt="Namhatta Logo" 
                    className="w-8 h-8 object-contain filter brightness-0 invert"
                    data-testid="img-co-regional-director-logo"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-teal-300 mb-2" data-testid="text-co-regional-director-title">
                    ISKCON Namhatta Co-Regional Director
                  </h3>
                  <div className="space-y-2">
                    {hierarchy.coRegionalDirectors && hierarchy.coRegionalDirectors.map((coDirector, index) => (
                      <div key={coDirector.id}>
                        <p className="text-lg font-semibold text-teal-200" data-testid={`text-co-regional-director-name-${index}`}>
                          {coDirector.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Leadership Roles - Collapsible */}
        {((hierarchy.malaSenapotis && hierarchy.malaSenapotis.length > 0) ||
          (hierarchy.mahaChakraSenapotis && hierarchy.mahaChakraSenapotis.length > 0) ||
          (hierarchy.chakraSenapotis && hierarchy.chakraSenapotis.length > 0) ||
          (hierarchy.upaChakraSenapotis && hierarchy.upaChakraSenapotis.length > 0)) && (
          <Collapsible open={isAdditionalLeadersOpen} onOpenChange={setIsAdditionalLeadersOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto bg-slate-800/30 border border-slate-600/30 hover:bg-slate-800/50 text-white rounded-lg shadow-lg"
                data-testid="button-additional-leaders-toggle"
              >
                <div className="flex items-center">
                  <Users className="mr-3 h-5 w-5 text-slate-300" />
                  <span className="text-lg font-semibold">Additional Leadership Roles</span>
                </div>
                {isAdditionalLeadersOpen ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Mala Senapotis */}
                {hierarchy.malaSenapotis && hierarchy.malaSenapotis.length > 0 && (
                  <Card className="bg-slate-800/50 border-red-500/30 shadow-lg" data-testid="card-mala-senapotis">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-red-300">Mala Senapotis</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {hierarchy.malaSenapotis.map((leader) => (
                            <div key={leader.id} className="text-xs">
                              <p className="font-medium text-red-200">{leader.name}</p>
                              {leader.namhattaName && (
                                <p className="text-red-400 truncate" title={leader.namhattaName}>
                                  {leader.namhattaName}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Maha Chakra Senapotis */}
                {hierarchy.mahaChakraSenapotis && hierarchy.mahaChakraSenapotis.length > 0 && (
                  <Card className="bg-slate-800/50 border-indigo-500/30 shadow-lg" data-testid="card-maha-chakra-senapotis">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mx-auto">
                          <UserCheck className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-indigo-300">Maha Chakra Senapotis</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {hierarchy.mahaChakraSenapotis.map((leader) => (
                            <div key={leader.id} className="text-xs">
                              <p className="font-medium text-indigo-200">{leader.name}</p>
                              {leader.namhattaName && (
                                <p className="text-indigo-400 truncate" title={leader.namhattaName}>
                                  {leader.namhattaName}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Chakra Senapotis */}
                {hierarchy.chakraSenapotis && hierarchy.chakraSenapotis.length > 0 && (
                  <Card className="bg-slate-800/50 border-green-500/30 shadow-lg" data-testid="card-chakra-senapotis">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-green-300">Chakra Senapotis</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {hierarchy.chakraSenapotis.map((leader) => (
                            <div key={leader.id} className="text-xs">
                              <p className="font-medium text-green-200">{leader.name}</p>
                              {leader.namhattaName && (
                                <p className="text-green-400 truncate" title={leader.namhattaName}>
                                  {leader.namhattaName}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Upa Chakra Senapotis */}
                {hierarchy.upaChakraSenapotis && hierarchy.upaChakraSenapotis.length > 0 && (
                  <Card className="bg-slate-800/50 border-yellow-500/30 shadow-lg" data-testid="card-upa-chakra-senapotis">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mx-auto">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-yellow-300">Upa Chakra Senapotis</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {hierarchy.upaChakraSenapotis.map((leader) => (
                            <div key={leader.id} className="text-xs">
                              <p className="font-medium text-yellow-200">{leader.name}</p>
                              {leader.namhattaName && (
                                <p className="text-yellow-400 truncate" title={leader.namhattaName}>
                                  {leader.namhattaName}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* District Supervisors Section - Collapsible */}
        {(districtSupervisors as any[]) && (districtSupervisors as any[]).length > 0 && (
          <Collapsible open={isDistrictSupervisorsOpen} onOpenChange={setIsDistrictSupervisorsOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between p-4 h-auto bg-slate-800/30 border border-slate-600/30 hover:bg-slate-800/50 text-white rounded-lg shadow-lg"
                data-testid="button-district-supervisors-toggle"
              >
                <div className="flex items-center">
                  <Shield className="mr-3 h-5 w-5 text-orange-400" />
                  <span className="text-lg font-semibold">District Supervisors</span>
                  <span className="ml-2 text-sm text-slate-400">({(districtSupervisors as any[]).length})</span>
                </div>
                {isDistrictSupervisorsOpen ? (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {(districtSupervisors as any[]).map((supervisor: any) => (
                  <Card key={supervisor.id} className="bg-slate-800/50 border-orange-500/30 shadow-lg" data-testid={`card-district-supervisor-${supervisor.id}`}>
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-orange-200 truncate" title={supervisor.fullName}>
                            {supervisor.fullName}
                          </h4>
                          <p className="text-xs text-orange-400">District Supervisor</p>
                        </div>
                        {supervisor.districts && supervisor.districts.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-400 font-medium mb-1">Districts:</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {supervisor.districts.map((district: string, index: number) => (
                                <span 
                                  key={index}
                                  className="inline-block px-2 py-0.5 text-xs bg-orange-900/30 text-orange-200 rounded-full"
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
    </div>
  );
}