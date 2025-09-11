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
import { AdvancedPagination } from "@/components/ui/advanced-pagination";
import { Home, Users, Calendar, Search, Plus, MapPin, User, Grid3X3, List } from "lucide-react";
import { Link } from "wouter";
import NamhattaForm from "@/components/forms/NamhattaForm";
import type { Namhatta } from "@/lib/types";

export default function Namhattas() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingNamhatta, setEditingNamhatta] = useState<Namhatta | undefined>();
  const [filters, setFilters] = useState({
    country: "",
    state: "",
    district: "",
    subDistrict: "",
    village: "",
    postalCode: "",
    status: "",
  });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: namhattas, isLoading } = useQuery({
    queryKey: ["/api/namhattas", page, pageSize, searchTerm, filters, sortBy, sortOrder],
    queryFn: () => api.getNamhattas(page, pageSize, { ...filters, search: searchTerm, sortBy, sortOrder }),
  });

  const handleCreateNamhatta = () => {
    setEditingNamhatta(undefined);
    setShowForm(true);
  };

  const handleEditNamhatta = (namhatta: Namhatta) => {
    setEditingNamhatta(namhatta);
    setShowForm(true);
  };

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

  const { data: subDistricts } = useQuery({
    queryKey: ["/api/sub-districts", filters.district],
    queryFn: () => api.getSubDistricts(filters.district),
    enabled: !!filters.district,
  });

  const { data: villages } = useQuery({
    queryKey: ["/api/villages", filters.subDistrict],
    queryFn: () => api.getVillages(filters.subDistrict),
    enabled: !!filters.subDistrict,
  });

  const { data: pincodes } = useQuery({
    queryKey: ["/api/pincodes", filters.village, filters.district, filters.subDistrict],
    queryFn: () => api.getPincodes(filters.village, filters.district, filters.subDistrict),
    enabled: !!filters.subDistrict,
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset dependent filters
      ...(key === "country" && { state: "", district: "", subDistrict: "", village: "", postalCode: "" }),
      ...(key === "state" && { district: "", subDistrict: "", village: "", postalCode: "" }),
      ...(key === "district" && { subDistrict: "", village: "", postalCode: "" }),
      ...(key === "subDistrict" && { village: "", postalCode: "" }),
      ...(key === "village" && { postalCode: "" }),
    }));
    setPage(1);
  };

  if (isLoading) {
    return <NamhattasSkeleton />;
  }

  return (
    <div className="space-y-1">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-1 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Namhattas Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and monitor all Namhatta centers</p>
        </div>
        <Button className="gradient-button" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Namhatta
        </Button>
      </div>

      {/* Search and Filters Section */}
      <Card className="glass-card relative z-50">
        <CardContent className="p-2 space-y-1">
          {/* Search Bar */}
          <SearchInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setPage(1);
            }}
            placeholder="Search namhattas by name, code, location, or leaders..."
            debounceMs={500}
          />

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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
              value={filters.subDistrict || "All Sub-Districts"}
              onValueChange={(value) => handleFilterChange("subDistrict", value === "All Sub-Districts" ? "" : value)}
              options={["All Sub-Districts", ...(subDistricts || [])]}
              placeholder="All Sub-Districts"
              disabled={!filters.district}
              className="glass border-0"
            />

            <SearchableSelect
              value={filters.village || "All Villages"}
              onValueChange={(value) => handleFilterChange("village", value === "All Villages" ? "" : value)}
              options={["All Villages", ...(villages || [])]}
              placeholder="All Villages"
              disabled={!filters.subDistrict}
              className="glass border-0"
            />

            <SearchableSelect
              value={filters.postalCode || "All Postal Codes"}
              onValueChange={(value) => handleFilterChange("postalCode", value === "All Postal Codes" ? "" : value)}
              options={["All Postal Codes", ...(pincodes || [])]}
              placeholder="All Postal Codes"
              disabled={!filters.subDistrict}
              className="glass border-0"
            />

            <SearchableSelect
              value={filters.status || "All Statuses"}
              onValueChange={(value) => handleFilterChange("status", value === "All Statuses" ? "" : value)}
              options={["All Statuses", "APPROVED", "PENDING_APPROVAL"]}
              placeholder="Filter by Status"
              className="glass border-0"
            />
          </div>
          
          {/* Active Filters */}
          <ActiveFilters
            filters={filters}
            searchTerm={searchTerm}
            onRemoveFilter={(key) => handleFilterChange(key, "")}
            onClearAll={() => {
              setFilters({ country: "", state: "", district: "", subDistrict: "", village: "", postalCode: "", status: "" });
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
        <CardContent className="p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {namhattas?.total ? `Showing ${namhattas.total} namhattas` : 'No namhattas found'}
              </div>
              <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 px-3"
                  data-testid="button-grid-view"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 px-3"
                  data-testid="button-list-view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
              <Select value={sortBy} onValueChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}>
                <SelectTrigger className="w-40 glass border-0">
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
                onClick={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  setPage(1);
                }}
                className="glass border-0 px-3"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Namhattas Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 relative z-10"
        : "space-y-3 relative z-10"
      }>
        {namhattas?.data?.map((namhatta) => (
          <NamhattaCard key={namhatta.id} namhatta={namhatta} viewMode={viewMode} />
        ))}
      </div>

      {/* Pagination */}
      {namhattas && namhattas.total > 0 && (
        <AdvancedPagination
          currentPage={page}
          totalPages={Math.ceil(namhattas.total / pageSize)}
          pageSize={pageSize}
          totalItems={namhattas.total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          showingFrom={Math.min(((page - 1) * pageSize) + 1, namhattas.total)}
          showingTo={Math.min(page * pageSize, namhattas.total)}
        />
      )}

      {/* Form Modal */}
      {(showForm || editingNamhatta) && (
        <NamhattaForm
          namhatta={editingNamhatta}
          onClose={() => {
            setShowForm(false);
            setEditingNamhatta(undefined);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingNamhatta(undefined);
          }}
        />
      )}
    </div>
  );
}

function NamhattaCard({ namhatta, viewMode = 'grid' }: { namhatta: Namhatta; viewMode?: 'grid' | 'list' }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 px-2 py-1 rounded-full text-xs font-medium">Approved</Badge>;
      case "PENDING_APPROVAL":
      case "pending":
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded-full text-xs font-medium">Pending</Badge>;
      case "REJECTED":
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300 px-2 py-1 rounded-full text-xs font-medium">{status}</Badge>;
    }
  };

  const getGradientClass = (index: number) => {
    const gradients = [
      "from-emerald-400 to-teal-500",
      "from-blue-400 to-indigo-500",
      "from-purple-400 to-pink-500",
      "from-orange-400 to-red-500",
    ];
    return gradients[index % gradients.length];
  };

  if (viewMode === 'list') {
    // List View
    return (
      <Link href={`/namhattas/${namhatta.id}`} data-testid={`link-namhatta-${namhatta.id}`}>
        <Card className="glass-card hover-lift group cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${getGradientClass(namhatta.id)} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Home className="h-7 w-7 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {namhatta.name}
                    </h3>
                    {namhatta.address && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mt-1">
                        <MapPin className="mr-1 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {[
                            namhatta.address.village,
                            namhatta.address.district,
                            namhatta.address.state
                          ].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {getStatusBadge(namhatta.status)}
                </div>
                
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span>{namhatta.devoteeCount || 0} devotees</span>
                  </div>
                  {namhatta.secretary && (
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span>Secretary: {namhatta.secretary}</span>
                    </div>
                  )}
                  {(namhatta.meetingDay || namhatta.meetingTime) && (
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span>
                        {namhatta.meetingDay && namhatta.meetingTime 
                          ? `${namhatta.meetingDay} at ${namhatta.meetingTime}`
                          : namhatta.meetingDay || namhatta.meetingTime}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Grid View (default)
  return (
    <div className="h-[280px]">
      <Link href={`/namhattas/${namhatta.id}`} data-testid={`link-namhatta-${namhatta.id}`}>
        <Card className="glass-card hover-lift group cursor-pointer h-full">
          <CardContent className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${getGradientClass(namhatta.id)} rounded-xl flex items-center justify-center`}>
                <Home className="h-6 w-6 text-white" />
              </div>
              {getStatusBadge(namhatta.status)}
            </div>
            
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
              {namhatta.name}
            </h3>
            
            <div className="flex-grow">
              {namhatta.address && (
                <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-3">
                  <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                  <span className="line-clamp-2">
                    {[
                      namhatta.address.village,
                      namhatta.address.district,
                      namhatta.address.state
                    ].filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center">
                  <Users className="mr-2 h-3 w-3" />
                  <span>{namhatta.devoteeCount || 0} devotees</span>
                </div>
                {namhatta.secretary && (
                  <div className="flex items-center">
                    <User className="mr-2 h-3 w-3" />
                    <span>Secretary: {namhatta.secretary}</span>
                  </div>
                )}
                {(namhatta.meetingDay || namhatta.meetingTime) && (
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-3 w-3" />
                    <span>
                      {namhatta.meetingDay && namhatta.meetingTime 
                        ? `${namhatta.meetingDay} at ${namhatta.meetingTime}`
                        : namhatta.meetingDay || namhatta.meetingTime}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function NamhattasSkeleton() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Search and Filters Skeleton */}
      <Card className="glass-card">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Namhattas Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
