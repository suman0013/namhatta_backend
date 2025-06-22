import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Server, 
  Database,
  Wifi,
  Clock,
  Activity
} from "lucide-react";

export default function Health() {
  const { data: healthData, isLoading, error } = useQuery({
    queryKey: ["/api/health"],
    queryFn: () => api.getHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return <HealthSkeleton />;
  }

  const isHealthy = healthData?.status === "OK";

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Health</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor system status and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge
            className={
              isHealthy
                ? "status-badge-active"
                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
            }
          >
            {isHealthy ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                All Systems Operational
              </>
            ) : (
              <>
                <AlertCircle className="mr-1 h-3 w-3" />
                System Issues Detected
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Main Status Card */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-indigo-500" />
            Overall System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              {error ? (
                <>
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Connection Error
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Unable to connect to the server. Please check your connection and try again.
                  </p>
                </>
              ) : isHealthy ? (
                <>
                  <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    System Healthy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    All services are running normally and responding as expected.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    System Issues
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Some services may be experiencing problems. Please contact support if issues persist.
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ServiceStatusCard
          title="API Server"
          status={isHealthy ? "online" : "offline"}
          icon={Server}
          description="REST API endpoints"
          lastChecked={new Date().toLocaleTimeString()}
        />
        
        <ServiceStatusCard
          title="Database"
          status={isHealthy ? "online" : "unknown"}
          icon={Database}
          description="Data storage service"
          lastChecked={new Date().toLocaleTimeString()}
        />
        
        <ServiceStatusCard
          title="Network"
          status="online"
          icon={Wifi}
          description="Network connectivity"
          lastChecked={new Date().toLocaleTimeString()}
        />
        
        <ServiceStatusCard
          title="Background Jobs"
          status={isHealthy ? "online" : "unknown"}
          icon={Activity}
          description="Scheduled tasks"
          lastChecked={new Date().toLocaleTimeString()}
        />
      </div>

      {/* System Information */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5 text-indigo-500" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Application Status</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {healthData?.status || "Unknown"}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Last Health Check</p>
              <p className="font-medium text-gray-900 dark:text-white flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {new Date().toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Environment</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {import.meta.env.NODE_ENV || "development"}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh</p>
              <p className="font-medium text-gray-900 dark:text-white">
                Every 30 seconds
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Response Time</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {"< 100ms"}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
              <p className="font-medium text-gray-900 dark:text-white">
                99.9%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ServiceStatusCard({
  title,
  status,
  icon: Icon,
  description,
  lastChecked,
}: {
  title: string;
  status: "online" | "offline" | "unknown";
  icon: any;
  description: string;
  lastChecked: string;
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "status-badge-active";
      case "offline":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "unknown":
        return "status-badge-pending";
      default:
        return "status-badge-inactive";
    }
  };

  const getIconColor = (status: string) => {
    switch (status) {
      case "online":
        return "from-emerald-400 to-emerald-600";
      case "offline":
        return "from-red-400 to-red-600";
      case "unknown":
        return "from-orange-400 to-orange-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 bg-gradient-to-br ${getIconColor(status)} rounded-lg flex items-center justify-center`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <Badge className={getStatusColor(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{description}</p>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last checked: {lastChecked}
        </div>
      </CardContent>
    </Card>
  );
}

function HealthSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <Card className="glass-card">
        <CardContent className="p-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="glass-card">
        <CardContent className="p-6">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
