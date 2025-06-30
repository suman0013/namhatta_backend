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
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Edit,
  MapPin,
  Heart,
  GraduationCap,
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Book,
  Award,
  Phone,
  Mail,
  Zap
} from "lucide-react";
import type { Devotee } from "@/lib/types";
import DevoteeForm from "../components/forms/DevoteeForm";

export default function DevoteeDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: devotee, isLoading } = useQuery({
    queryKey: ["/api/devotees", id],
    queryFn: () => api.getDevotee(parseInt(id!)),
    enabled: !!id,
  });

  const { data: statuses } = useQuery({
    queryKey: ["/api/statuses"],
    queryFn: () => api.getStatuses(),
  });

  const upgradeStatusMutation = useMutation({
    mutationFn: (newStatusId: number) => api.upgradeDevoteeStatus(parseInt(id!), newStatusId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Devotional status upgraded successfully",
      });
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
    <div className="p-6 space-y-6">
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
                {(devotee.name || devotee.legalName).substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{devotee.name || devotee.legalName}</h1>
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="status">Status Management</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Legal Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{devotee.legalName}</p>
                  </div>
                  {devotee.name && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Spiritual Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{devotee.name}</p>
                    </div>
                  )}
                  {devotee.dob && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Date of Birth</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(devotee.dob).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {devotee.gender && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gender</p>
                      <p className="font-medium text-gray-900 dark:text-white">{devotee.gender}</p>
                    </div>
                  )}
                  {devotee.bloodGroup && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Blood Group</p>
                      <p className="font-medium text-gray-900 dark:text-white">{devotee.bloodGroup}</p>
                    </div>
                  )}
                  {devotee.maritalStatus && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Marital Status</p>
                      <p className="font-medium text-gray-900 dark:text-white">{devotee.maritalStatus}</p>
                    </div>
                  )}
                  {devotee.fatherName && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Father's Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{devotee.fatherName}</p>
                    </div>
                  )}
                  {devotee.motherName && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Mother's Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{devotee.motherName}</p>
                    </div>
                  )}
                  {devotee.husbandName && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Husband's Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{devotee.husbandName}</p>
                    </div>
                  )}
                  {devotee.email && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center">
                        <Mail className="mr-1 h-3 w-3" />
                        {devotee.email}
                      </p>
                    </div>
                  )}
                  {devotee.phone && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center">
                        <Phone className="mr-1 h-3 w-3" />
                        {devotee.phone}
                      </p>
                    </div>
                  )}
                  {devotee.education && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Education</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center">
                        <GraduationCap className="mr-1 h-3 w-3" />
                        {devotee.education}
                      </p>
                    </div>
                  )}
                </div>
                {devotee.shraddhakutirId && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Shraddhakutir</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Shraddhakutir ID: {devotee.shraddhakutirId}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {devotee.presentAddress && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Present Address</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {devotee.presentAddress.country && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Country:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.presentAddress.country}</span>
                        </div>
                      )}
                      {devotee.presentAddress.state && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">State:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.presentAddress.state}</span>
                        </div>
                      )}
                      {devotee.presentAddress.district && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">District:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.presentAddress.district}</span>
                        </div>
                      )}
                      {devotee.presentAddress.subDistrict && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Sub-District:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.presentAddress.subDistrict}</span>
                        </div>
                      )}
                      {devotee.presentAddress.village && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Village:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.presentAddress.village}</span>
                        </div>
                      )}
                      {devotee.presentAddress.postalCode && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Postal Code:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.presentAddress.postalCode}</span>
                        </div>
                      )}
                      {devotee.presentAddress.zipcode && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">ZIP Code:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.presentAddress.zipcode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {devotee.permanentAddress && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Permanent Address</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {devotee.permanentAddress.country && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Country:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.permanentAddress.country}</span>
                        </div>
                      )}
                      {devotee.permanentAddress.state && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">State:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.permanentAddress.state}</span>
                        </div>
                      )}
                      {devotee.permanentAddress.district && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">District:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.permanentAddress.district}</span>
                        </div>
                      )}
                      {devotee.permanentAddress.subDistrict && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Sub-District:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.permanentAddress.subDistrict}</span>
                        </div>
                      )}
                      {devotee.permanentAddress.village && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Village:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.permanentAddress.village}</span>
                        </div>
                      )}
                      {devotee.permanentAddress.postalCode && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Postal Code:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.permanentAddress.postalCode}</span>
                        </div>
                      )}
                      {devotee.permanentAddress.zipcode && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">ZIP Code:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{devotee.permanentAddress.zipcode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Spiritual Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5" />
                Spiritual Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devotee.harinamInitiationGurudev && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Harinam Initiation Gurudev</p>
                    <p className="font-medium text-gray-900 dark:text-white">{devotee.harinamInitiationGurudev}</p>
                  </div>
                )}
                {devotee.harinamDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Harinam Initiation Date</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(devotee.harinamDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {devotee.pancharatrikInitiationGurudev && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pancharatrik Initiation Gurudev</p>
                    <p className="font-medium text-gray-900 dark:text-white">{devotee.pancharatrikInitiationGurudev}</p>
                  </div>
                )}
                {devotee.pancharatrikDate && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pancharatrik Initiation Date</p>
                    <p className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(devotee.pancharatrikDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {devotee.initiatedName && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Initiated Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{devotee.initiatedName}</p>
                  </div>
                )}
              </div>
              
              {devotee.devotionalCourses && devotee.devotionalCourses.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Devotional Courses</p>
                  <div className="space-y-2">
                    {devotee.devotionalCourses.map((course, index) => (
                      <div key={index} className="p-3 rounded-lg glass">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white flex items-center">
                              <Book className="mr-1 h-3 w-3" />
                              {course.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {course.institute} • {new Date(course.date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                            <Award className="mr-1 h-3 w-3" />
                            Completed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {devotee.additionalComments && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Additional Comments</p>
                  <p className="text-gray-900 dark:text-white mt-1">{devotee.additionalComments}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Status */}
            <Card className="glass-card">
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
                  <div className="flex space-x-3">
                    <Select
                      onValueChange={(value) => upgradeStatusMutation.mutate(parseInt(value))}
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2 h-5 w-5" />
                Devotional Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {devotee.devotionalCourses && devotee.devotionalCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {devotee.devotionalCourses.map((course, index) => (
                    <div key={index} className="p-4 rounded-lg glass">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                          <Award className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{course.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{course.institute}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Completed on {new Date(course.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Book className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses completed</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    This devotee hasn't completed any devotional courses yet.
                  </p>
                  <Button className="gradient-button">
                    <Book className="mr-2 h-4 w-4" />
                    Add Course
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
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
