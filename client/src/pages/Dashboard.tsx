import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Home, 
  Calendar, 
  AlertTriangle, 
  Crown, 
  UserCheck, 
  Download, 
  Plus,
  TrendingUp,
  ArrowRight,
  Zap,
  UserPlus,
  CalendarPlus,
  BarChart3
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: () => api.getDashboard(),
  });

  const { data: hierarchy, isLoading: hierarchyLoading } = useQuery({
    queryKey: ["/api/hierarchy"],
    queryFn: () => api.getHierarchy(),
  });

  if (dashboardLoading || hierarchyLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        </div>

      </div>

      {/* Leadership Hierarchy Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="mr-3 h-5 w-5 text-indigo-500" />
            Leadership Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Founder Acharya */}
              {hierarchy?.founder?.map((founder) => (
                <div key={founder.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white">{founder.name}</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-300">ISKCON Founder Acharya</p>
                  </div>
                </div>
              ))}
              
              {/* GBC */}
              {hierarchy?.gbc?.map((leader) => (
                <div key={leader.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200/50 dark:border-purple-700/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-900 dark:text-white">{leader.name}</h3>
                    <p className="text-xs text-purple-700 dark:text-purple-300">GBC - Governing Body Commissioner</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Regional Directors */}
              {hierarchy?.regionalDirectors?.map((director) => (
                <div key={director.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-medium text-sm text-gray-900 dark:text-white">{director.name}</h5>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Regional Director</p>
                  </div>
                </div>
              ))}

              {/* Co-Regional Directors */}
              {hierarchy?.coRegionalDirectors?.map((coDirector) => (
                <div key={coDirector.id} className="flex items-center space-x-3 p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-medium text-sm text-gray-900 dark:text-white">{coDirector.name}</h5>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300">Co-Regional Director</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Total Devotees"
          value={dashboard?.totalDevotees || 0}
          change="+12.5%"
          changeLabel="vs last month"
          icon={Users}
          gradient="from-blue-400 to-blue-600"
          positive
          onClick={() => setLocation("/devotees")}
        />
        <StatsCard
          title="Total Namhattas"
          value={dashboard?.totalNamhattas || 0}
          change="+3 new"
          changeLabel="this month"
          icon={Home}
          gradient="from-emerald-400 to-emerald-600"
          positive
          onClick={() => setLocation("/namhattas")}
        />


      </div>



      {/* Recent Activity & Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Namhatta Updates */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Home className="mr-3 h-5 w-5 text-emerald-500" />
                Recent Updates
              </CardTitle>
              <Button 
                variant="link" 
                className="text-emerald-600 dark:text-emerald-400"
                onClick={() => setLocation("/updates")}
              >
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {dashboard?.recentUpdates?.map((update, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 rounded-xl glass hover:bg-white/80 dark:hover:bg-slate-600/50 transition-all duration-200 group cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {update.namhattaName}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {update.programType}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {update.date}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Users className="mr-1 h-3 w-3" />
                        {update.attendance} attendees
                      </span>
                    </div>
                  </div>
                  <Badge className="status-badge-active">Active</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Devotional Status Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-3 h-5 w-5 text-purple-500" />
                Status Distribution
              </CardTitle>
              <Button 
                variant="link" 
                className="text-purple-600 dark:text-purple-400"
                onClick={() => setLocation("/statuses")}
              >
                Manage Statuses
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <StatusProgressBar label="Shraddhavan" count={156} percentage={35} color="from-blue-400 to-blue-600" />
              <StatusProgressBar label="Sadhusangi" count={98} percentage={22} color="from-emerald-400 to-emerald-600" />
              <StatusProgressBar label="Gour/Krishna Sevak" count={89} percentage={20} color="from-purple-400 to-purple-600" />
              <StatusProgressBar label="Gour/Krishna Sadhak" count={67} percentage={15} color="from-orange-400 to-orange-600" />
              <StatusProgressBar label="Sri Guru Charan Asraya" count={23} percentage={5} color="from-pink-400 to-pink-600" />
              <StatusProgressBar label="Harinam Diksha" count={9} percentage={2} color="from-indigo-400 to-indigo-600" />
              <StatusProgressBar label="Pancharatrik Diksha" count={4} percentage={1} color="from-cyan-400 to-cyan-600" />
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  gradient, 
  positive = false, 
  urgent = false,
  onClick
}: {
  title: string;
  value: number;
  change: string;
  changeLabel: string;
  icon: any;
  gradient: string;
  positive?: boolean;
  urgent?: boolean;
  onClick?: () => void;
}) {
  return (
    <Card className={`glass-card ${onClick ? 'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105' : ''}`} onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {value.toLocaleString()}
            </p>
            <div className="flex items-center mt-4">
              <span className={`flex items-center text-sm font-medium ${
                positive ? "text-emerald-600 dark:text-emerald-400" : urgent ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"
              }`}>
                {positive ? (
                  <TrendingUp className="mr-1 h-4 w-4" />
                ) : (
                  <AlertTriangle className="mr-1 h-4 w-4" />
                )}
                {change}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{changeLabel}</span>
            </div>
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusProgressBar({ label, count, percentage, color }: { label: string; count: number; percentage: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{count} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, icon: Icon, gradient, iconGradient, onClick }: {
  title: string;
  description: string;
  icon: any;
  gradient: string;
  iconGradient: string;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      className={`group p-4 bg-gradient-to-br ${gradient} rounded-xl border border-gray-200/50 dark:border-gray-700/50 h-auto flex-col space-y-3 hover-lift hover:shadow-lg`}
      onClick={onClick}
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${iconGradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="text-center">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{description}</p>
      </div>
    </Button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
