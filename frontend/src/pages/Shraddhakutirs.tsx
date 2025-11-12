import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import ShraddhakutirForm from "@/components/forms/ShraddhakutirForm";
import { Building, MapPin, Plus, Search, Code } from "lucide-react";
import type { Shraddhakutir } from "@/lib/types";

export default function Shraddhakutirs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const { data: shraddhakutirs, isLoading } = useQuery({
    queryKey: ["/api/shraddhakutirs"],
    queryFn: () => api.getShraddhakutirs(),
  });

  const filteredShraddhakutirs = shraddhakutirs?.filter(shraddhakutir =>
    shraddhakutir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shraddhakutir.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shraddhakutir.districtCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <ShraddhakutirsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shraddhakutirs Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage spiritual centers and their organizational codes
          </p>
        </div>
        <Button className="gradient-button" onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Shraddhakutir
        </Button>
      </div>

      {/* Search and Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Search */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search shraddhakutirs by name, code, or district..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass border-0"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Centers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {shraddhakutirs?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Districts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(shraddhakutirs?.map(s => s.districtCode)).size || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shraddhakutirs List */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            Shraddhakutirs Directory
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredShraddhakutirs && filteredShraddhakutirs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredShraddhakutirs.map((shraddhakutir, index) => (
                <ShraddhakutirCard
                  key={shraddhakutir.id}
                  shraddhakutir={shraddhakutir}
                  index={index}
                />
              ))}
            </div>
          ) : searchTerm ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No results found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                No shraddhakutirs match your search criteria. Try adjusting your search terms.
              </p>
              <Button
                onClick={() => setSearchTerm("")}
                variant="outline"
                className="glass"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No shraddhakutirs found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first shraddhakutir to start managing spiritual centers.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="gradient-button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Shraddhakutir
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {showForm && (
        <ShraddhakutirForm
          onClose={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function ShraddhakutirCard({ 
  shraddhakutir, 
  index 
}: { 
  shraddhakutir: Shraddhakutir; 
  index: number; 
}) {
  const getGradientClass = (index: number) => {
    const gradients = [
      "from-emerald-400 to-teal-500",
      "from-blue-400 to-indigo-500",
      "from-purple-400 to-pink-500",
      "from-orange-400 to-red-500",
      "from-cyan-400 to-blue-500",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Card className="glass-card hover:bg-white/90 dark:hover:bg-slate-600/50 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className={`w-12 h-12 bg-gradient-to-br ${getGradientClass(index)} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Building className="h-6 w-6 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
              {shraddhakutir.name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="glass">
                <Code className="mr-1 h-3 w-3" />
                {shraddhakutir.code}
              </Badge>
              <Badge variant="secondary" className="glass">
                <MapPin className="mr-1 h-3 w-3" />
                {shraddhakutir.districtCode}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Created {new Date(shraddhakutir.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ShraddhakutirsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardContent className="p-6">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        {Array.from({ length: 2 }).map((_, i) => (
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
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-32 mb-2" />
                      <div className="flex space-x-2 mb-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}