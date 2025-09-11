import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Save, X, AlertCircle, CheckCircle, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AddressSection from "@/components/ui/AddressSection";
import type { Namhatta, Address } from "@/lib/types";

interface NamhattaFormProps {
  namhatta?: Namhatta;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  code: string;
  name: string;
  meetingDay: string;
  meetingTime: string;
  address: Address;
  malaSenapotiId: number | null;
  mahaChakraSenapotiId: number | null;
  chakraSenapotiId: number | null;
  upaChakraSenapotiId: number | null;
  secretaryId: number | null;
  presidentId: number | null;
  accountantId: number | null;
  districtSupervisorId: number;
}

export default function NamhattaForm({ namhatta, onClose, onSuccess }: NamhattaFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!namhatta;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      code: namhatta?.code || "",
      name: namhatta?.name || "",
      meetingDay: namhatta?.meetingDay || "",
      meetingTime: namhatta?.meetingTime || "",
      address: namhatta?.address || {},
      malaSenapotiId: null, // Will be set from namhatta data lookup
      mahaChakraSenapotiId: null, // Will be set from namhatta data lookup
      chakraSenapotiId: null, // Will be set from namhatta data lookup
      upaChakraSenapotiId: null, // Will be set from namhatta data lookup
      secretaryId: null, // Will be set from namhatta data lookup
      presidentId: null, // Will be set from namhatta data lookup
      accountantId: null, // Will be set from namhatta data lookup
      districtSupervisorId: namhatta?.districtSupervisorId || 0,
    }
  });

  const [address, setAddress] = useState<Address>(namhatta?.address || {});
  const [showAddressValidation, setShowAddressValidation] = useState(false);
  const [codeValidation, setCodeValidation] = useState<{
    isChecking: boolean;
    isValid: boolean | null;
    message: string;
  }>({ isChecking: false, isValid: null, message: "" });
  
  const [selectedDistrictSupervisor, setSelectedDistrictSupervisor] = useState<number>(
    namhatta?.districtSupervisorId || 0
  );
  const [addressDefaults, setAddressDefaults] = useState<{
    country?: string;
    state?: string;
    district?: string;
    readonly: string[];
  }>({ readonly: [] });

  const currentCode = watch("code");
  const watchedAddress = watch("address");

  // Fetch address defaults for current user
  const { data: userAddressDefaults } = useQuery({
    queryKey: ["/api/user/address-defaults"],
    queryFn: () => api.getUserAddressDefaults(),
    enabled: !!user && user.role === 'DISTRICT_SUPERVISOR',
  });

  // Fetch district supervisors for selected district
  const { data: districtSupervisors = [], isLoading: supervisorsLoading } = useQuery({
    queryKey: ["/api/district-supervisors", watchedAddress?.district],
    queryFn: () => api.getDistrictSupervisors(watchedAddress?.district || ""),
    enabled: !!watchedAddress?.district && (user?.role === 'ADMIN' || user?.role === 'OFFICE'),
  });

  // Fetch devotees for leadership dropdowns - show all devotees for now
  const { data: devoteesData, isLoading: devoteesLoading } = useQuery({
    queryKey: ["/api/devotees", "leadership"],
    queryFn: () => api.getDevotees(1, 1000), // Get a large number for dropdown
    enabled: true,
  });

  const devotees = devoteesData?.data || [];

  // Initialize leadership dropdowns for editing
  useEffect(() => {
    if (isEditing && namhatta && devotees.length > 0) {
      // Map existing leadership names to devotee IDs
      const findDevoteeByName = (name: string | undefined) => {
        if (!name) return null;
        const devotee = devotees.find(d => 
          (d.name === name) || (d.legalName === name) ||
          (d.name && d.name.toLowerCase() === name.toLowerCase()) ||
          (d.legalName && d.legalName.toLowerCase() === name.toLowerCase())
        );
        return devotee ? devotee.id : null;
      };

      // Set form values from existing namhatta data
      setValue("malaSenapotiId", findDevoteeByName(namhatta.malaSenapoti));
      setValue("mahaChakraSenapotiId", findDevoteeByName(namhatta.mahaChakraSenapoti));  
      setValue("chakraSenapotiId", findDevoteeByName(namhatta.chakraSenapoti));
      setValue("upaChakraSenapotiId", findDevoteeByName(namhatta.upaChakraSenapoti));
      setValue("secretaryId", findDevoteeByName(namhatta.secretary));
      setValue("presidentId", findDevoteeByName(namhatta.president));
      setValue("accountantId", findDevoteeByName(namhatta.accountant));
    }
  }, [isEditing, namhatta, devotees, setValue]);

  // Address pre-filling effect
  useEffect(() => {
    if (userAddressDefaults && user?.role === 'DISTRICT_SUPERVISOR') {
      setAddressDefaults(userAddressDefaults);
      // Pre-fill address fields if they're empty
      setAddress(prev => ({
        ...prev,
        country: prev.country || userAddressDefaults.country,
        state: prev.state || userAddressDefaults.state,
        district: prev.district || userAddressDefaults.district,
      }));
      setValue("address", {
        ...address,
        country: address.country || userAddressDefaults.country,
        state: address.state || userAddressDefaults.state,
        district: address.district || userAddressDefaults.district,
      });
    }
  }, [userAddressDefaults, user?.role, setValue]);

  // Auto-assign district supervisor for DISTRICT_SUPERVISOR users
  useEffect(() => {
    if (user?.role === 'DISTRICT_SUPERVISOR' && user.districts && user.districts.length > 0) {
      // For district supervisors, auto-assign themselves
      setSelectedDistrictSupervisor(user.id);
      setValue("districtSupervisorId", user.id);
    }
  }, [user, setValue]);

  // Debounced code validation
  useEffect(() => {
    if (!currentCode || isEditing) return;

    const timeoutId = setTimeout(async () => {
      if (currentCode.length < 2) {
        setCodeValidation({ isChecking: false, isValid: null, message: "" });
        return;
      }

      setCodeValidation({ isChecking: true, isValid: null, message: "Checking..." });

      try {
        const result = await api.checkNamhattaCodeExists(currentCode);
        if (result.exists) {
          setCodeValidation({ 
            isChecking: false, 
            isValid: false, 
            message: "This code already exists. Please choose a unique code." 
          });
        } else {
          setCodeValidation({ 
            isChecking: false, 
            isValid: true, 
            message: "Code is available!" 
          });
        }
      } catch (error) {
        setCodeValidation({ 
          isChecking: false, 
          isValid: null, 
          message: "Error checking code" 
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [currentCode, isEditing]);



  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Namhatta>) => api.createNamhatta(data),
    onSuccess: () => {
      // Invalidate namhatta queries
      queryClient.invalidateQueries({ queryKey: ["/api/namhattas"] });
      // Invalidate map data queries to refresh geographic counts
      queryClient.invalidateQueries({ queryKey: ["/api/map/countries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/map/states"] });
      queryClient.invalidateQueries({ queryKey: ["/api/map/districts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/map/sub-districts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/map/villages"] });
      // Invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Namhatta created successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || "Failed to create namhatta";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Namhatta>) => api.updateNamhatta(namhatta!.id, data),
    onSuccess: () => {
      // Invalidate namhatta queries
      queryClient.invalidateQueries({ queryKey: ["/api/namhattas"] });
      queryClient.invalidateQueries({ queryKey: [`/api/namhattas/${namhatta!.id}`] });
      // Invalidate map data queries to refresh geographic counts
      queryClient.invalidateQueries({ queryKey: ["/api/map/countries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/map/states"] });
      queryClient.invalidateQueries({ queryKey: ["/api/map/districts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/map/sub-districts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/map/villages"] });
      // Invalidate dashboard data
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Namhatta updated successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update namhatta",
        variant: "destructive",
      });
    },
  });

  // Handle address changes
  const handleAddressChange = (field: keyof Address, value: string) => {
    const newAddress = { ...address, [field]: value };
    
    // Reset dependent fields only for manual changes, not pincode auto-population
    if (field === "country") {
      newAddress.state = "";
      newAddress.district = "";
      newAddress.subDistrict = "";
      newAddress.village = "";
    } else if (field === "state" && address.postalCode === "") {
      // Only reset if no pincode is set (manual state change)
      newAddress.district = "";
      newAddress.subDistrict = "";
      newAddress.village = "";
    } else if (field === "district" && address.postalCode === "") {
      // Only reset if no pincode is set (manual district change)
      newAddress.subDistrict = "";
      newAddress.village = "";
    } else if (field === "subDistrict") {
      newAddress.village = "";
    }
    
    console.log("Namhatta address change:", field, "->", value, "New address:", newAddress);
    setAddress(newAddress);
    setValue("address", newAddress);
    
    // Clear validation errors when user starts fixing them
    if (showAddressValidation && value) {
      setShowAddressValidation(false);
    }
  };

  // Handle batch address changes (for pincode auto-population)
  const handleBatchAddressChange = (newAddressFields: Partial<Address>) => {
    const newAddress = { ...address, ...newAddressFields };
    console.log("Namhatta batch address change:", newAddressFields, "New address:", newAddress);
    setAddress(newAddress);
    setValue("address", newAddress);
    
    // Clear validation errors when batch changes happen (pincode auto-population)
    if (showAddressValidation) {
      setShowAddressValidation(false);
    }
  };

  const onSubmit = (data: FormData) => {
    // Prevent submission if code validation failed (for new namhattas)
    if (!isEditing && codeValidation.isValid === false) {
      toast({
        title: "Validation Error",
        description: "Please choose a unique code before submitting.",
        variant: "destructive",
      });
      return;
    }

    // Validate district supervisor selection is mandatory
    if (!data.districtSupervisorId || data.districtSupervisorId === 0) {
      toast({
        title: "Error",
        description: "District Supervisor selection is mandatory",
        variant: "destructive",
      });
      return;
    }

    // Validate secretary selection is mandatory
    if (!data.secretaryId) {
      toast({
        title: "Error",
        description: "Secretary selection is mandatory",
        variant: "destructive",
      });
      return;
    }

    // Validate required address fields
    const requiredAddressFields = ['country', 'postalCode', 'state', 'district', 'subDistrict', 'village'];
    const missingFields = requiredAddressFields.filter(field => !address[field as keyof Address]);
    
    if (missingFields.length > 0) {
      const fieldNames = missingFields.map(field => {
        switch (field) {
          case 'postalCode': return 'Postal Code';
          case 'subDistrict': return 'Sub-District';
          default: return field.charAt(0).toUpperCase() + field.slice(1);
        }
      });
      
      toast({
        title: "Validation Error",
        description: `Please fill in all required address fields: ${fieldNames.join(', ')}`,
        variant: "destructive",
      });
      setShowAddressValidation(true);
      return;
    }

    const submitData = {
      ...data,
      address,
    };

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Namhatta" : "Add New Namhatta"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update Namhatta information" : "Create a new Namhatta center with address and leadership details"}
          </DialogDescription>
        </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Namhatta Name *</Label>
                  <Input
                    {...register("name", { required: "Name is required" })}
                    placeholder="Enter namhatta name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="code">Namhatta Code *</Label>
                  <div className="relative">
                    <Input
                      {...register("code", { 
                        required: "Code is required",
                        setValueAs: (value) => value?.toUpperCase()?.trim() || ""
                      })}
                      placeholder="Enter namhatta code"
                      style={{ textTransform: 'uppercase' }}
                      className={`${
                        !isEditing && codeValidation.isValid === false 
                          ? "border-red-500 focus:border-red-500" 
                          : !isEditing && codeValidation.isValid === true 
                          ? "border-green-500 focus:border-green-500" 
                          : ""
                      }`}
                    />
                    {!isEditing && currentCode && currentCode.length >= 2 && (
                      <div className="absolute right-3 top-3">
                        {codeValidation.isChecking ? (
                          <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full"></div>
                        ) : codeValidation.isValid === false ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : codeValidation.isValid === true ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {errors.code && (
                    <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
                  )}
                  {!isEditing && codeValidation.message && (
                    <p className={`text-sm mt-1 ${
                      codeValidation.isValid === false 
                        ? "text-red-500" 
                        : codeValidation.isValid === true 
                        ? "text-green-500" 
                        : "text-gray-500"
                    }`}>
                      {codeValidation.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="meetingDay">Meeting Day</Label>
                  <Select
                    value={watch("meetingDay")}
                    onValueChange={(value) => setValue("meetingDay", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select meeting day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="meetingTime">Meeting Time</Label>
                  <Input
                    {...register("meetingTime")}
                    type="time"
                    placeholder="Select meeting time"
                  />
                </div>
              </div>
              
              {/* Leadership Roles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="malaSenapotiId">Mala Senapoti</Label>
                  <Select
                    value={watch("malaSenapotiId")?.toString() || ""}
                    onValueChange={(value) => setValue("malaSenapotiId", value ? parseInt(value) : null)}
                    disabled={devoteesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={devoteesLoading ? "Loading devotees..." : "Select Mala Senapoti"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {devotees.map(devotee => (
                        <SelectItem key={devotee.id} value={devotee.id.toString()}>
                          {devotee.name || devotee.legalName} ({devotee.legalName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mahaChakraSenapotiId">Maha Chakra Senapoti</Label>
                  <Select
                    value={watch("mahaChakraSenapotiId")?.toString() || ""}
                    onValueChange={(value) => setValue("mahaChakraSenapotiId", value ? parseInt(value) : null)}
                    disabled={devoteesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={devoteesLoading ? "Loading devotees..." : "Select Maha Chakra Senapoti"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {devotees.map(devotee => (
                        <SelectItem key={devotee.id} value={devotee.id.toString()}>
                          {devotee.name || devotee.legalName} ({devotee.legalName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="chakraSenapotiId">Chakra Senapoti</Label>
                  <Select
                    value={watch("chakraSenapotiId")?.toString() || ""}
                    onValueChange={(value) => setValue("chakraSenapotiId", value ? parseInt(value) : null)}
                    disabled={devoteesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={devoteesLoading ? "Loading devotees..." : "Select Chakra Senapoti"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {devotees.map(devotee => (
                        <SelectItem key={devotee.id} value={devotee.id.toString()}>
                          {devotee.name || devotee.legalName} ({devotee.legalName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="upaChakraSenapotiId">Upa Chakra Senapoti</Label>
                  <Select
                    value={watch("upaChakraSenapotiId")?.toString() || ""}
                    onValueChange={(value) => setValue("upaChakraSenapotiId", value ? parseInt(value) : null)}
                    disabled={devoteesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={devoteesLoading ? "Loading devotees..." : "Select Upa Chakra Senapoti"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {devotees.map(devotee => (
                        <SelectItem key={devotee.id} value={devotee.id.toString()}>
                          {devotee.name || devotee.legalName} ({devotee.legalName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="secretaryId">Secretary *</Label>
                  <Select
                    value={watch("secretaryId")?.toString() || ""}
                    onValueChange={(value) => setValue("secretaryId", value ? parseInt(value) : null, { shouldValidate: true })}
                    disabled={devoteesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={devoteesLoading ? "Loading devotees..." : "Select Secretary"} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Remove "None" option for required field */}
                      {devotees.map(devotee => (
                        <SelectItem key={devotee.id} value={devotee.id.toString()}>
                          {devotee.name || devotee.legalName} ({devotee.legalName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.secretaryId && (
                    <p className="text-sm text-red-500 mt-1">{errors.secretaryId.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="presidentId">President</Label>
                  <Select
                    value={watch("presidentId")?.toString() || ""}
                    onValueChange={(value) => setValue("presidentId", value ? parseInt(value) : null)}
                    disabled={devoteesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={devoteesLoading ? "Loading devotees..." : "Select President"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {devotees.map(devotee => (
                        <SelectItem key={devotee.id} value={devotee.id.toString()}>
                          {devotee.name || devotee.legalName} ({devotee.legalName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountantId">Accountant</Label>
                  <Select
                    value={watch("accountantId")?.toString() || ""}
                    onValueChange={(value) => setValue("accountantId", value ? parseInt(value) : null)}
                    disabled={devoteesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={devoteesLoading ? "Loading devotees..." : "Select Accountant"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {devotees.map(devotee => (
                        <SelectItem key={devotee.id} value={devotee.id.toString()}>
                          {devotee.name || devotee.legalName} ({devotee.legalName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* District Supervisor Assignment - Mandatory */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold flex items-center">
                  District Supervisor Assignment *
                  {addressDefaults.readonly.includes('district') && (
                    <Lock className="h-4 w-4 ml-2 text-gray-500" />
                  )}
                </h4>
                
                {user?.role === 'DISTRICT_SUPERVISOR' ? (
                  // Auto-assigned for District Supervisors
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Auto-assigned:</strong> You are automatically assigned as the District Supervisor for this Namhatta 
                      since it's in your district ({address.district || 'your assigned district'}).
                    </p>
                    <input type="hidden" {...register("districtSupervisorId")} />
                  </div>
                ) : (
                  // Manual selection for Admin/Office users
                  <div>
                    <Label htmlFor="districtSupervisorId">District Supervisor *</Label>
                    {watchedAddress?.district ? (
                      <div>
                        <Select
                          value={selectedDistrictSupervisor?.toString() || ""}
                          onValueChange={(value) => {
                            const supervisorId = parseInt(value);
                            setSelectedDistrictSupervisor(supervisorId);
                            setValue("districtSupervisorId", supervisorId);
                          }}
                          disabled={supervisorsLoading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={
                              supervisorsLoading 
                                ? "Loading supervisors..." 
                                : districtSupervisors.length === 0 
                                ? "No supervisors available for this district"
                                : "Select District Supervisor"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {districtSupervisors.map((supervisor) => (
                              <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                                {supervisor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {districtSupervisors.length === 0 && !supervisorsLoading && (
                          <p className="text-sm text-amber-600 mt-1">
                            No District Supervisors found for {watchedAddress.district}. 
                            Please contact admin to assign a supervisor to this district.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          Please fill in the address district first to load available District Supervisors.
                        </p>
                      </div>
                    )}
                    {errors.districtSupervisorId && (
                      <p className="text-sm text-red-500 mt-1">{errors.districtSupervisorId.message}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Address */}
            <AddressSection
              title="Address"
              address={address}
              onAddressChange={handleAddressChange}
              onBatchAddressChange={handleBatchAddressChange}
              required={true}
              showValidation={showAddressValidation}
            />

            <Separator />

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || (!isEditing && codeValidation.isValid === false)}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : (isEditing ? "Update Namhatta" : "Create Namhatta")}
              </Button>
            </div>
        </form>
        </DialogContent>
      </Dialog>
  );
}