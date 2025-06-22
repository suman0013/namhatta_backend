import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Building, 
  Plus, 
  MapPin, 
  Calendar, 
  Hash,
  Edit,
  CheckCircle,
  Search
} from "lucide-react";
import type { Shraddhakutir } from "@/lib/types";

const createShraddhakutirSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  districtCode: z.string().min(1, "District code is required").max(10, "District code too long"),
});

export default function Shraddhakutirs() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: shraddhakutirs, isLoading } = useQuery({
    queryKey: ["/api/shraddhakutirs"],
    queryFn: () => api.getShraddhakutirs(),
  });

  const { data: districts } = useQuery({
    queryKey: ["/api/districts", "West Bengal"],
    queryFn: () => api.getDistricts("West Bengal"),
  });

  const createForm = useForm<z.infer<typeof createShraddhakutirSchema>>({
    resolver: zodResolver(createShraddhakutirSchema),
    defaultValues: {
      name: "",
      districtCode: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: z.infer<typeof createShraddhakutirSchema>) => {
      // Generate code automatically: SK-<DISTRICT-CODE>-<SERIAL>
      const existingCount = shraddhakutirs?.filter(s => s.districtCode === data.districtCode).length || 0;
      const serial = (existingCount + 1).toString().padStart(3, '0');
      const code = `SK-${data.districtCode}-${serial}`;
      
      return api.createShraddhakutir({
        ...data,
        code,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Shraddhakutir created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/shraddhakutirs"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create Shraddhakutir",
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (values: z.infer<typeof createShraddhakutirSchema>) => {
    createMutation.mutate(values);
  };

  const filteredShraddhakutirs = shraddhakutirs?.filter(shraddhakutir =>
    shraddhakutir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shraddhakutir.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shraddhakutir.districtCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <ShraddhakutirsSkeleton />;
  }

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shraddhakutirs Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage spiritual centers and their organizational codes
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-button">
              <Plus className="mr-2 h-4 w-4" />
              Create New Shraddhakutir
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-0">
            <DialogHeader>
              <DialogTitle>Create New Shraddhakutir</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shraddhakutir Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Shraddhakutir name..." className="glass border-0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={createForm.control}
                  name="districtCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District Code</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="glass border-0">
                            <SelectValue placeholder="Select district..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {districts?.map((district) => (
                            <SelectItem key={district} value={district.substring(0, 3).toUpperCase()}>
                              {district} ({district.substring(0, 3).toUpperCase()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="font-medium">Auto-generated code format:</p>
                  <p>SK-{createForm.watch("districtCode") || "XXX"}-001</p>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="gradient-button flex-1"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Shraddhakutir"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="glass"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                onClick={() => setIsCreateDialogOpen(true)}
                className="gradient-button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Shraddhakutir
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
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
    <Card className="glass-card hover-lift group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${getGradientClass(index)} rounded-xl flex items-center justify-center`}>
            <Building className="h-6 w-6 text-white" />
          </div>
          <Badge className="status-badge-active">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </Badge>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
            {shraddhakutir.name}
          </h3>

          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Hash className="mr-2 h-3 w-3" />
              <span className="font-mono font-medium">{shraddhakutir.code}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="mr-2 h-3 w-3" />
              <span>District: {shraddhakutir.districtCode}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="mr-2 h-3 w-3" />
              <span>Created {new Date(shraddhakutir.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mt-4 pt-4 border-t border-white/20 dark:border-slate-700/50">
          <Button variant="secondary" className="flex-1 glass">
            View Details
          </Button>
          <Button variant="outline" size="icon" className="glass">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ShraddhakutirsSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
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
              <Skeleton className="h-20 w-full" />
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
                  <Skeleton className="h-48 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
