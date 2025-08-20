import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, UserPlus, Users, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Registration form schema
const registrationSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  districts: z.array(z.string()).min(1, "At least one district must be selected")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type RegistrationForm = z.infer<typeof registrationSchema>;

interface District {
  code: string;
  name: string;
}

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  districts: string[];
}

export default function AdminSupervisorRegistration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      districts: []
    }
  });

  // Fetch available districts
  const { data: districts = [], isLoading: loadingDistricts } = useQuery({
    queryKey: ["/api/admin/available-districts"]
  });

  // Fetch all users
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["/api/admin/users"]
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      const res = await apiRequest("POST", "/api/admin/register-supervisor", data);
      return res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success!",
        description: `District supervisor ${data.supervisor.fullName} has been created successfully.`
      });
      form.reset();
      setShowRegistrationForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create district supervisor",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: RegistrationForm) => {
    registerMutation.mutate(data);
  };

  const districtSupervisors = Array.isArray(users) ? users.filter((user: User) => user.role === 'DISTRICT_SUPERVISOR') : [];
  const westBengalSupervisors = districtSupervisors.filter((user: User) => 
    user.districts?.some(district => 
      Array.isArray(districts) && districts.find((d: District) => d.code === district)?.name?.includes('West Bengal') ||
      ['NADIA', 'KOLKATA', 'HOWRAH', 'HOOGHLY', 'PURBA_BARDHAMAN', 'PASCHIM_MEDINIPUR', 'BANKURA', 'MURSHIDABAD', 'MALDA'].includes(district)
    )
  );

  if (loadingDistricts || loadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">District Supervisor Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage district supervisor registrations and assignments
          </p>
        </div>
        <Button
          onClick={() => setShowRegistrationForm(!showRegistrationForm)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          {showRegistrationForm ? "Cancel" : "Register New Supervisor"}
        </Button>
      </div>

      {/* Registration Form */}
      {showRegistrationForm && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Register District Supervisor
            </CardTitle>
            <CardDescription>
              Create a new district supervisor account with assigned districts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="supervisor_username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="supervisor@namhatta.org" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="districts"
                  render={() => (
                    <FormItem>
                      <FormLabel>Assigned Districts</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-4 border rounded-md">
                        {Array.isArray(districts) && districts.map((district: District) => (
                          <FormField
                            key={district.code}
                            control={form.control}
                            name="districts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(district.code)}
                                    onCheckedChange={(checked) => {
                                      const updatedValue = checked
                                        ? [...(field.value || []), district.code]
                                        : (field.value || []).filter(value => value !== district.code);
                                      field.onChange(updatedValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">
                                  {district.name}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRegistrationForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    {registerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Register Supervisor
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Current District Supervisors */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current District Supervisors ({districtSupervisors.length})
          </CardTitle>
          <CardDescription>
            Manage existing district supervisor accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {districtSupervisors.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No district supervisors registered yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {districtSupervisors.map((user: User) => (
                <div
                  key={user.id}
                  className="p-3 border rounded hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate flex-1">{user.fullName}</h3>
                      {!user.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      @{user.username} • {user.email}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {user.districts?.slice(0, 2).map((districtCode: string) => {
                        const district = Array.isArray(districts) ? districts.find((d: District) => d.code === districtCode) : null;
                        return (
                          <Badge key={districtCode} variant="outline" className="text-xs px-1 py-0">
                            {district?.name || districtCode}
                          </Badge>
                        );
                      })}
                      {user.districts && user.districts.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">+{user.districts.length - 2}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* West Bengal Summary */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-primary">West Bengal Summary</CardTitle>
          <CardDescription>
            District supervisors specifically for West Bengal districts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">West Bengal Supervisors ({westBengalSupervisors.length})</h4>
              {westBengalSupervisors.length === 0 ? (
                <p className="text-muted-foreground text-sm">No West Bengal supervisors registered yet.</p>
              ) : (
                <div className="space-y-2">
                  {westBengalSupervisors.map((user: User) => (
                    <div key={user.id} className="text-sm">
                      <span className="font-medium">{user.fullName}</span>
                      <span className="text-muted-foreground ml-2">
                        ({user.districts?.map(code => Array.isArray(districts) ? districts.find((d: District) => d.code === code)?.name || code : code).join(', ')})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-2">Nadia District Coverage</h4>
              <p className="text-sm text-muted-foreground">
                Supervisors assigned: {westBengalSupervisors.filter(user => 
                  user.districts.includes('NADIA')
                ).length}
              </p>
              {westBengalSupervisors.filter(user => user.districts.includes('NADIA')).map((user: User) => (
                <div key={user.id} className="text-sm mt-1">
                  <span className="font-medium">{user.fullName}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}