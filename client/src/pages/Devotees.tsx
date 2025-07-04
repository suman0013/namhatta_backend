import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { SearchInput } from "@/components/ui/search-input";
import { ActiveFilters } from "@/components/ui/filter-badge";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdvancedPagination } from "@/components/ui/advanced-pagination";
import { 
  Users, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  GraduationCap,
  Briefcase,
  Heart,
  User,
  Crown
} from "lucide-react";
import { Link } from "wouter";
import DevoteeForm from "@/components/forms/DevoteeForm";
import type { Devotee } from "@/lib/types";

export default function Devotees() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDevotee, setEditingDevotee] = useState<Devotee | undefined>();
  const [filters, setFilters] = useState({
    country: "",
    state: "",
    district: "",
    statusId: "",
  });
  
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const { data: devotees, isLoading } = useQuery({
    queryKey: ["/api/devotees", page, pageSize, searchTerm, filters, sortBy, sortOrder],
    queryFn: () => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: pageSize.toString(),
        sortBy,
        sortOrder
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
      [key]: value,
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
    <div className="space-y-6">
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
      <Card className="glass-card relative z-50">
        <CardContent className="p-6 space-y-4">
          {/* Search Bar */}
          <SearchInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setPage(1);
            }}
            placeholder="Search devotees by name, email, phone, location, education, occupation..."
            debounceMs={500}
          />

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SearchableSelect
              value={filters.country || "All Countries"}
              onValueChange={(value) => handleFilterChange("country", value === "All Countries" ? "" : value)}
              options={["All Countries", ...(countries || [])]}
              placeholder="All Countries"
              className="glass border-0"
            />

            <SearchableSelect
              value={filters.state || "All States"}
              onValueChange={(value) => handleFilterChange("state", value === "All States" ? "" : value)}
              options={["All States", ...(states || [])]}
              placeholder="All States"
              disabled={!filters.country}
              className="glass border-0"
            />

            <SearchableSelect
              value={filters.district || "All Districts"}
              onValueChange={(value) => handleFilterChange("district", value === "All Districts" ? "" : value)}
              options={["All Districts", ...(districts || [])]}
              placeholder="All Districts"
              disabled={!filters.state}
              className="glass border-0"
            />

            <SearchableSelect
              value={(() => {
                if (!filters.statusId) return "All Statuses";
                const status = statuses?.find(s => s.id.toString() === filters.statusId);
                return status ? status.name : "All Statuses";
              })()}
              onValueChange={(value) => {
                if (value === "All Statuses") {
                  handleFilterChange("statusId", "");
                } else {
                  const status = statuses?.find(s => s.name === value);
                  handleFilterChange("statusId", status ? status.id.toString() : "");
                }
              }}
              options={["All Statuses", ...(statuses?.map(status => status.name) || [])]}
              placeholder="All Statuses"
              className="glass border-0"
            />
          </div>
          
          {/* Active Filters */}
          <ActiveFilters
            filters={filters}
            searchTerm={searchTerm}
            onRemoveFilter={(key) => handleFilterChange(key, "")}
            onClearAll={() => {
              setFilters({ country: "", state: "", district: "", statusId: "" });
              setSearchTerm("");
              setPage(1);
            }}
            onClearSearch={() => {
              setSearchTerm("");
              setPage(1);
            }}
          />
        </CardContent>
      </Card>

      {/* Sorting Controls */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32 glass border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="updatedAt">Updated Date</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="glass border-0"
              >
                {sortOrder === "asc" ? "↑ Ascending" : "↓ Descending"}
              </Button>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {devotees?.total || 0} devotees found
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Devotees Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        {devotees?.data?.map((devotee: any) => (
          <DevoteeCard 
            key={devotee.id} 
            devotee={devotee} 
            statuses={statuses || []}
          />
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
      {devotees && devotees.total > 0 && (
        <AdvancedPagination
          currentPage={page}
          totalPages={Math.ceil(devotees.total / pageSize)}
          pageSize={pageSize}
          totalItems={devotees.total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          showingFrom={Math.min(((page - 1) * pageSize) + 1, devotees.total)}
          showingTo={Math.min(page * pageSize, devotees.total)}
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
    <div className="h-[280px]">
      <Link href={`/devotees/${devotee.id}`}>
        <Card className="glass-card card-hover-effect group h-full cursor-pointer">
          <CardContent className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-purple-600 text-white">
                  {(devotee.legalName || devotee.name || "").substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {devotee.legalName}
                </h3>
                {devotee.initiatedName && (
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 flex items-center">
                    <Crown className="mr-2 h-4 w-4" />
                    {devotee.initiatedName}
                  </p>
                )}
                {devotee.occupation && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                    <Briefcase className="mr-2 h-4 w-4" />
                    {devotee.occupation}
                  </p>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              <Badge className={getStatusColor(devotee.devotionalStatusId)}>
                {getStatusName(devotee.devotionalStatusId)}
              </Badge>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 flex-grow">
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
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function DevoteesSkeleton() {
  return (
    <div className="space-y-6">
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
