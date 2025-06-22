import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { api } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  Users, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Edit, 
  ArrowLeft,
  UserPlus,
  Activity,
  TrendingUp,
  Clock,
  Image as ImageIcon,
  Facebook,
  Youtube
} from "lucide-react";
import type { Namhatta, Devotee } from "@/lib/types";

export default function NamhattaDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: namhatta, isLoading } = useQuery({
    queryKey: ["/api/namhattas", id],
    queryFn: () => api.getNamhatta(parseInt(id!)),
    enabled: !!id,
  });

  const { data: devotees } = useQuery({
    queryKey: ["/api/namhattas", id, "devotees"],
    queryFn: () => api.getNamhattaDevotees(parseInt(id!), 1, 10),
    enabled: !!id,
  });

  const { data: updates } = useQuery({
    queryKey: ["/api/namhattas", id, "updates"],
    queryFn: () => api.getNamhattaUpdates(parseInt(id!)),
    enabled: !!id,
  });

  const { data: statusCounts } = useQuery({
    queryKey: ["/api/namhattas", id, "status-count"],
    queryFn: () => api.getNamhattaDevoteeStatusCount(parseInt(id!)),
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => api.approveNamhatta(parseInt(id!)),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Namhatta approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/namhattas", id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve Namhatta",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <NamhattaDetailSkeleton />;
  }

  if (!namhatta) {
    return (
      <div className="p-6">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Namhatta not found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The requested Namhatta could not be found.
            </p>
            <Link href="/namhattas">
              <Button>Back to Namhattas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="status-badge-active">Active</Badge>;
      case "pending":
        return <Badge className="status-badge-pending">Pending</Badge>;
      case "inactive":
        return <Badge className="status-badge-inactive">Inactive</Badge>;
      default:
        return <Badge className="status-badge-inactive">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/namhattas">
            <Button variant="outline" size="icon" className="glass">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{namhatta.name}</h1>
            <div className="flex items-center space-x-4 mt-2">
              {getStatusBadge(namhatta.status)}
              {namhatta.address && (
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>
                    {[
                      namhatta.address.village,
                      namhatta.address.district,
                      namhatta.address.state
                    ].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          {namhatta.status === "pending" && (
            <Button
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          )}
          <Button variant="outline" className="glass">
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devotees">Devotees</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Devotees</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {devotees?.total || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Programs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {updates?.length || 0}
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
                    <p className="text-sm text-gray-600 dark:text-gray-400">Avg Attendance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {updates?.length ? Math.round(updates.reduce((acc, update) => acc + update.attendance, 0) / updates.length) : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                    <Home className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Leader Role</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {namhatta.leaderRole || "Not assigned"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Address Details */}
          {namhatta.address && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {namhatta.address.country && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Country</p>
                      <p className="font-medium text-gray-900 dark:text-white">{namhatta.address.country}</p>
                    </div>
                  )}
                  {namhatta.address.state && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">State</p>
                      <p className="font-medium text-gray-900 dark:text-white">{namhatta.address.state}</p>
                    </div>
                  )}
                  {namhatta.address.district && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">District</p>
                      <p className="font-medium text-gray-900 dark:text-white">{namhatta.address.district}</p>
                    </div>
                  )}
                  {namhatta.address.subDistrict && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Sub-District</p>
                      <p className="font-medium text-gray-900 dark:text-white">{namhatta.address.subDistrict}</p>
                    </div>
                  )}
                  {namhatta.address.village && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Village</p>
                      <p className="font-medium text-gray-900 dark:text-white">{namhatta.address.village}</p>
                    </div>
                  )}
                  {namhatta.address.details && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Additional Details</p>
                      <p className="font-medium text-gray-900 dark:text-white">{namhatta.address.details}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="devotees" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Devotees</h3>
            <Button className="gradient-button">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Devotee
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devotees?.data?.map((devotee) => (
              <DevoteeCard key={devotee.id} devotee={devotee} />
            ))}
          </div>

          {devotees?.data?.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No devotees found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">This Namhatta doesn't have any devotees yet.</p>
                <Button className="gradient-button">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add First Devotee
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="updates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Program Updates</h3>
            <Button className="gradient-button">
              <Calendar className="mr-2 h-4 w-4" />
              Add Update
            </Button>
          </div>

          <div className="space-y-4">
            {updates?.map((update) => (
              <UpdateCard key={update.id} update={update} />
            ))}
          </div>

          {updates?.length === 0 && (
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No updates found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">No program updates have been posted yet.</p>
                <Button className="gradient-button">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add First Update
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics & Insights</h3>
          
          {/* Status Distribution */}
          {statusCounts && Object.keys(statusCounts).length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Devotional Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">{status}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full"
                            style={{ width: `${(count / (devotees?.total || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DevoteeCard({ devotee }: { devotee: Devotee }) {
  return (
    <Card className="glass-card hover-lift group">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar>
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
              {devotee.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <Link href={`/devotees/${devotee.id}`}>
              <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 truncate">
                {devotee.name}
              </h4>
            </Link>
            <p className="text-sm text-gray-600 dark:text-gray-400">{devotee.occupation}</p>
          </div>
        </div>
        {devotee.presentAddress && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {[
              devotee.presentAddress.village,
              devotee.presentAddress.district
            ].filter(Boolean).join(", ")}
          </p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {devotee.gurudev}
          </span>
          <Badge variant="secondary" className="text-xs">
            Status ID: {devotee.statusId}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function UpdateCard({ update }: { update: any }) {
  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{update.programType}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                <Calendar className="mr-1 h-3 w-3" />
                {new Date(update.date).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Users className="mr-1 h-3 w-3" />
                {update.attendance} attendees
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {update.hasKirtan && <Badge variant="secondary">Kirtan</Badge>}
            {update.hasPrasadam && <Badge variant="secondary">Prasadam</Badge>}
            {update.hasClass && <Badge variant="secondary">Class</Badge>}
          </div>
        </div>
        
        {update.specialAttraction && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{update.specialAttraction}</p>
        )}
        
        <div className="flex items-center space-x-4">
          {update.imageUrls?.length > 0 && (
            <Button variant="outline" size="sm" className="glass">
              <ImageIcon className="mr-1 h-3 w-3" />
              {update.imageUrls.length} Photos
            </Button>
          )}
          {update.facebookLink && (
            <Button variant="outline" size="sm" className="glass">
              <Facebook className="mr-1 h-3 w-3" />
              Facebook
            </Button>
          )}
          {update.youtubeLink && (
            <Button variant="outline" size="sm" className="glass">
              <Youtube className="mr-1 h-3 w-3" />
              YouTube
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function NamhattaDetailSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex space-x-3">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="glass-card">
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
