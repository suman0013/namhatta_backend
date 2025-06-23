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
import { Home, Users, Calendar, Search, Plus, Edit, MapPin } from "lucide-react";
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
    status: "",
  });

  const { data: namhattas, isLoading } = useQuery({
    queryKey: ["/api/namhattas", page, pageSize, searchTerm, filters],
    queryFn: () => api.getNamhattas(page, pageSize, { ...filters, search: searchTerm }),
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset dependent filters
      ...(key === "country" && { state: "", district: "", subDistrict: "", village: "" }),
      ...(key === "state" && { district: "", subDistrict: "", village: "" }),
      ...(key === "district" && { subDistrict: "", village: "" }),
      ...(key === "subDistrict" && { village: "" }),
    }));
    setPage(1);
  };

  if (isLoading) {
    return <NamhattasSkeleton />;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
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
        <CardContent className="p-6 space-y-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

            <Select value={filters.status || "All Statuses"} onValueChange={(value) => handleFilterChange("status", value === "All Statuses" ? "" : value)}>
              <SelectTrigger className="glass border-0">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Active Filters */}
          <ActiveFilters
            filters={filters}
            searchTerm={searchTerm}
            onRemoveFilter={(key) => handleFilterChange(key, "")}
            onClearAll={() => {
              setFilters({ country: "", state: "", district: "", subDistrict: "", village: "", status: "" });
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

      {/* Namhattas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10">
        {namhattas?.data?.map((namhatta) => (
          <NamhattaCard key={namhatta.id} namhatta={namhatta} onEdit={handleEditNamhatta} />
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

function NamhattaCard({ namhatta, onEdit }: { namhatta: Namhatta; onEdit: (namhatta: Namhatta) => void }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="status-badge-active">Approved</Badge>;
      case "PENDING_APPROVAL":
        return <Badge className="status-badge-pending">Pending Approval</Badge>;
      default:
        return <Badge className="status-badge-inactive">{status}</Badge>;
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

  return (
    <Card className="glass-card hover-lift group cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${getGradientClass(namhatta.id)} rounded-xl flex items-center justify-center`}>
            <Home className="h-6 w-6 text-white" />
          </div>
          {getStatusBadge(namhatta.status)}
        </div>
        
        <Link href={`/namhattas/${namhatta.id}`}>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
            {namhatta.name}
          </h3>
        </Link>
        
        {namhatta.address && (
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm mb-3">
            <MapPin className="mr-1 h-3 w-3" />
            <span>
              {[
                namhatta.address.village,
                namhatta.address.district,
                namhatta.address.state
              ].filter(Boolean).join(", ")}
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center">
            <Users className="mr-1 h-3 w-3" />
            45 devotees
          </span>
          <span className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            Weekly
          </span>
        </div>
        
        <div className="flex space-x-2">
          <Link href={`/namhattas/${namhatta.id}`} className="flex-1">
            <Button variant="secondary" className="w-full glass">
              View Details
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="icon" 
            className="glass"
            onClick={() => onEdit(namhatta)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NamhattasSkeleton() {
  return (
    <div className="p-6 space-y-8">
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
