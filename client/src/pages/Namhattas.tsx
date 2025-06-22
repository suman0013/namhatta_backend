import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Users, Calendar, Search, Plus, Edit, MapPin } from "lucide-react";
import { Link } from "wouter";
import type { Namhatta } from "@/lib/types";

export default function Namhattas() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    country: "",
    state: "",
    district: "",
    role: "",
  });

  const { data: namhattas, isLoading } = useQuery({
    queryKey: ["/api/namhattas", page, filters],
    queryFn: () => api.getNamhattas(page, 12, filters),
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
        <Button className="gradient-button">
          <Plus className="mr-2 h-4 w-4" />
          Create New Namhatta
        </Button>
      </div>

      {/* Filters Section */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Select value={filters.country} onValueChange={(value) => handleFilterChange("country", value)}>
              <SelectTrigger className="glass border-0">
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries?.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.state} onValueChange={(value) => handleFilterChange("state", value)} disabled={!filters.country}>
              <SelectTrigger className="glass border-0">
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {states?.map((state) => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.district} onValueChange={(value) => handleFilterChange("district", value)} disabled={!filters.state}>
              <SelectTrigger className="glass border-0">
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {districts?.map((district) => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.role} onValueChange={(value) => handleFilterChange("role", value)}>
              <SelectTrigger className="glass border-0">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="MalaSenapoti">MalaSenapoti</SelectItem>
                <SelectItem value="ChakraSenapoti">ChakraSenapoti</SelectItem>
                <SelectItem value="MahaChakraSenapoti">MahaChakraSenapoti</SelectItem>
                <SelectItem value="UpaChakraSenapoti">UpaChakraSenapoti</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Namhattas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {namhattas?.data?.map((namhatta) => (
          <NamhattaCard key={namhatta.id} namhatta={namhatta} />
        ))}
      </div>

      {/* Pagination */}
      {namhattas && namhattas.total > 12 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{((page - 1) * 12) + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * 12, namhattas.total)}</span> of{" "}
            <span className="font-medium">{namhattas.total}</span> results
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="glass"
            >
              Previous
            </Button>
            {Array.from({ length: Math.ceil(namhattas.total / 12) }, (_, i) => i + 1)
              .filter(p => Math.abs(p - page) <= 2)
              .map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  onClick={() => setPage(p)}
                  className={p === page ? "bg-indigo-500" : "glass"}
                >
                  {p}
                </Button>
              ))}
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(namhattas.total / 12)}
              className="glass"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function NamhattaCard({ namhatta }: { namhatta: Namhatta }) {
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
          <Button variant="outline" size="icon" className="glass">
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
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card className="glass-card">
        <CardContent className="p-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
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
