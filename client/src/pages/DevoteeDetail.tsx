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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Edit,
  MapPin,
  Heart,
  GraduationCap,
  Briefcase,
  User,
  Users,
  Calendar,
  TrendingUp,
  Book,
  Award,
  Phone,
  Mail,
  Zap,
  Home,
  Activity,
  Building
} from "lucide-react";
import type { Devotee } from "@/lib/types";
import DevoteeForm from "@/components/forms/DevoteeForm";

export default function DevoteeDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showEditForm, setShowEditForm] = useState(false);
  const [statusComment, setStatusComment] = useState("");
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

  const { data: devotee, isLoading } = useQuery({
    queryKey: ["/api/devotees", id],
    queryFn: () => api.getDevotee(parseInt(id!)),
    enabled: !!id,
  });

  const { data: statuses } = useQuery({
    queryKey: ["/api/statuses"],
    queryFn: () => api.getStatuses(),
  });

  const { data: statusHistory } = useQuery({
    queryKey: ["/api/devotees", id, "status-history"],
    queryFn: () => api.getDevoteeStatusHistory(parseInt(id!)),
    enabled: !!id,
  });

  const upgradeStatusMutation = useMutation({
    mutationFn: ({ newStatusId, notes }: { newStatusId: number; notes?: string }) => 
      api.upgradeDevoteeStatus(parseInt(id!), newStatusId, notes),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Devotional status upgraded successfully",
      });
      setStatusComment(""); // Clear the comment after successful update
      queryClient.invalidateQueries({ queryKey: ["/api/devotees", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/devotees", id, "status-history"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upgrade status",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <DevoteeDetailSkeleton />;
  }

  if (!devotee) {
    return (
      <div className="p-6">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Devotee not found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The requested devotee could not be found.
            </p>
            <Link href="/devotees">
              <Button>Back to Devotees</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusName = (statusId?: number) => {
    if (!statusId) return "Unknown";
    const status = statuses?.find(s => s.id === statusId);
    return status?.name || "Unknown";
  };

  const getStatusColor = (statusId?: number) => {
    if (!statusId) return "bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300";
    
    const statusName = getStatusName(statusId).toLowerCase();
    if (statusName.includes("bhakta")) return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
    if (statusName.includes("initiated")) return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300";
    if (statusName.includes("brahmachari")) return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300";
    return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300";
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/devotees">
            <Button variant="outline" size="icon" className="glass">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-600 text-white text-xl">
                {devotee.legalName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{devotee.legalName}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={getStatusColor(devotee.devotionalStatusId)}>
                  {getStatusName(devotee.devotionalStatusId)}
                </Badge>
                {devotee.occupation && (
                  <span className="text-gray-600 dark:text-gray-400 flex items-center">
                    <Briefcase className="mr-1 h-4 w-4" />
                    {devotee.occupation}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="glass" onClick={() => setShowEditForm(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="status">Status Management</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-2">
            {/* Basic Information */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center mb-1">
                      <User className="h-3 w-3 text-blue-600 dark:text-blue-400 mr-1" />
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Legal Name</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.legalName}</p>
                  </div>
                  {devotee.dob && (
                    <div className="p-2 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-3 w-3 text-emerald-600 dark:text-emerald-400 mr-1" />
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Date of Birth</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {new Date(devotee.dob).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {devotee.email && (
                    <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center mb-1">
                        <Mail className="h-3 w-3 text-purple-600 dark:text-purple-400 mr-1" />
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Email</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.email}</p>
                    </div>
                  )}
                  {devotee.phone && (
                    <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center mb-1">
                        <Phone className="h-3 w-3 text-orange-600 dark:text-orange-400 mr-1" />
                        <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Phone</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.phone}</p>
                    </div>
                  )}
                  {devotee.gender && (
                    <div className="p-2 bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="flex items-center mb-1">
                        <Users className="h-3 w-3 text-pink-600 dark:text-pink-400 mr-1" />
                        <p className="text-xs font-medium text-pink-600 dark:text-pink-400">Gender</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.gender}</p>
                    </div>
                  )}
                  {devotee.bloodGroup && (
                    <div className="p-2 bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center mb-1">
                        <Zap className="h-3 w-3 text-red-600 dark:text-red-400 mr-1" />
                        <p className="text-xs font-medium text-red-600 dark:text-red-400">Blood Group</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.bloodGroup}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Family Information */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center mr-2">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  Family Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                  {devotee.fatherName && (
                    <div className="p-2 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center mb-1">
                        <User className="h-3 w-3 text-emerald-600 dark:text-emerald-400 mr-1" />
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Father's Name</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.fatherName}</p>
                    </div>
                  )}
                  {devotee.motherName && (
                    <div className="p-2 bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                      <div className="flex items-center mb-1">
                        <Heart className="h-3 w-3 text-pink-600 dark:text-pink-400 mr-1" />
                        <p className="text-xs font-medium text-pink-600 dark:text-pink-400">Mother's Name</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.motherName}</p>
                    </div>
                  )}
                  {devotee.maritalStatus && (
                    <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center mb-1">
                        <Users className="h-3 w-3 text-purple-600 dark:text-purple-400 mr-1" />
                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Marital Status</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.maritalStatus}</p>
                    </div>
                  )}
                  {devotee.husbandName && (
                    <div className="p-2 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-center mb-1">
                        <User className="h-3 w-3 text-indigo-600 dark:text-indigo-400 mr-1" />
                        <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Husband's Name</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.husbandName}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-base">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center mr-2">
                    <GraduationCap className="h-3 w-3 text-white" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {devotee.education && (
                    <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center mb-1">
                        <GraduationCap className="h-3 w-3 text-orange-600 dark:text-orange-400 mr-1" />
                        <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Education</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.education}</p>
                    </div>
                  )}
                  {devotee.occupation && (
                    <div className="p-2 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                      <div className="flex items-center mb-1">
                        <Briefcase className="h-3 w-3 text-cyan-600 dark:text-cyan-400 mr-1" />
                        <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Occupation</p>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.occupation}</p>
                    </div>
                  )}
                </div>
                {devotee.additionalComments && (
                  <div className="mt-2 p-2 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                    <div className="flex items-center mb-1">
                      <Book className="h-3 w-3 text-gray-600 dark:text-gray-400 mr-1" />
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Additional Comments</p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{devotee.additionalComments}</p>
                  </div>
                )}
                {devotee.shraddhakutirId && (
                  <div className="mt-2 p-2 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/20 dark:to-gray-900/20 rounded-lg border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center mb-1">
                      <Home className="h-3 w-3 text-slate-600 dark:text-slate-400 mr-1" />
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Shraddhakutir</p>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      Shraddhakutir ID: {devotee.shraddhakutirId}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Present Address */}
            {devotee.presentAddress && (
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-base">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-2">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    Present Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {devotee.presentAddress.country && (
                      <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center mb-1">
                          <Home className="h-3 w-3 text-blue-600 dark:text-blue-400 mr-1" />
                          <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Country</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.presentAddress.country}</p>
                      </div>
                    )}
                    {devotee.presentAddress.state && (
                      <div className="p-2 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-3 w-3 text-emerald-600 dark:text-emerald-400 mr-1" />
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">State</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.presentAddress.state}</p>
                      </div>
                    )}
                    {devotee.presentAddress.district && (
                      <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center mb-1">
                          <Activity className="h-3 w-3 text-purple-600 dark:text-purple-400 mr-1" />
                          <p className="text-xs font-medium text-purple-600 dark:text-purple-400">District</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.presentAddress.district}</p>
                      </div>
                    )}
                    {devotee.presentAddress.subDistrict && (
                      <div className="p-2 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center mb-1">
                          <TrendingUp className="h-3 w-3 text-orange-600 dark:text-orange-400 mr-1" />
                          <p className="text-xs font-medium text-orange-600 dark:text-orange-400">Sub-District</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.presentAddress.subDistrict}</p>
                      </div>
                    )}
                    {devotee.presentAddress.village && (
                      <div className="p-2 bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-200 dark:border-pink-800">
                        <div className="flex items-center mb-1">
                          <Home className="h-3 w-3 text-pink-600 dark:text-pink-400 mr-1" />
                          <p className="text-xs font-medium text-pink-600 dark:text-pink-400">Village</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.presentAddress.village}</p>
                      </div>
                    )}
                    {devotee.presentAddress.postalCode && (
                      <div className="p-2 bg-gradient-to-br from-cyan-50 to-blue-100 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-3 w-3 text-cyan-600 dark:text-cyan-400 mr-1" />
                          <p className="text-xs font-medium text-cyan-600 dark:text-cyan-400">Postal Code</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.presentAddress.postalCode}</p>
                      </div>
                    )}
                    {devotee.presentAddress.landmark && (
                      <div className="md:col-span-2 lg:col-span-3 p-2 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-3 w-3 text-gray-600 dark:text-gray-400 mr-1" />
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Landmark</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.presentAddress.landmark}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Permanent Address */}
            {devotee.permanentAddress && (
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-base">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mr-2">
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    Permanent Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {devotee.permanentAddress.country && (
                      <div className="p-2 bg-gradient-to-br from-indigo-50 to-blue-100 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <div className="flex items-center mb-1">
                          <Home className="h-3 w-3 text-indigo-600 dark:text-indigo-400 mr-1" />
                          <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Country</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.permanentAddress.country}</p>
                      </div>
                    )}
                    {devotee.permanentAddress.state && (
                      <div className="p-2 bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-3 w-3 text-teal-600 dark:text-teal-400 mr-1" />
                          <p className="text-xs font-medium text-teal-600 dark:text-teal-400">State</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.permanentAddress.state}</p>
                      </div>
                    )}
                    {devotee.permanentAddress.district && (
                      <div className="p-2 bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                        <div className="flex items-center mb-1">
                          <Activity className="h-3 w-3 text-violet-600 dark:text-violet-400 mr-1" />
                          <p className="text-xs font-medium text-violet-600 dark:text-violet-400">District</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.permanentAddress.district}</p>
                      </div>
                    )}
                    {devotee.permanentAddress.subDistrict && (
                      <div className="p-2 bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                        <div className="flex items-center mb-1">
                          <TrendingUp className="h-3 w-3 text-amber-600 dark:text-amber-400 mr-1" />
                          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Sub-District</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.permanentAddress.subDistrict}</p>
                      </div>
                    )}
                    {devotee.permanentAddress.village && (
                      <div className="p-2 bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
                        <div className="flex items-center mb-1">
                          <Home className="h-3 w-3 text-rose-600 dark:text-rose-400 mr-1" />
                          <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Village</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.permanentAddress.village}</p>
                      </div>
                    )}
                    {devotee.permanentAddress.postalCode && (
                      <div className="p-2 bg-gradient-to-br from-sky-50 to-blue-100 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-3 w-3 text-sky-600 dark:text-sky-400 mr-1" />
                          <p className="text-xs font-medium text-sky-600 dark:text-sky-400">Postal Code</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.permanentAddress.postalCode}</p>
                      </div>
                    )}
                    {devotee.permanentAddress.landmark && (
                      <div className="md:col-span-2 lg:col-span-3 p-2 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/20 dark:to-gray-900/20 rounded-lg border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center mb-1">
                          <MapPin className="h-3 w-3 text-slate-600 dark:text-slate-400 mr-1" />
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Landmark</p>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{devotee.permanentAddress.landmark}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Spiritual Information */}
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mr-3">
                  <Heart className="h-5 w-5 text-white float-animation" />
                </div>
                Spiritual Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center mb-2">
                    <Award className="h-4 w-4 text-purple-600 dark:text-purple-400 mr-2" />
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Devotional Status</p>
                  </div>
                  <Badge className={getStatusColor(devotee.devotionalStatusId)}>
                    {getStatusName(devotee.devotionalStatusId)}
                  </Badge>
                </div>
                {devotee.harinamInitiationGurudev && (
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Harinam Initiation Gurudev</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">{devotee.harinamInitiationGurudev}</p>
                  </div>
                )}
                {devotee.harinamDate && (
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-400 mr-2" />
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Harinama Initiation Date</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(devotee.harinamDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {devotee.initiatedName && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-2" />
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Initiated Name</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">{devotee.initiatedName}</p>
                  </div>
                )}
                {devotee.pancharatrikInitiationGurudev && (
                  <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-teal-600 dark:text-teal-400 mr-2" />
                      <p className="text-sm font-medium text-teal-600 dark:text-teal-400">Pancharatrik Initiation Gurudev</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">{devotee.pancharatrikInitiationGurudev}</p>
                  </div>
                )}
                {devotee.pancharatrikDate && (
                  <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl border border-pink-200 dark:border-pink-800">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 text-pink-600 dark:text-pink-400 mr-2" />
                      <p className="text-sm font-medium text-pink-600 dark:text-pink-400">Pancharatrik Initiation Date</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {new Date(devotee.pancharatrikDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {devotee.additionalComments && (
                <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-gray-900/20 dark:to-slate-900/20 rounded-xl border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center mb-2">
                    <Book className="h-4 w-4 text-gray-600 dark:text-gray-400 mr-2" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Additional Comments</p>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{devotee.additionalComments}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Devotional Courses */}
          {devotee.devotionalCourses && devotee.devotionalCourses.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Book className="mr-2 h-5 w-5" />
                  Devotional Courses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devotee.devotionalCourses.map((course, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Course Name</p>
                          <p className="font-medium text-gray-900 dark:text-white">{course.name}</p>
                        </div>
                        {course.date && (
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center">
                              <Calendar className="mr-1 h-3 w-3" />
                              {new Date(course.date).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Institute</p>
                          <p className="font-medium text-gray-900 dark:text-white">{course.institute}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Status */}
            <Card className="glass-card min-h-96">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Current Devotional Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {getStatusName(devotee.devotionalStatusId)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(devotee.devotionalStatusId)}>
                    Active
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Upgrade Status</p>
                  <div className="space-y-3">
                    <Select
                      onValueChange={(value) => {
                        setSelectedStatusId(parseInt(value));
                      }}
                      disabled={upgradeStatusMutation.isPending}
                    >
                      <SelectTrigger className="glass border-0">
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses?.filter(status => status.id !== devotee.devotionalStatusId).map((status) => (
                          <SelectItem key={status.id} value={status.id.toString()}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div>
                      <Label htmlFor="statusComment" className="text-sm text-gray-600 dark:text-gray-400">
                        Comment (Optional)
                      </Label>
                      <Textarea
                        id="statusComment"
                        value={statusComment}
                        onChange={(e) => setStatusComment(e.target.value)}
                        placeholder="Add a comment about this status change..."
                        className="glass border-0 mt-1"
                        rows={2}
                      />
                    </div>
                    <Button
                      onClick={() => {
                        if (selectedStatusId) {
                          upgradeStatusMutation.mutate({ 
                            newStatusId: selectedStatusId, 
                            notes: statusComment.trim() || undefined 
                          });
                          setSelectedStatusId(null);
                          setStatusComment("");
                        }
                      }}
                      disabled={!selectedStatusId || upgradeStatusMutation.isPending}
                      className="w-full"
                    >
                      {upgradeStatusMutation.isPending ? "Updating Status..." : "Change Status"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status History */}
            <Card className="glass-card min-h-96">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Status History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {statusHistory?.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                      No status changes recorded yet.
                    </p>
                  ) : (
                    statusHistory?.map((entry: any, index: number) => (
                      <div key={entry.id} className="flex items-center space-x-3 p-3 rounded-lg glass">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Changed to {getStatusName(entry.newStatusId)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(entry.changedAt).toLocaleDateString()}
                          </p>
                          {entry.reason && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic">
                              "{entry.reason}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>




      </Tabs>

      {/* Edit Form Modal */}
      {showEditForm && devotee && (
        <DevoteeForm
          devotee={devotee}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => {
            setShowEditForm(false);
            // Refresh the devotee data
            queryClient.invalidateQueries({ queryKey: ["/api/devotees", id] });
          }}
        />
      )}
    </div>
  );
}

function DevoteeDetailSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
