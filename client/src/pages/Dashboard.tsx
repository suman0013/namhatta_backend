import { useQuery } from "@tanstack/react-query";
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
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening in your organization.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="glass">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button className="gradient-button">
            <Plus className="mr-2 h-4 w-4" />
            Add Devotee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Devotees"
          value={dashboard?.totalDevotees || 0}
          change="+12.5%"
          changeLabel="vs last month"
          icon={Users}
          gradient="from-blue-400 to-blue-600"
          positive
        />
        <StatsCard
          title="Total Namhattas"
          value={dashboard?.totalNamhattas || 0}
          change="+3 new"
          changeLabel="this month"
          icon={Home}
          gradient="from-emerald-400 to-emerald-600"
          positive
        />
        <StatsCard
          title="Active Programs"
          value={18}
          change="This week"
          changeLabel="scheduled"
          icon={Calendar}
          gradient="from-orange-400 to-orange-600"
        />
        <StatsCard
          title="Pending Approvals"
          value={7}
          change="Urgent"
          changeLabel="needs attention"
          icon={AlertTriangle}
          gradient="from-red-400 to-red-600"
          urgent
        />
      </div>

      {/* Leadership Hierarchy Section */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Crown className="mr-3 h-5 w-5 text-indigo-500" />
              Leadership Hierarchy
            </CardTitle>
            <Button variant="link" className="text-indigo-600 dark:text-indigo-400">
              View Full Hierarchy
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GBC Level */}
          {hierarchy?.gbc?.map((leader) => (
            <div key={leader.id} className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200/50 dark:border-purple-700/50">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{leader.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">GBC - Governing Body Commissioner</p>
              </div>
            </div>
          ))}

          {/* Regional Directors */}
          <div className="ml-6 space-y-3">
            {hierarchy?.regionalDirectors?.map((director) => (
              <div key={director.id} className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{director.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Managing 12 districts</p>
                </div>
              </div>
            ))}

            {/* Co-Regional Directors */}
            <div className="ml-6 space-y-2">
              {hierarchy?.coRegionalDirectors?.map((coDirector) => (
                <div key={coDirector.id} className="flex items-center space-x-3 p-3 rounded-lg glass border border-gray-200/50 dark:border-slate-600/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-green-500 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white text-sm">{coDirector.name}</h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400">6 districts, 156 devotees</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Button variant="link" className="text-emerald-600 dark:text-emerald-400">
                View All
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboard?.recentUpdates?.map((update, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 rounded-xl glass hover:bg-white/80 dark:hover:bg-slate-600/50 transition-all duration-200 group cursor-pointer hover-lift">
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
              <Button variant="link" className="text-purple-600 dark:text-purple-400">
                Manage Statuses
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusProgressBar label="Bhakta" count={542} percentage={43} color="from-blue-400 to-blue-600" />
            <StatusProgressBar label="Bhaktin" count={389} percentage={31} color="from-emerald-400 to-emerald-600" />
            <StatusProgressBar label="Initiated" count={234} percentage={19} color="from-purple-400 to-purple-600" />
            <StatusProgressBar label="Brahmachari" count={82} percentage={7} color="from-orange-400 to-orange-600" />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="mr-3 h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Add Devotee"
              description="Register new member"
              icon={UserPlus}
              gradient="from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20"
              iconGradient="from-indigo-500 to-purple-600"
            />
            <QuickActionCard
              title="Create Namhatta"
              description="New center setup"
              icon={Home}
              gradient="from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"
              iconGradient="from-emerald-500 to-teal-600"
            />
            <QuickActionCard
              title="Schedule Program"
              description="Plan activities"
              icon={CalendarPlus}
              gradient="from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20"
              iconGradient="from-orange-500 to-red-600"
            />
            <QuickActionCard
              title="Generate Report"
              description="Analytics & insights"
              icon={BarChart3}
              gradient="from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
              iconGradient="from-blue-500 to-cyan-600"
            />
          </div>
        </CardContent>
      </Card>
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
  urgent = false 
}: {
  title: string;
  value: number;
  change: string;
  changeLabel: string;
  icon: any;
  gradient: string;
  positive?: boolean;
  urgent?: boolean;
}) {
  return (
    <Card className="group glass-card hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2 group-hover:scale-110 transition-transform duration-300">
              {value.toLocaleString()}
            </p>
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium flex items-center ${
                positive ? 'text-emerald-500' : urgent ? 'text-red-500' : 'text-orange-500'
              }`}>
                {positive && <TrendingUp className="mr-1 h-3 w-3" />}
                {urgent && <AlertTriangle className="mr-1 h-3 w-3" />}
                {!positive && !urgent && <Calendar className="mr-1 h-3 w-3" />}
                {change}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">{changeLabel}</span>
            </div>
          </div>
          <div className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${urgent ? 'animate-pulse-slow' : ''}`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">{count} devotees</span>
      </div>
      <Progress value={percentage} className="h-2">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </Progress>
    </div>
  );
}

function QuickActionCard({ title, description, icon: Icon, gradient, iconGradient }: {
  title: string;
  description: string;
  icon: any;
  gradient: string;
  iconGradient: string;
}) {
  return (
    <Button
      variant="ghost"
      className={`group p-4 bg-gradient-to-br ${gradient} rounded-xl border border-gray-200/50 dark:border-gray-700/50 h-auto flex-col space-y-3 hover-lift hover:shadow-lg`}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
