import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import StatusForm from "@/components/forms/StatusForm";
import { 
  Layers, 
  Plus, 
  Edit, 
  Users, 
  TrendingUp, 
  Award
} from "lucide-react";
import type { DevotionalStatus } from "@/lib/types";

export default function Statuses() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingStatus, setEditingStatus] = useState<DevotionalStatus | undefined>();

  const { data: statuses, isLoading } = useQuery({
    queryKey: ["/api/statuses"],
    queryFn: () => api.getStatuses(),
  });

  const { data: devotees } = useQuery({
    queryKey: ["/api/devotees"],
    queryFn: () => api.getDevotees(1, 1000), // Get all for counting
  });

  const getDevoteeCount = (statusId: number) => {
    if (!devotees?.data) return 0;
    return devotees.data.filter(devotee => devotee.statusId === statusId).length;
  };

  const getTotalDevotees = () => {
    return devotees?.total || 0;
  };

  const startEditing = (status: DevotionalStatus) => {
    setEditingStatus(status);
    setShowForm(true);
  };

  if (isLoading) {
    return <StatusesSkeleton />;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Devotional Statuses</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage spiritual progression levels and track devotee advancement
          </p>
        </div>
        <Button className="gradient-button" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Status
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl flex items-center justify-center">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Statuses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statuses?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Devotees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getTotalDevotees()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Highest Level</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {statuses?.[statuses.length - 1]?.name || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg per Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statuses?.length ? Math.round(getTotalDevotees() / statuses.length) : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="mr-2 h-5 w-5" />
            Status Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statuses && statuses.length > 0 ? (
            <div className="space-y-4">
              {statuses.map((status, index) => (
                <StatusCard
                  key={status.id}
                  status={status}
                  index={index}
                  devoteeCount={getDevoteeCount(status.id)}
                  totalDevotees={getTotalDevotees()}
                  onEdit={() => startEditing(status)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No statuses found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first devotional status to start tracking spiritual progress.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="gradient-button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <StatusForm
          status={editingStatus}
          onClose={() => {
            setShowForm(false);
            setEditingStatus(undefined);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingStatus(undefined);
          }}
        />
      )}
    </div>
  );
}

function StatusCard({
  status,
  index,
  devoteeCount,
  totalDevotees,
  onEdit,
}: {
  status: DevotionalStatus;
  index: number;
  devoteeCount: number;
  totalDevotees: number;
  onEdit: () => void;
}) {
  const percentage = totalDevotees > 0 ? (devoteeCount / totalDevotees) * 100 : 0;

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-blue-400 to-blue-600",
      "from-emerald-400 to-emerald-600",
      "from-purple-400 to-purple-600",
      "from-orange-400 to-orange-600",
      "from-pink-400 to-pink-600",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="flex items-center space-x-4 p-6 rounded-xl glass border border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-600/50 transition-all duration-200">
      {/* Icon */}
      <div className={`w-12 h-12 bg-gradient-to-br ${getGradientClass(index)} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Award className="h-6 w-6 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {status.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Created {new Date(status.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="glass"
          >
            <Edit className="h-3 w-3 mr-1" />
            Rename
          </Button>
        </div>

        {/* Statistics */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {devoteeCount} devotees ({percentage.toFixed(1)}%)
            </span>
            <Badge
              variant="secondary"
              className={percentage > 20 ? "status-badge-active" : percentage > 10 ? "status-badge-pending" : "status-badge-inactive"}
            >
              {percentage > 20 ? "High" : percentage > 10 ? "Medium" : "Low"} adoption
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 bg-gradient-to-r ${getGradientClass(index)} rounded-full transition-all duration-300`}
              style={{ width: `${Math.max(percentage, 2)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusesSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-6 rounded-xl glass">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-2 w-full" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}