import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Namhatta, Address } from "@/lib/types";

interface NamhattaFormProps {
  namhatta?: Namhatta;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  code: string;
  address: Address;
  weeklyMeetingDay: string;
  weeklyMeetingTime: string;
  malaSenapoti: string;
  mahaChakraSenapoti: string;
  chakraSenapoti: string;
  upaChakraSenapoti: string;
}

export default function NamhattaForm({ namhatta, onClose, onSuccess }: NamhattaFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!namhatta;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: namhatta?.name || "",
      code: "",
      address: namhatta?.address || {},
      weeklyMeetingDay: "",
      weeklyMeetingTime: "",
      malaSenapoti: namhatta?.malaSenapoti || "",
      mahaChakraSenapoti: namhatta?.mahaChakraSenapoti || "",
      chakraSenapoti: namhatta?.chakraSenapoti || "",
      upaChakraSenapoti: namhatta?.upaChakraSenapoti || "",
    }
  });

  const [address, setAddress] = useState<Address>(namhatta?.address || {});

  // Geography queries
  const { data: countries } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: () => api.getCountries(),
  });

  const { data: states } = useQuery({
    queryKey: ["/api/states", address.country],
    queryFn: () => api.getStates(address.country!),
    enabled: !!address.country,
  });

  const { data: districts } = useQuery({
    queryKey: ["/api/districts", address.state],
    queryFn: () => api.getDistricts(address.state!),
    enabled: !!address.state,
  });

  const { data: subDistricts } = useQuery({
    queryKey: ["/api/sub-districts", address.district],
    queryFn: () => api.getSubDistricts(address.district!),
    enabled: !!address.district,
  });

  const { data: villages } = useQuery({
    queryKey: ["/api/villages", address.district],
    queryFn: () => api.getVillages(address.district!),
    enabled: !!address.district,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Namhatta>) => api.createNamhatta(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/namhattas"] });
      toast({
        title: "Success",
        description: "Namhatta created successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create namhatta",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Namhatta>) => api.updateNamhatta(namhatta!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/namhattas"] });
      queryClient.invalidateQueries({ queryKey: [`/api/namhattas/${namhatta!.id}`] });
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
    
    // Reset dependent fields
    if (field === "country") {
      newAddress.state = "";
      newAddress.district = "";
      newAddress.subDistrict = "";
      newAddress.village = "";
    } else if (field === "state") {
      newAddress.district = "";
      newAddress.subDistrict = "";
      newAddress.village = "";
    } else if (field === "district") {
      newAddress.subDistrict = "";
      newAddress.village = "";
    } else if (field === "subDistrict") {
      newAddress.village = "";
    }
    
    setAddress(newAddress);
    setValue("address", newAddress);
  };

  const onSubmit = (data: FormData) => {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? "Edit Namhatta" : "Add New Namhatta"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Input
                    {...register("code", { required: "Code is required" })}
                    placeholder="Enter namhatta code"
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="weeklyMeetingDay">Weekly Meeting Day</Label>
                  <Select
                    value={watch("weeklyMeetingDay")}
                    onValueChange={(value) => setValue("weeklyMeetingDay", value)}
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
                  <Label htmlFor="weeklyMeetingTime">Weekly Meeting Time</Label>
                  <Input
                    {...register("weeklyMeetingTime")}
                    type="time"
                    placeholder="Select meeting time"
                  />
                </div>
              </div>
              
              {/* Leadership Roles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="malaSenapoti">Mala Senapoti</Label>
                  <Input
                    {...register("malaSenapoti")}
                    placeholder="Enter Mala Senapoti name"
                  />
                </div>
                <div>
                  <Label htmlFor="mahaChakraSenapoti">Maha Chakra Senapoti</Label>
                  <Input
                    {...register("mahaChakraSenapoti")}
                    placeholder="Enter Maha Chakra Senapoti name"
                  />
                </div>
                <div>
                  <Label htmlFor="chakraSenapoti">Chakra Senapoti</Label>
                  <Input
                    {...register("chakraSenapoti")}
                    placeholder="Enter Chakra Senapoti name"
                  />
                </div>
                <div>
                  <Label htmlFor="upaChakraSenapoti">Upa Chakra Senapoti</Label>
                  <Input
                    {...register("upaChakraSenapoti")}
                    placeholder="Enter Upa Chakra Senapoti name"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={address.country || ""}
                    onValueChange={(value) => handleAddressChange("country", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries?.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Select
                    value={address.state || ""}
                    onValueChange={(value) => handleAddressChange("state", value)}
                    disabled={!address.country}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states?.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="district">District</Label>
                  <Select
                    value={address.district || ""}
                    onValueChange={(value) => handleAddressChange("district", value)}
                    disabled={!address.state}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts?.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subDistrict">Sub-District</Label>
                  <Select
                    value={address.subDistrict || ""}
                    onValueChange={(value) => handleAddressChange("subDistrict", value)}
                    disabled={!address.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-district" />
                    </SelectTrigger>
                    <SelectContent>
                      {subDistricts?.map((subDistrict) => (
                        <SelectItem key={subDistrict} value={subDistrict}>
                          {subDistrict}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="village">Village</Label>
                  <Select
                    value={address.village || ""}
                    onValueChange={(value) => handleAddressChange("village", value)}
                    disabled={!address.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select village" />
                    </SelectTrigger>
                    <SelectContent>
                      {villages?.map((village) => (
                        <SelectItem key={village} value={village}>
                          {village}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <Label htmlFor="details">Additional Details</Label>
                  <Textarea
                    value={address.details || ""}
                    onChange={(e) => handleAddressChange("details", e.target.value)}
                    placeholder="Enter additional address details"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : (isEditing ? "Update Namhatta" : "Create Namhatta")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}