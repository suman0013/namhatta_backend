import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, MapPin, Crown, UserCheck, Users, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-purple-100 to-slate-100 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 text-black dark:text-white overflow-x-auto">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-700 dark:text-purple-300" data-testid="text-header">
            Leadership Hierarchy Tree
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300" data-testid="text-organization">
            International Society for Krishna Consciousness
          </p>
        </div>

        {/* Tree Container */}
        <div className="relative min-w-[800px] mx-auto">

          {/* Level 1: Founder Acharya - Root of the tree */}
          <div className="flex justify-center mb-8">
            {hierarchy.founder && hierarchy.founder.map((founder) => (
              <motion.div
                key={founder.id}
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <Card className="bg-gradient-to-br from-orange-400 to-orange-600 border-orange-300 dark:border-orange-500/30 shadow-2xl w-80" data-testid="card-founder-acharya">
                  <CardContent className="p-6">
                    <div className="text-center text-white">
                      <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                          <img 
                            src={iskconLogo} 
                            alt="ISKCON Logo" 
                            className="w-12 h-12 object-contain filter brightness-0 invert"
                            data-testid="img-founder-logo"
                          />
                        </div>
                        <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg ring-4 ring-white/30">
                          <img 
                            src={prabhupadaImage} 
                            alt="Srila Prabhupada" 
                            className="w-16 h-16 object-cover"
                            data-testid="img-founder-prabhupada"
                          />
                        </div>
                      </div>
                      <h2 className="text-xl font-bold mb-2" data-testid="text-founder-title">
                        ISKCON Founder Acharya
                      </h2>
                      <p className="text-lg font-semibold" data-testid="text-founder-name">
                        {founder.name}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                {/* Connecting line down */}
                <div className="absolute top-full left-1/2 w-px h-12 bg-gradient-to-b from-orange-400 to-purple-400 transform -translate-x-1/2"></div>
              </motion.div>
            ))}
          </div>

          {/* Level 2: GBC, Regional Directors, Co-Regional Directors - First branches */}
          <div className="relative mb-12">
            {/* Horizontal connecting line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-purple-400 via-blue-400 to-teal-400"></div>
            {/* Vertical connecting lines */}
            <div className="absolute top-0 left-1/4 w-px h-4 bg-purple-400 transform -translate-x-1/2"></div>
            <div className="absolute top-0 left-1/2 w-px h-4 bg-blue-400 transform -translate-x-1/2"></div>
            <div className="absolute top-0 right-1/4 w-px h-4 bg-teal-400 transform translate-x-1/2"></div>
            
            <div className="grid grid-cols-3 gap-8 pt-4">
              {/* GBC Card */}
              <motion.div
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300 dark:border-purple-500/30 shadow-xl" data-testid="card-gbc">
                  <CardContent className="p-6">
                    <div className="text-center text-white">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img 
                          src={iskconLogo} 
                          alt="ISKCON Logo" 
                          className="w-10 h-10 object-contain filter brightness-0 invert"
                          data-testid="img-gbc-logo"
                        />
                      </div>
                      <h3 className="text-lg font-bold mb-2" data-testid="text-gbc-title">
                        GBC & Namhatta Minister
                      </h3>
                      <div className="space-y-1">
                        {hierarchy.gbc && hierarchy.gbc.map((gbcMember, index) => (
                          <div key={gbcMember.id}>
                            <p className="text-sm font-semibold" data-testid={`text-gbc-name-${index}`}>
                              {gbcMember.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Regional Director Card */}
              <motion.div
                initial={{ opacity: 0, y: -100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300 dark:border-blue-500/30 shadow-xl" data-testid="card-regional-director">
                  <CardContent className="p-6">
                    <div className="text-center text-white">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img 
                          src={iskconLogo} 
                          alt="ISKCON Logo" 
                          className="w-10 h-10 object-contain filter brightness-0 invert"
                          data-testid="img-regional-director-logo"
                        />
                      </div>
                      <h3 className="text-lg font-bold mb-2" data-testid="text-regional-director-title">
                        Regional Director
                      </h3>
                      <div className="space-y-1">
                        {hierarchy.regionalDirectors && hierarchy.regionalDirectors.map((director, index) => (
                          <div key={director.id}>
                            <p className="text-sm font-semibold" data-testid={`text-regional-director-name-${index}`}>
                              {director.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Co-Regional Director Card */}
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-teal-400 to-teal-600 border-teal-300 dark:border-teal-500/30 shadow-xl" data-testid="card-co-regional-director">
                  <CardContent className="p-6">
                    <div className="text-center text-white">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <img 
                          src={iskconLogo} 
                          alt="ISKCON Logo" 
                          className="w-10 h-10 object-contain filter brightness-0 invert"
                          data-testid="img-co-regional-director-logo"
                        />
                      </div>
                      <h3 className="text-lg font-bold mb-2" data-testid="text-co-regional-director-title">
                        Co-Regional Director
                      </h3>
                      <div className="space-y-1">
                        {hierarchy.coRegionalDirectors && hierarchy.coRegionalDirectors.map((coDirector, index) => (
                          <div key={coDirector.id}>
                            <p className="text-sm font-semibold" data-testid={`text-co-regional-director-name-${index}`}>
                              {coDirector.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
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

          {/* Level 3: District Supervisors - Tree branches spreading wider */}
          {(districtSupervisors as any[]) && (districtSupervisors as any[]).length > 0 && (
            <div className="relative mb-12">
              {/* Connecting line from level 2 */}
              <div className="absolute -top-8 left-1/2 w-px h-8 bg-gradient-to-b from-gray-400 to-orange-400 transform -translate-x-1/2"></div>
              
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Collapsible open={isDistrictSupervisorsOpen} onOpenChange={setIsDistrictSupervisorsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between p-4 h-auto bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 border-2 border-orange-300 dark:border-orange-500/50 hover:from-orange-200 hover:to-orange-300 dark:hover:from-orange-800/40 dark:hover:to-orange-700/40 text-black dark:text-white rounded-lg shadow-xl transition-all hover:shadow-2xl"
                      data-testid="button-district-supervisors-toggle"
                    >
                      <div className="flex items-center">
                        <Shield className="mr-3 h-6 w-6 text-orange-600 dark:text-orange-400" />
                        <span className="text-xl font-bold">District Supervisors</span>
                        <span className="ml-2 text-sm text-orange-600 dark:text-orange-400 bg-orange-200/50 dark:bg-orange-900/50 px-2 py-1 rounded-full">({(districtSupervisors as any[]).length})</span>
                      </div>
                      {isDistrictSupervisorsOpen ? (
                        <ChevronDown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      ) : (
                        <ChevronRight className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-6">
                    <AnimatePresence>
                      {isDistrictSupervisorsOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          className="relative"
                        >
                          {/* Tree branching lines */}
                          <div className="absolute top-0 left-1/2 w-px h-6 bg-orange-400 transform -translate-x-1/2"></div>
                          <div className="absolute top-6 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent"></div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pt-8">
                            {(districtSupervisors as any[]).map((supervisor: any, index: number) => (
                              <motion.div
                                key={supervisor.id}
                                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="relative"
                              >
                                {/* Individual branch line */}
                                <div className="absolute -top-8 left-1/2 w-px h-8 bg-orange-400 transform -translate-x-1/2"></div>
                                
                                <Card 
                                  className={`bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/50 dark:to-orange-800/50 border-2 border-orange-300 dark:border-orange-500/50 shadow-xl cursor-pointer transition-all hover:shadow-2xl hover:scale-105 transform ${
                                    selectedDistrictSupervisor === supervisor.id ? 'ring-4 ring-orange-500 shadow-orange-300 dark:shadow-orange-900/50 scale-105' : ''
                                  }`}
                                  data-testid={`card-district-supervisor-${supervisor.id}`}
                                  onClick={() => handleDistrictSupervisorClick(supervisor.id)}
                                >
                                  <CardContent className="p-4">
                                    <div className="text-center space-y-2">
                                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                        <Shield className="h-6 w-6 text-white" />
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-bold text-orange-800 dark:text-orange-200 truncate" title={supervisor.fullName}>
                                          {supervisor.fullName}
                                        </h4>
                                        <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">District Supervisor</p>
                                      </div>
                                      {supervisor.districts && supervisor.districts.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-1">Districts:</p>
                                          <div className="flex flex-wrap gap-1 justify-center">
                                            {supervisor.districts.slice(0, 2).map((district: string, index: number) => (
                                              <span 
                                                key={index}
                                                className="inline-block px-2 py-0.5 text-xs bg-orange-300/70 dark:bg-orange-700/50 text-orange-900 dark:text-orange-100 rounded-full font-medium"
                                              >
                                                {district}
                                              </span>
                                            ))}
                                            {supervisor.districts.length > 2 && (
                                              <span className="inline-block px-2 py-0.5 text-xs bg-orange-300/50 dark:bg-orange-700/30 text-orange-800 dark:text-orange-200 rounded-full">+{supervisor.districts.length - 2}</span>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                {/* Connecting line down to children if selected */}
                                {selectedDistrictSupervisor === supervisor.id && (
                                  <div className="absolute top-full left-1/2 w-px h-6 bg-gradient-to-b from-orange-500 to-red-400 transform -translate-x-1/2"></div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            </div>
          )}

          {/* Level 4: Mala Senapotis - Compact cards */}
          {selectedDistrictSupervisor && malaSenapotis && malaSenapotis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative mb-6"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {malaSenapotis.map((mala: any, index: number) => (
                  <motion.div
                    key={mala.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative"
                  >
                    <Card
                      className={`bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-600/50 shadow-md cursor-pointer transition-all hover:scale-110 hover:shadow-lg ${
                        selectedMalaSenapoti === mala.id ? 'ring-2 ring-red-500 bg-red-200 dark:bg-red-800/60' : ''
                      }`}
                      onClick={() => handleMalaSenapotiClick(mala.id)}
                      data-testid={`card-mala-senapoti-${mala.id}`}
                    >
                      <CardContent className="p-2">
                        <div className="text-center space-y-1">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                            <Crown className="h-4 w-4 text-white" />
                          </div>
                          <h4 className="text-xs font-semibold text-red-800 dark:text-red-200 truncate" title={mala.legalName}>
                            {mala.legalName}
                          </h4>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Level 5: Maha Chakra Senapotis - Compact */}
          {selectedMalaSenapoti && mahaChakraSenapotis && mahaChakraSenapotis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative mb-6"
            >
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {mahaChakraSenapotis.map((maha: any, index: number) => (
                  <motion.div
                    key={maha.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                  >
                    <Card
                      className={`bg-indigo-100 dark:bg-indigo-900/40 border border-indigo-300 dark:border-indigo-600/50 shadow-md cursor-pointer transition-all hover:scale-110 ${
                        selectedMahaChakraSenapoti === maha.id ? 'ring-2 ring-indigo-500 bg-indigo-200 dark:bg-indigo-800/60' : ''
                      }`}
                      onClick={() => handleMahaChakraSenapotiClick(maha.id)}
                      data-testid={`card-maha-chakra-senapoti-${maha.id}`}
                    >
                      <CardContent className="p-1.5">
                        <div className="text-center space-y-1">
                          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center mx-auto">
                            <UserCheck className="h-3 w-3 text-white" />
                          </div>
                          <h4 className="text-xs font-medium text-indigo-800 dark:text-indigo-200 truncate" title={maha.legalName}>
                            {maha.legalName}
                          </h4>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Level 6: Chakra Senapotis - Minimal cards */}
          {selectedMahaChakraSenapoti && chakraSenapotis && chakraSenapotis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative mb-4"
            >
              <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                {chakraSenapotis.map((chakra: any, index: number) => (
                  <motion.div
                    key={chakra.id}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                  >
                    <Card
                      className={`bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-600/50 shadow-sm cursor-pointer transition-all hover:scale-110 ${
                        selectedChakraSenapoti === chakra.id ? 'ring-2 ring-green-500 bg-green-200 dark:bg-green-800/60' : ''
                      }`}
                      onClick={() => handleChakraSenapotiClick(chakra.id)}
                      data-testid={`card-chakra-senapoti-${chakra.id}`}
                    >
                      <CardContent className="p-1">
                        <div className="text-center space-y-0.5">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                            <Users className="h-2.5 w-2.5 text-white" />
                          </div>
                          <h4 className="text-xs font-medium text-green-800 dark:text-green-200 truncate" title={chakra.legalName}>
                            {chakra.legalName.split(' ')[0]}
                          </h4>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Level 7: Upa Chakra Senapotis - Tiny final cards */}
          {selectedChakraSenapoti && upaChakraSenapotis && upaChakraSenapotis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative mb-4"
            >
              <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-1.5">
                {upaChakraSenapotis.map((upa: any, index: number) => (
                  <motion.div
                    key={upa.id}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.01 }}
                  >
                    <Card
                      className="bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-600/50 shadow-sm transition-all hover:scale-110"
                      data-testid={`card-upa-chakra-senapoti-${upa.id}`}
                    >
                      <CardContent className="p-1">
                        <div className="text-center">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-0.5">
                            <MapPin className="h-2 w-2 text-white" />
                          </div>
                          <h4 className="text-xs font-medium text-yellow-800 dark:text-yellow-200 truncate" title={upa.legalName}>
                            {upa.legalName.split(' ')[0]}
                          </h4>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        
        </div> {/* Close Tree Container */}
      </div>
    </div>
  );
}