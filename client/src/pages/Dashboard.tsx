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
    <div className="p-8 space-y-10 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
        <div className="animate-slide-up">
          <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Welcome back! Here's what's happening in your organization.
          </p>
        </div>
        <div className="flex items-center space-x-4 animate-scale-in">
          <Button className="gradient-button">
            <Plus className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
          <Button variant="outline" className="glass border-0">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Leadership Hierarchy Section */}
      <Card className="glass-card animate-slide-up">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-2xl">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <span className="gradient-text">Leadership Hierarchy</span>
            </CardTitle>
            <Badge className="status-badge-active">
              <Zap className="mr-1 h-3 w-3" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Founder Acharya Level */}
          {hierarchy?.founder?.map((founder) => (
            <div key={founder.id} className="relative group">
              <div className="flex items-center space-x-6 p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 dark:from-amber-900/30 dark:via-orange-900/30 dark:to-red-900/30 border-2 border-amber-200/60 dark:border-amber-700/60 hover-lift">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 via-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">{founder.name}</h3>
                  <p className="text-amber-700 dark:text-amber-300 font-semibold">ISKCON Founder Acharya</p>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-600/20 rounded-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
              </div>
            </div>
          ))}
          
          {/* GBC Level */}
          {hierarchy?.gbc?.map((leader) => (
            <div key={leader.id} className="relative group">
              <div className="flex items-center space-x-6 p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/30 dark:via-indigo-900/30 dark:to-blue-900/30 border-2 border-purple-200/60 dark:border-purple-700/60 hover-lift">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{leader.name}</h3>
                  <p className="text-purple-700 dark:text-purple-300 font-medium">GBC - Governing Body Commissioner & Congregational Minister</p>
                </div>
              </div>
            </div>
          ))}

          {/* Regional Directors */}
          <div className="ml-6 space-y-3">
            {hierarchy?.regionalDirectors && hierarchy.regionalDirectors.length > 0 && (
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {hierarchy.regionalDirectors.map(director => director.name).join(', ')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Regional Directors</p>
                </div>
              </div>
            )}

            {/* Co-Regional Directors */}
            <div className="ml-6 space-y-2">
              {hierarchy?.coRegionalDirectors && hierarchy.coRegionalDirectors.length > 0 && (
                <div className="flex items-center space-x-3 p-3 rounded-lg glass border border-gray-200/50 dark:border-slate-600/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-green-500 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                      {hierarchy.coRegionalDirectors.map(coDirector => coDirector.name).join(', ')}
                    </h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Co-Regional Directors</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-in">
        <EnhancedStatsCard
          title="Total Devotees"
          value={dashboard?.totalDevotees || 0}
          change="+12.5%"
          changeLabel="vs last month"
          icon={Users}
          gradient="from-blue-400 via-blue-500 to-blue-600"
          color="blue"
          positive
        />
        <EnhancedStatsCard
          title="Total Namhattas"
          value={dashboard?.totalNamhattas || 0}
          change="+3 new"
          changeLabel="this month"
          icon={Home}
          gradient="from-emerald-400 via-emerald-500 to-emerald-600"
          color="emerald"
          positive
        />
        <EnhancedStatsCard
          title="Recent Updates"
          value={dashboard?.recentUpdates?.length || 0}
          change="+8"
          changeLabel="this week"
          icon={Calendar}
          gradient="from-purple-400 via-purple-500 to-purple-600"
          color="purple"
          positive
        />
        <EnhancedStatsCard
          title="Active Programs"
          value={24}
          change="+15%"
          changeLabel="engagement"
          icon={TrendingUp}
          gradient="from-orange-400 via-orange-500 to-orange-600"
          color="orange"
          positive
        />
      </div>



      {/* Recent Activity & Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Namhatta Updates */}
        <Card className="glass-card animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                  <Home className="h-4 w-4 text-white" />
                </div>
                <span className="gradient-text">Recent Updates</span>
              </CardTitle>
              <Button variant="ghost" className="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard?.recentUpdates?.map((update, index) => (
              <div key={index} className="relative group">
                <div className="flex items-start space-x-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/30 dark:border-emerald-700/30 hover-lift cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                      {update.namhattaName}
                    </h3>
                    <p className="text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
                      {update.programType}
                    </p>
                    <div className="flex items-center mt-3 space-x-6">
                      <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center bg-white/60 dark:bg-slate-700/60 px-3 py-1 rounded-full">
                        <Calendar className="mr-2 h-3 w-3" />
                        {update.date}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center bg-white/60 dark:bg-slate-700/60 px-3 py-1 rounded-full">
                        <Users className="mr-2 h-3 w-3" />
                        {update.attendance} attendees
                      </span>
                    </div>
                  </div>
                  <Badge className="status-badge-active">
                    <Zap className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Devotional Status Distribution */}
        <Card className="glass-card animate-slide-up">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <span className="gradient-text">Status Distribution</span>
              </CardTitle>
              <Button variant="ghost" className="text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                Manage Statuses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <StatusProgressBar label="Bhakta" count={542} percentage={43} color="from-blue-400 to-blue-600" />
            <StatusProgressBar label="Bhaktin" count={389} percentage={31} color="from-emerald-400 to-emerald-600" />
            <StatusProgressBar label="Initiated" count={234} percentage={19} color="from-purple-400 to-purple-600" />
            <StatusProgressBar label="Brahmachari" count={82} percentage={7} color="from-orange-400 to-orange-600" />
          </CardContent>
        </Card>
      </div>


    </div>
  );
}

function EnhancedStatsCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon: Icon, 
  gradient, 
  color,
  positive = false
}: {
  title: string;
  value: number;
  change: string;
  changeLabel: string;
  icon: any;
  gradient: string;
  color: string;
  positive?: boolean;
}) {
  return (
    <Card className="group stat-card hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <Badge className={positive ? "status-badge-active" : "status-badge-pending"}>
            {positive ? <TrendingUp className="mr-1 h-3 w-3" /> : <AlertTriangle className="mr-1 h-3 w-3" />}
            {change}
          </Badge>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
            {value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{changeLabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusProgressBar({ label, count, percentage, color }: {
  label: string;
  count: number;
  percentage: number;
  color: string;
}) {
  return (
    <div className="group space-y-3 p-4 rounded-xl bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50 border border-gray-200/30 dark:border-gray-600/30 hover-lift">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</span>
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{count}</span>
          <Badge className="status-badge-active text-xs">{percentage}%</Badge>
        </div>
      </div>
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
          <div 
            className={`bg-gradient-to-r ${color} h-3 rounded-full transition-all duration-700 ease-out shadow-sm group-hover:shadow-md`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full pointer-events-none" />
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
    <div className="p-6 space-y-8">
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
