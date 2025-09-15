import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MapPin, Crown, UserCheck, Users, Shield } from "lucide-react";
import iskconLogo from "@assets/iskcon_logo_1757665218141.png";
import namhattaLogo from "@assets/namhatta_logo_1757673165218.png";
import prabhupadaImage from "@assets/PRAVUPADA_1757698417419.jpg";

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
  
  // State for hierarchical navigation
  const [selectedDistrictSupervisor, setSelectedDistrictSupervisor] = useState<number | null>(null);
  const [selectedMalaSenapoti, setSelectedMalaSenapoti] = useState<number | null>(null);
  const [selectedMahaChakraSenapoti, setSelectedMahaChakraSenapoti] = useState<number | null>(null);
  const [selectedChakraSenapoti, setSelectedChakraSenapoti] = useState<number | null>(null);
  
  const { data: hierarchy, isLoading, error } = useQuery<HierarchyData>({
    queryKey: ["/api/hierarchy"],
  });

  const { data: districtSupervisors, isLoading: isLoadingDistrictSupervisors } = useQuery({
    queryKey: ["/api/district-supervisors/all"],
  });

  // Dynamic queries for hierarchical data based on selections
  const { data: malaSenapotis } = useQuery({
    queryKey: ["/api/senapoti/MALA_SENAPOTI", selectedDistrictSupervisor],
    queryFn: async () => {
      if (!selectedDistrictSupervisor) return [];
      const response = await fetch(`/api/senapoti/MALA_SENAPOTI/${selectedDistrictSupervisor}`);
      if (!response.ok) throw new Error('Failed to fetch Mala Senapotis');
      return response.json();
    },
    enabled: !!selectedDistrictSupervisor,
  });

  const { data: mahaChakraSenapotis } = useQuery({
    queryKey: ["/api/senapoti/MAHA_CHAKRA_SENAPOTI", selectedMalaSenapoti],
    queryFn: async () => {
      if (!selectedMalaSenapoti) return [];
      const response = await fetch(`/api/senapoti/MAHA_CHAKRA_SENAPOTI/${selectedMalaSenapoti}`);
      if (!response.ok) throw new Error('Failed to fetch Maha Chakra Senapotis');
      return response.json();
    },
    enabled: !!selectedMalaSenapoti,
  });

  const { data: chakraSenapotis } = useQuery({
    queryKey: ["/api/senapoti/CHAKRA_SENAPOTI", selectedMahaChakraSenapoti],
    queryFn: async () => {
      if (!selectedMahaChakraSenapoti) return [];
      const response = await fetch(`/api/senapoti/CHAKRA_SENAPOTI/${selectedMahaChakraSenapoti}`);
      if (!response.ok) throw new Error('Failed to fetch Chakra Senapotis');
      return response.json();
    },
    enabled: !!selectedMahaChakraSenapoti,
  });

  const { data: upaChakraSenapotis } = useQuery({
    queryKey: ["/api/senapoti/UPA_CHAKRA_SENAPOTI", selectedChakraSenapoti],
    queryFn: async () => {
      if (!selectedChakraSenapoti) return [];
      const response = await fetch(`/api/senapoti/UPA_CHAKRA_SENAPOTI/${selectedChakraSenapoti}`);
      if (!response.ok) throw new Error('Failed to fetch Upa Chakra Senapotis');
      return response.json();
    },
    enabled: !!selectedChakraSenapoti,
  });

  // Handler functions for clicking on each level
  const handleDistrictSupervisorClick = (supervisorId: number) => {
    setSelectedDistrictSupervisor(supervisorId);
    // Reset lower levels when selecting a district supervisor
    setSelectedMalaSenapoti(null);
    setSelectedMahaChakraSenapoti(null);
    setSelectedChakraSenapoti(null);
  };

  const handleMalaSenapotiClick = (malaSenapotiId: number) => {
    setSelectedMalaSenapoti(malaSenapotiId);
    // Reset lower levels when selecting a mala senapoti
    setSelectedMahaChakraSenapoti(null);
    setSelectedChakraSenapoti(null);
  };

  const handleMahaChakraSenapotiClick = (mahaChakraSenapotiId: number) => {
    setSelectedMahaChakraSenapoti(mahaChakraSenapotiId);
    // Reset lower levels when selecting a maha chakra senapoti
    setSelectedChakraSenapoti(null);
  };

  const handleChakraSenapotiClick = (chakraSenapotiId: number) => {
    setSelectedChakraSenapoti(chakraSenapotiId);
  };

  if (isLoading || isLoadingDistrictSupervisors) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 text-black dark:text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mb-4"></div>
          <p className="text-lg text-slate-700 dark:text-slate-300">Loading Leadership Hierarchy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 text-black dark:text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 dark:text-red-400">Error loading hierarchy data</p>
        </div>
      </div>
    );
  }

  if (!hierarchy) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 text-black dark:text-white">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-700 dark:text-purple-300" data-testid="text-header">
            Leadership Hierarchy
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300" data-testid="text-organization">
            International Society for Krishna Consciousness
          </p>
        </div>

        {/* Founder Acharya Card - Full Width */}
        {hierarchy.founder && hierarchy.founder.map((founder) => (
          <Card key={founder.id} className="bg-white/80 dark:bg-slate-800/50 border-orange-300 dark:border-orange-500/30 shadow-2xl w-full" data-testid="card-founder-acharya">
            <CardContent className="p-8">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-4">
                  <div className="w-[4.8rem] h-[4.8rem] bg-orange-500 rounded-full flex items-center justify-center">
                    <img 
                      src={iskconLogo} 
                      alt="ISKCON Logo" 
                      className="w-[3.6rem] h-[3.6rem] object-contain filter brightness-0 invert"
                      data-testid="img-founder-logo"
                    />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2" data-testid="text-founder-title">
                      ISKCON Founder Acharya
                    </h2>
                    <div className="space-y-1">
                      <p className="text-lg md:text-xl font-semibold text-orange-700 dark:text-orange-200" data-testid="text-founder-name">
                        {founder.name}
                      </p>
                    </div>
                  </div>
                  <div className="w-[4.8rem] h-[4.8rem] rounded-full overflow-hidden shadow-lg">
                    <img 
                      src={prabhupadaImage} 
                      alt="Srila Prabhupada" 
                      className="w-[4.8rem] h-[4.8rem] object-cover"
                      data-testid="img-founder-prabhupada"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Three Cards in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GBC Card */}
          <Card className="bg-white/80 dark:bg-slate-800/50 border-purple-300 dark:border-purple-500/30 shadow-xl" data-testid="card-gbc">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-[3.6rem] h-[3.6rem] bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <img 
                    src={iskconLogo} 
                    alt="ISKCON Logo" 
                    className="w-[2.4rem] h-[2.4rem] object-contain filter brightness-0 invert"
                    data-testid="img-gbc-logo"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300 mb-2" data-testid="text-gbc-title">
                    ISKCON GBC & Namhatta Preaching Minister
                  </h3>
                  <div className="space-y-2">
                    {hierarchy.gbc && hierarchy.gbc.map((gbcMember, index) => (
                      <div key={gbcMember.id}>
                        <p className="text-lg font-semibold text-purple-800 dark:text-purple-200" data-testid={`text-gbc-name-${index}`}>
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
          <Card className="bg-white/80 dark:bg-slate-800/50 border-blue-300 dark:border-blue-500/30 shadow-xl" data-testid="card-regional-director">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-[3.6rem] h-[3.6rem] bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <img 
                    src={iskconLogo} 
                    alt="ISKCON Logo" 
                    className="w-[2.4rem] h-[2.4rem] object-contain filter brightness-0 invert"
                    data-testid="img-regional-director-logo"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2" data-testid="text-regional-director-title">
                    ISKCON Namhatta Regional Director
                  </h3>
                  <div className="space-y-2">
                    {hierarchy.regionalDirectors && hierarchy.regionalDirectors.map((director, index) => (
                      <div key={director.id}>
                        <p className="text-lg font-semibold text-blue-800 dark:text-blue-200" data-testid={`text-regional-director-name-${index}`}>
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
          <Card className="bg-white/80 dark:bg-slate-800/50 border-teal-300 dark:border-teal-500/30 shadow-xl" data-testid="card-co-regional-director">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-[3.6rem] h-[3.6rem] bg-teal-500 rounded-full flex items-center justify-center mx-auto">
                  <img 
                    src={iskconLogo} 
                    alt="ISKCON Logo" 
                    className="w-[2.4rem] h-[2.4rem] object-contain filter brightness-0 invert"
                    data-testid="img-co-regional-director-logo"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-teal-700 dark:text-teal-300 mb-2" data-testid="text-co-regional-director-title">
                    ISKCON Namhatta Co-Regional Director
                  </h3>
                  <div className="space-y-2">
                    {hierarchy.coRegionalDirectors && hierarchy.coRegionalDirectors.map((coDirector, index) => (
                      <div key={coDirector.id}>
                        <p className="text-lg font-semibold text-teal-800 dark:text-teal-200" data-testid={`text-co-regional-director-name-${index}`}>
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
                className="w-full justify-between p-4 h-auto bg-white/70 dark:bg-slate-800/30 border border-slate-300 dark:border-slate-600/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-black dark:text-white rounded-lg shadow-lg"
                data-testid="button-additional-leaders-toggle"
              >
                <div className="flex items-center">
                  <Users className="mr-3 h-5 w-5 text-slate-600 dark:text-slate-300" />
                  <span className="text-lg font-semibold">Additional Leadership Roles</span>
                </div>
                {isAdditionalLeadersOpen ? (
                  <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Mala Senapotis */}
                {hierarchy.malaSenapotis && hierarchy.malaSenapotis.length > 0 && (
                  <Card className="bg-white/80 dark:bg-slate-800/50 border-red-300 dark:border-red-500/30 shadow-lg" data-testid="card-mala-senapotis">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-red-700 dark:text-red-300">Mala Senapotis</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {hierarchy.malaSenapotis.map((leader) => (
                            <div key={leader.id} className="text-xs">
                              <p className="font-medium text-red-800 dark:text-red-200">{leader.name}</p>
                              {leader.namhattaName && (
                                <p className="text-red-600 dark:text-red-400 truncate" title={leader.namhattaName}>
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
                  <Card className="bg-white/80 dark:bg-slate-800/50 border-indigo-300 dark:border-indigo-500/30 shadow-lg" data-testid="card-maha-chakra-senapotis">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mx-auto">
                          <UserCheck className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Maha Chakra Senapotis</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {hierarchy.mahaChakraSenapotis.map((leader) => (
                            <div key={leader.id} className="text-xs">
                              <p className="font-medium text-indigo-800 dark:text-indigo-200">{leader.name}</p>
                              {leader.namhattaName && (
                                <p className="text-indigo-600 dark:text-indigo-400 truncate" title={leader.namhattaName}>
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
                  <Card className="bg-white/80 dark:bg-slate-800/50 border-green-300 dark:border-green-500/30 shadow-lg" data-testid="card-chakra-senapotis">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-green-700 dark:text-green-300">Chakra Senapotis</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {hierarchy.chakraSenapotis.map((leader) => (
                            <div key={leader.id} className="text-xs">
                              <p className="font-medium text-green-800 dark:text-green-200">{leader.name}</p>
                              {leader.namhattaName && (
                                <p className="text-green-600 dark:text-green-400 truncate" title={leader.namhattaName}>
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
                  <Card className="bg-white/80 dark:bg-slate-800/50 border-yellow-300 dark:border-yellow-500/30 shadow-lg" data-testid="card-upa-chakra-senapotis">
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mx-auto">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-yellow-700 dark:text-yellow-300">Upa Chakra Senapotis</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {hierarchy.upaChakraSenapotis.map((leader) => (
                            <div key={leader.id} className="text-xs">
                              <p className="font-medium text-yellow-800 dark:text-yellow-200">{leader.name}</p>
                              {leader.namhattaName && (
                                <p className="text-yellow-600 dark:text-yellow-400 truncate" title={leader.namhattaName}>
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
                className="w-full justify-between p-4 h-auto bg-white/70 dark:bg-slate-800/30 border border-slate-300 dark:border-slate-600/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 text-black dark:text-white rounded-lg shadow-lg"
                data-testid="button-district-supervisors-toggle"
              >
                <div className="flex items-center">
                  <Shield className="mr-3 h-5 w-5 text-orange-500 dark:text-orange-400" />
                  <span className="text-lg font-semibold">District Supervisors</span>
                  <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">({(districtSupervisors as any[]).length})</span>
                </div>
                {isDistrictSupervisorsOpen ? (
                  <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {(districtSupervisors as any[]).map((supervisor: any) => (
                  <Card 
                    key={supervisor.id} 
                    className={`bg-white/80 dark:bg-slate-800/50 border-orange-300 dark:border-orange-500/30 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                      selectedDistrictSupervisor === supervisor.id ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-900/20' : ''
                    }`}
                    data-testid={`card-district-supervisor-${supervisor.id}`}
                    onClick={() => handleDistrictSupervisorClick(supervisor.id)}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mx-auto">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 truncate" title={supervisor.fullName}>
                            {supervisor.fullName}
                          </h4>
                          <p className="text-xs text-orange-600 dark:text-orange-400">District Supervisor</p>
                        </div>
                        {supervisor.districts && supervisor.districts.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Districts:</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                              {supervisor.districts.map((district: string, index: number) => (
                                <span 
                                  key={index}
                                  className="inline-block px-2 py-0.5 text-xs bg-orange-200/60 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full"
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

        {/* Mala Senapotis Section - Show when district supervisor is selected */}
        {selectedDistrictSupervisor && malaSenapotis && malaSenapotis.length > 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/50 border-red-300 dark:border-red-500/30 shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-red-700 dark:text-red-300 flex items-center">
                  <Crown className="mr-2 h-5 w-5" />
                  Mala Senapotis under Selected District Supervisor
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Click on any Mala Senapoti to see their Maha Chakra Senapotis</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {malaSenapotis.map((mala: any) => (
                  <Card
                    key={mala.id}
                    className={`bg-white/80 dark:bg-slate-800/50 border-red-200 dark:border-red-600/30 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                      selectedMalaSenapoti === mala.id ? 'ring-2 ring-red-500 bg-red-50 dark:bg-red-900/20' : ''
                    }`}
                    onClick={() => handleMalaSenapotiClick(mala.id)}
                    data-testid={`card-mala-senapoti-${mala.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-red-800 dark:text-red-200 truncate" title={mala.legalName}>
                            {mala.legalName}
                          </h4>
                          {mala.initiatedName && (
                            <p className="text-xs text-red-600 dark:text-red-400 truncate" title={mala.initiatedName}>
                              {mala.initiatedName}
                            </p>
                          )}
                          <p className="text-xs text-red-600 dark:text-red-400">Mala Senapoti</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Maha Chakra Senapotis Section - Show when mala senapoti is selected */}
        {selectedMalaSenapoti && mahaChakraSenapotis && mahaChakraSenapotis.length > 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/50 border-indigo-300 dark:border-indigo-500/30 shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-300 flex items-center">
                  <UserCheck className="mr-2 h-5 w-5" />
                  Maha Chakra Senapotis under Selected Mala Senapoti
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Click on any Maha Chakra Senapoti to see their Chakra Senapotis</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {mahaChakraSenapotis.map((maha: any) => (
                  <Card
                    key={maha.id}
                    className={`bg-white/80 dark:bg-slate-800/50 border-indigo-200 dark:border-indigo-600/30 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                      selectedMahaChakraSenapoti === maha.id ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                    onClick={() => handleMahaChakraSenapotiClick(maha.id)}
                    data-testid={`card-maha-chakra-senapoti-${maha.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center mx-auto">
                          <UserCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 truncate" title={maha.legalName}>
                            {maha.legalName}
                          </h4>
                          {maha.initiatedName && (
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate" title={maha.initiatedName}>
                              {maha.initiatedName}
                            </p>
                          )}
                          <p className="text-xs text-indigo-600 dark:text-indigo-400">Maha Chakra Senapoti</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chakra Senapotis Section - Show when maha chakra senapoti is selected */}
        {selectedMahaChakraSenapoti && chakraSenapotis && chakraSenapotis.length > 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/50 border-green-300 dark:border-green-500/30 shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-green-700 dark:text-green-300 flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Chakra Senapotis under Selected Maha Chakra Senapoti
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Click on any Chakra Senapoti to see their Upa Chakra Senapotis</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {chakraSenapotis.map((chakra: any) => (
                  <Card
                    key={chakra.id}
                    className={`bg-white/80 dark:bg-slate-800/50 border-green-200 dark:border-green-600/30 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                      selectedChakraSenapoti === chakra.id ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' : ''
                    }`}
                    onClick={() => handleChakraSenapotiClick(chakra.id)}
                    data-testid={`card-chakra-senapoti-${chakra.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-green-800 dark:text-green-200 truncate" title={chakra.legalName}>
                            {chakra.legalName}
                          </h4>
                          {chakra.initiatedName && (
                            <p className="text-xs text-green-600 dark:text-green-400 truncate" title={chakra.initiatedName}>
                              {chakra.initiatedName}
                            </p>
                          )}
                          <p className="text-xs text-green-600 dark:text-green-400">Chakra Senapoti</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upa Chakra Senapotis Section - Show when chakra senapoti is selected */}
        {selectedChakraSenapoti && upaChakraSenapotis && upaChakraSenapotis.length > 0 && (
          <Card className="bg-white/80 dark:bg-slate-800/50 border-yellow-300 dark:border-yellow-500/30 shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-yellow-700 dark:text-yellow-300 flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Upa Chakra Senapotis under Selected Chakra Senapoti
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {upaChakraSenapotis.map((upa: any) => (
                  <Card
                    key={upa.id}
                    className="bg-white/80 dark:bg-slate-800/50 border-yellow-200 dark:border-yellow-600/30 shadow-lg"
                    data-testid={`card-upa-chakra-senapoti-${upa.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mx-auto">
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 truncate" title={upa.legalName}>
                            {upa.legalName}
                          </h4>
                          {upa.initiatedName && (
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 truncate" title={upa.initiatedName}>
                              {upa.initiatedName}
                            </p>
                          )}
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">Upa Chakra Senapoti</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}