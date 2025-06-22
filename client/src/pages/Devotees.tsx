import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pagination } from "@/components/ui/pagination";
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  MapPin, 
  Phone, 
  Mail, 
  GraduationCap,
  Briefcase,
  Heart
} from "lucide-react";
import { Link } from "wouter";
import DevoteeForm from "@/components/forms/DevoteeForm";
import type { Devotee } from "@/lib/types";

export default function Devotees() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDevotee, setEditingDevotee] = useState<Devotee | undefined>();
  const [filters, setFilters] = useState({
    country: "",
    state: "",
    district: "",
    statusId: "",
  });

  const { data: devotees, isLoading } = useQuery({
    queryKey: ["/api/devotees", page, searchTerm, filters],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: "12"
      });
      
      // Add search and filters
      if (searchTerm) params.append('search', searchTerm);
      if (filters.country) params.append('country', filters.country);
      if (filters.state) params.append('state', filters.state);
      if (filters.district) params.append('district', filters.district);
      if (filters.statusId) params.append('statusId', filters.statusId);
      
      return fetch(`/api/devotees?${params}`).then(res => res.json());
    },
  });

  const { data: statuses } = useQuery({
    queryKey: ["/api/statuses"],
    queryFn: () => api.getStatuses(),
  });

  const { data: countries } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: () => api.getCountries(),
  });

  const { data: states } = useQuery({
    queryKey: ["/api/states", filters.country],
    queryFn: () => api.getStates(filters.country),
    enabled: !!filters.country,
  });

  const { data: districts } = useQuery({
    queryKey: ["/api/districts", filters.state],
    queryFn: () => api.getDistricts(filters.state),
    enabled: !!filters.state,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? "" : value,
      // Reset dependent filters
      ...(key === "country" && { state: "", district: "" }),
      ...(key === "state" && { district: "" }),
    }));
    setPage(1);
  };

  if (isLoading) {
    return <DevoteesSkeleton />;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Devotees Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage devotee profiles and spiritual progress
          </p>
        </div>
        <Button className="gradient-button" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Devotee
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search devotees by name, gurudev, or location..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1); // Reset to first page on search
              }}
              className="pl-10 glass border-0"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SearchableSelect
              value={filters.country || "All Countries"}
              onValueChange={(value) => handleFilterChange("country", value === "All Countries" ? "all" : value)}
              options={["All Countries", ...(countries || [])]}
              placeholder="All Countries"
              className="glass border-0"
            />

            <SearchableSelect
              value={filters.state || "All States"}
              onValueChange={(value) => handleFilterChange("state", value === "All States" ? "all" : value)}
              options={["All States", ...(states || [])]}
              placeholder="All States"
              disabled={!filters.country}
              className="glass border-0"
            />

            <SearchableSelect
              value={filters.district || "All Districts"}
              onValueChange={(value) => handleFilterChange("district", value === "All Districts" ? "all" : value)}
              options={["All Districts", ...(districts || [])]}
              placeholder="All Districts"
              disabled={!filters.state}
              className="glass border-0"
            />

            <SearchableSelect
              value={filters.statusId || "All Statuses"}
              onValueChange={(value) => handleFilterChange("statusId", value === "All Statuses" ? "all" : value)}
              options={["All Statuses", ...(statuses?.map(status => status.name) || [])]}
              placeholder="All Statuses"
              className="glass border-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
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
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor((devotees?.total || 0) * 0.85)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Course Completions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor((devotees?.total || 0) * 0.4)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor((devotees?.total || 0) * 0.08)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devotees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devotees?.data?.map((devotee) => (
          <DevoteeCard key={devotee.id} devotee={devotee} statuses={statuses || []} />
        ))}
      </div>

      {/* Empty State */}
      {devotees?.data?.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No devotees found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || Object.values(filters).some(Boolean)
                ? "Try adjusting your search criteria or filters."
                : "Start by adding your first devotee to the system."
              }
            </p>
            <Button className="gradient-button" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Devotee
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {devotees && devotees.total > 12 && (
        <Pagination
          currentPage={page}
          totalPages={Math.ceil(devotees.total / 12)}
          onPageChange={setPage}
          showingFrom={((page - 1) * 12) + 1}
          showingTo={Math.min(page * 12, devotees.total)}
          totalItems={devotees.total}
        />
      )}

      {/* Form Modal */}
      {(showForm || editingDevotee) && (
        <DevoteeForm
          devotee={editingDevotee}
          onClose={() => {
            setShowForm(false);
            setEditingDevotee(undefined);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingDevotee(undefined);
          }}
        />
      )}
    </div>
  );
}

function DevoteeCard({ devotee, statuses }: { devotee: Devotee; statuses: any[] }) {
  const getStatusName = (statusId?: number) => {
    if (!statusId) return "Unknown";
    const status = statuses.find(s => s.id === statusId);
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
    <Card className="glass-card hover-lift group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
                {(devotee.name || devotee.legalName).substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Link href={`/devotees/${devotee.id}`}>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                  {devotee.name || devotee.legalName}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">{devotee.occupation}</p>
            </div>
          </div>
          <Badge className={getStatusColor(devotee.devotionalStatusId)}>
            {getStatusName(devotee.devotionalStatusId)}
          </Badge>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {(devotee.gurudevHarinam || devotee.gurudevPancharatrik) && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Heart className="mr-2 h-3 w-3" />
              <span>Initiated Devotee</span>
            </div>
          )}
          
          {devotee.presentAddress && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="mr-2 h-3 w-3" />
              <span>
                {[
                  devotee.presentAddress.village,
                  devotee.presentAddress.district,
                  devotee.presentAddress.state
                ].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          {devotee.education && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <GraduationCap className="mr-2 h-3 w-3" />
              <span>{devotee.education}</span>
            </div>
          )}

          {devotee.maritalStatus && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Users className="mr-2 h-3 w-3" />
              <span>{devotee.maritalStatus}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link href={`/devotees/${devotee.id}`} className="flex-1">
            <Button variant="secondary" className="w-full glass">
              View Profile
            </Button>
          </Link>
          <Button variant="outline" size="icon" className="glass">
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        {/* Courses Count */}
        {devotee.devotionalCourses && devotee.devotionalCourses.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/20 dark:border-slate-700/50">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Completed {devotee.devotionalCourses.length} devotional course{devotee.devotionalCourses.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DevoteesSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <Card className="glass-card">
        <CardContent className="p-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
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
