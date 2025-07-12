import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Crown, 
  UserCheck, 
  Users,
  MapPin,
  Heart
} from "lucide-react";

export default function Hierarchy() {
  const { data: hierarchy, isLoading } = useQuery({
    queryKey: ["/api/hierarchy"],
  });

  if (isLoading) {
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
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold gradient-text">Leadership Hierarchy</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Organizational structure and leadership roles</p>
      </div>

      {/* Hierarchy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Founder Acharya */}
        {(hierarchy as any)?.founder && (hierarchy as any).founder.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-3 h-5 w-5 text-amber-500" />
                Founder Acharya
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(hierarchy as any).founder.map((founder: any) => (
                  <div key={founder.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                      <Crown className="h-5 w-5 text-white float-animation" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">{founder.name}</h3>
                      <p className="text-xs text-amber-700 dark:text-amber-300">ISKCON Founder Acharya</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* GBC */}
        {(hierarchy as any)?.gbc && (hierarchy as any).gbc.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Crown className="mr-3 h-5 w-5 text-purple-500" />
                Governing Body Commissioner
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(hierarchy as any).gbc.map((leader: any) => (
                  <div key={leader.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <Crown className="h-5 w-5 text-white float-animation" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">{leader.name}</h3>
                      <p className="text-xs text-purple-700 dark:text-purple-300">GBC - Governing Body Commissioner</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Regional Directors */}
        {(hierarchy as any)?.regionalDirectors && (hierarchy as any).regionalDirectors.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-3 h-5 w-5 text-blue-500" />
                Regional Directors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(hierarchy as any).regionalDirectors.map((director: any) => (
                  <div key={director.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">{director.name}</h3>
                      <p className="text-xs text-blue-700 dark:text-blue-300">Regional Director</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Co-Regional Directors */}
        {(hierarchy as any)?.coRegionalDirectors && (hierarchy as any).coRegionalDirectors.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-3 h-5 w-5 text-emerald-500" />
                Co-Regional Directors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(hierarchy as any).coRegionalDirectors.map((coDirector: any) => (
                  <div key={coDirector.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">{coDirector.name}</h3>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">Co-Regional Director</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* District Supervisors */}
        {(hierarchy as any)?.districtSupervisors && (hierarchy as any).districtSupervisors.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-3 h-5 w-5 text-orange-500" />
                District Supervisors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(hierarchy as any).districtSupervisors.map((supervisor: any) => (
                  <div key={supervisor.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">{supervisor.name}</h3>
                      <p className="text-xs text-orange-700 dark:text-orange-300">District Supervisor</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mala Senapotis */}
        {(hierarchy as any)?.malaSenapotis && (hierarchy as any).malaSenapotis.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-3 h-5 w-5 text-pink-500" />
                Mala Senapotis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(hierarchy as any).malaSenapotis.map((senapoti: any) => (
                  <div key={senapoti.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm text-gray-900 dark:text-white">{senapoti.name}</h3>
                      <p className="text-xs text-pink-700 dark:text-pink-300">Mala Senapoti</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}