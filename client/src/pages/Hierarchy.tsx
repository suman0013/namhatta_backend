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
                      className="w-full justify-between p-6 h-auto bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-teal-500/10 dark:from-purple-500/20 dark:via-blue-500/20 dark:to-teal-500/20 backdrop-blur-sm border border-white/20 dark:border-white/10 hover:bg-gradient-to-r hover:from-purple-500/20 hover:via-blue-500/20 hover:to-teal-500/20 text-gray-800 dark:text-white rounded-2xl shadow-lg backdrop-blur transition-all hover:shadow-2xl hover:scale-[1.02]"
                      data-testid="button-district-supervisors-toggle"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-left">
                          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">District Supervisors</span>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Click to explore hierarchy</div>
                        </div>
                        <span className="ml-auto mr-4 text-sm font-semibold bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-full shadow-md">({(districtSupervisors as any[]).length})</span>
                      </div>
                      {isDistrictSupervisorsOpen ? (
                        <ChevronDown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <ChevronRight className="h-6 w-6 text-purple-600 dark:text-purple-400" />
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
                                  className={`group bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 rounded-2xl ${
                                    selectedDistrictSupervisor === supervisor.id ? 'ring-2 ring-purple-500/50 shadow-purple-500/20 scale-105 -translate-y-2' : ''
                                  }`}
                                  data-testid={`card-district-supervisor-${supervisor.id}`}
                                  onClick={() => handleDistrictSupervisorClick(supervisor.id)}
                                >
                                  <CardContent className="p-6">
                                    <div className="text-center space-y-4">
                                      <div className="relative">
                                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl transform group-hover:rotate-12 transition-transform duration-300">
                                          <Shield className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                          <span className="text-xs font-bold text-white">{supervisor.districts?.length || 1}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent truncate" title={supervisor.fullName}>
                                          {supervisor.fullName}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">District Supervisor</p>
                                      </div>
                                      {supervisor.districts && supervisor.districts.length > 0 && (
                                        <div className="space-y-2">
                                          <div className="flex flex-wrap gap-1 justify-center">
                                            {supervisor.districts.slice(0, 2).map((district: string, index: number) => (
                                              <span 
                                                key={index}
                                                className="inline-block px-3 py-1 text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-700 dark:text-purple-300 rounded-full font-medium border border-purple-200 dark:border-purple-700"
                                              >
                                                {district}
                                              </span>
                                            ))}
                                            {supervisor.districts.length > 2 && (
                                              <span className="inline-block px-3 py-1 text-xs bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-700">+{supervisor.districts.length - 2}</span>
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

          {/* Level 4: Mala Senapotis - Modern floating cards */}
          {selectedDistrictSupervisor && malaSenapotis && malaSenapotis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative mb-8"
            >
              <div className="flex flex-wrap justify-center gap-4">
                {malaSenapotis.map((mala: any, index: number) => (
                  <motion.div
                    key={mala.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -5 }}
                    className="relative"
                  >
                    <Card
                      className={`group bg-gradient-to-br from-pink-100/80 to-red-100/80 dark:from-pink-900/40 dark:to-red-900/40 backdrop-blur-sm border border-pink-200/50 dark:border-pink-700/50 shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl rounded-xl ${
                        selectedMalaSenapoti === mala.id ? 'ring-2 ring-pink-400/60 shadow-pink-400/30 scale-110 -translate-y-1' : ''
                      }`}
                      onClick={() => handleMalaSenapotiClick(mala.id)}
                      data-testid={`card-mala-senapoti-${mala.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="text-center space-y-2">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:rotate-12 transition-transform duration-300">
                              <Crown className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"></div>
                          </div>
                          <h4 className="text-sm font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent truncate" title={mala.legalName}>
                            {mala.legalName.split(' ')[0]}
                          </h4>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Level 5: Maha Chakra Senapotis - Sleek circular design */}
          {selectedMalaSenapoti && mahaChakraSenapotis && mahaChakraSenapotis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative mb-6"
            >
              <div className="flex flex-wrap justify-center gap-3">
                {mahaChakraSenapotis.map((maha: any, index: number) => (
                  <motion.div
                    key={maha.id}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ scale: 1.2 }}
                    className="relative"
                  >
                    <div
                      className={`group w-16 h-16 bg-gradient-to-br from-blue-400/80 to-indigo-500/80 backdrop-blur-sm rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-xl shadow-lg border border-blue-200/50 dark:border-blue-700/50 ${
                        selectedMahaChakraSenapoti === maha.id ? 'ring-2 ring-blue-400 shadow-blue-400/50 scale-125' : ''
                      }`}
                      onClick={() => handleMahaChakraSenapotiClick(maha.id)}
                      data-testid={`card-maha-chakra-senapoti-${maha.id}`}
                      title={maha.legalName}
                    >
                      <UserCheck className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md">
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{maha.legalName.split(' ')[0]}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Level 6: Chakra Senapotis - Elegant dots */}
          {selectedMahaChakraSenapoti && chakraSenapotis && chakraSenapotis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative mb-6"
            >
              <div className="flex flex-wrap justify-center gap-2">
                {chakraSenapotis.map((chakra: any, index: number) => (
                  <motion.div
                    key={chakra.id}
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    whileHover={{ scale: 1.3 }}
                  >
                    <div
                      className={`group relative w-12 h-12 bg-gradient-to-br from-emerald-400/80 to-green-500/80 backdrop-blur-sm rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg shadow-md border border-emerald-200/50 dark:border-emerald-700/50 ${
                        selectedChakraSenapoti === chakra.id ? 'ring-2 ring-emerald-400 shadow-emerald-400/50 scale-125' : ''
                      }`}
                      onClick={() => handleChakraSenapotiClick(chakra.id)}
                      data-testid={`card-chakra-senapoti-${chakra.id}`}
                      title={chakra.legalName}
                    >
                      <Users className="h-4 w-4 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Level 7: Upa Chakra Senapotis - Minimal glowing dots */}
          {selectedChakraSenapoti && upaChakraSenapotis && upaChakraSenapotis.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="relative mb-6"
            >
              <div className="flex flex-wrap justify-center gap-1.5">
                {upaChakraSenapotis.map((upa: any, index: number) => (
                  <motion.div
                    key={upa.id}
                    initial={{ opacity: 0, scale: 0.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.02 }}
                    whileHover={{ scale: 1.4 }}
                  >
                    <div
                      className="w-8 h-8 bg-gradient-to-br from-amber-400/80 to-yellow-500/80 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg shadow-sm border border-amber-200/50 dark:border-amber-700/50 hover:shadow-amber-400/50"
                      data-testid={`card-upa-chakra-senapoti-${upa.id}`}
                      title={upa.legalName}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
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