import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Devotee, Address } from "@/lib/types";

interface DevoteeFormProps {
  devotee?: Devotee;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  presentAddress: Address;
  permanentAddress: Address;
  gurudev: string;
  maritalStatus: string;
  statusId: number | undefined;
  shraddhakutirId: number | undefined;
  education: string;
  occupation: string;
  devotionalCourses: Array<{
    name: string;
    date: string;
    institute: string;
  }>;
}

export default function DevoteeForm({ devotee, onClose, onSuccess }: DevoteeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!devotee;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: devotee?.name || "",
      presentAddress: devotee?.presentAddress || {},
      permanentAddress: devotee?.permanentAddress || {},
      gurudev: devotee?.gurudev || "",
      maritalStatus: devotee?.maritalStatus || "",
      statusId: devotee?.statusId,
      shraddhakutirId: devotee?.shraddhakutirId,
      education: devotee?.education || "",
      occupation: devotee?.occupation || "",
      devotionalCourses: devotee?.devotionalCourses || []
    }
  });

  const [presentAddress, setPresentAddress] = useState<Address>(devotee?.presentAddress || {});
  const [permanentAddress, setPermanentAddress] = useState<Address>(devotee?.permanentAddress || {});
  const [devotionalCourses, setDevotionalCourses] = useState(devotee?.devotionalCourses || []);
  const [sameAsPresentAddress, setSameAsPresentAddress] = useState(false);

  // Geography queries for present address
  const { data: countries } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: () => api.getCountries(),
  });

  const { data: presentStates } = useQuery({
    queryKey: ["/api/states", presentAddress.country],
    queryFn: () => api.getStates(presentAddress.country!),
    enabled: !!presentAddress.country,
  });

  const { data: presentDistricts } = useQuery({
    queryKey: ["/api/districts", presentAddress.state],
    queryFn: () => api.getDistricts(presentAddress.state!),
    enabled: !!presentAddress.state,
  });

  const { data: presentSubDistricts } = useQuery({
    queryKey: ["/api/sub-districts", presentAddress.district],
    queryFn: () => api.getSubDistricts(presentAddress.district!),
    enabled: !!presentAddress.district,
  });

  const { data: presentVillages } = useQuery({
    queryKey: ["/api/villages", presentAddress.district],
    queryFn: () => api.getVillages(presentAddress.district!),
    enabled: !!presentAddress.district,
  });

  // Geography queries for permanent address
  const { data: permanentStates } = useQuery({
    queryKey: ["/api/states", permanentAddress.country],
    queryFn: () => api.getStates(permanentAddress.country!),
    enabled: !!permanentAddress.country && !sameAsPresentAddress,
  });

  const { data: permanentDistricts } = useQuery({
    queryKey: ["/api/districts", permanentAddress.state],
    queryFn: () => api.getDistricts(permanentAddress.state!),
    enabled: !!permanentAddress.state && !sameAsPresentAddress,
  });

  const { data: permanentSubDistricts } = useQuery({
    queryKey: ["/api/sub-districts", permanentAddress.district],
    queryFn: () => api.getSubDistricts(permanentAddress.district!),
    enabled: !!permanentAddress.district && !sameAsPresentAddress,
  });

  const { data: permanentVillages } = useQuery({
    queryKey: ["/api/villages", permanentAddress.district],
    queryFn: () => api.getVillages(permanentAddress.district!),
    enabled: !!permanentAddress.district && !sameAsPresentAddress,
  });

  // Other data queries
  const { data: statuses } = useQuery({
    queryKey: ["/api/statuses"],
    queryFn: () => api.getStatuses(),
  });

  const { data: shraddhakutirs } = useQuery({
    queryKey: ["/api/shraddhakutirs"],
    queryFn: () => api.getShraddhakutirs(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Devotee>) => api.createDevotee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      toast({
        title: "Success",
        description: "Devotee created successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create devotee",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Devotee>) => api.updateDevotee(devotee!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      queryClient.invalidateQueries({ queryKey: [`/api/devotees/${devotee!.id}`] });
      toast({
        title: "Success",
        description: "Devotee updated successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update devotee",
        variant: "destructive",
      });
    },
  });

  // Handle address changes
  const handlePresentAddressChange = (field: keyof Address, value: string) => {
    const newAddress = { ...presentAddress, [field]: value };
    
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
    
    setPresentAddress(newAddress);
    setValue("presentAddress", newAddress);
    
    if (sameAsPresentAddress) {
      setPermanentAddress(newAddress);
      setValue("permanentAddress", newAddress);
    }
  };

  const handlePermanentAddressChange = (field: keyof Address, value: string) => {
    const newAddress = { ...permanentAddress, [field]: value };
    
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
    
    setPermanentAddress(newAddress);
    setValue("permanentAddress", newAddress);
  };

  // Handle same as present address toggle
  useEffect(() => {
    if (sameAsPresentAddress) {
      setPermanentAddress(presentAddress);
      setValue("permanentAddress", presentAddress);
    }
  }, [sameAsPresentAddress, presentAddress, setValue]);

  // Handle devotional courses
  const addDevotionalCourse = () => {
    const newCourses = [...devotionalCourses, { name: "", date: "", institute: "" }];
    setDevotionalCourses(newCourses);
    setValue("devotionalCourses", newCourses);
  };

  const removeDevotionalCourse = (index: number) => {
    const newCourses = devotionalCourses.filter((_, i) => i !== index);
    setDevotionalCourses(newCourses);
    setValue("devotionalCourses", newCourses);
  };

  const updateDevotionalCourse = (index: number, field: string, value: string) => {
    const newCourses = [...devotionalCourses];
    newCourses[index] = { ...newCourses[index], [field]: value };
    setDevotionalCourses(newCourses);
    setValue("devotionalCourses", newCourses);
  };

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      presentAddress,
      permanentAddress,
      devotionalCourses,
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
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? "Edit Devotee" : "Add New Devotee"}</CardTitle>
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
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    {...register("name", { required: "Name is required" })}
                    placeholder="Enter devotee name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="gurudev">Gurudev</Label>
                  <Input {...register("gurudev")} placeholder="Enter Gurudev name" />
                </div>
                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select
                    value={watch("maritalStatus")}
                    onValueChange={(value) => setValue("maritalStatus", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single</SelectItem>
                      <SelectItem value="married">Married</SelectItem>
                      <SelectItem value="divorced">Divorced</SelectItem>
                      <SelectItem value="widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="statusId">Devotional Status</Label>
                  <Select
                    value={watch("statusId")?.toString() || ""}
                    onValueChange={(value) => setValue("statusId", value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select devotional status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses?.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="shraddhakutirId">Shraddhakutir</Label>
                  <Select
                    value={watch("shraddhakutirId")?.toString() || ""}
                    onValueChange={(value) => setValue("shraddhakutirId", value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Shraddhakutir" />
                    </SelectTrigger>
                    <SelectContent>
                      {shraddhakutirs?.map((sk) => (
                        <SelectItem key={sk.id} value={sk.id.toString()}>
                          {sk.name} ({sk.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="education">Education</Label>
                  <Input {...register("education")} placeholder="Enter education details" />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input {...register("occupation")} placeholder="Enter occupation" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Present Address */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Present Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="presentCountry">Country</Label>
                  <Select
                    value={presentAddress.country || ""}
                    onValueChange={(value) => handlePresentAddressChange("country", value)}
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
                  <Label htmlFor="presentState">State</Label>
                  <Select
                    value={presentAddress.state || ""}
                    onValueChange={(value) => handlePresentAddressChange("state", value)}
                    disabled={!presentAddress.country}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {presentStates?.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="presentDistrict">District</Label>
                  <Select
                    value={presentAddress.district || ""}
                    onValueChange={(value) => handlePresentAddressChange("district", value)}
                    disabled={!presentAddress.state}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {presentDistricts?.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="presentSubDistrict">Sub-District</Label>
                  <Select
                    value={presentAddress.subDistrict || ""}
                    onValueChange={(value) => handlePresentAddressChange("subDistrict", value)}
                    disabled={!presentAddress.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sub-district" />
                    </SelectTrigger>
                    <SelectContent>
                      {presentSubDistricts?.map((subDistrict) => (
                        <SelectItem key={subDistrict} value={subDistrict}>
                          {subDistrict}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="presentVillage">Village</Label>
                  <Select
                    value={presentAddress.village || ""}
                    onValueChange={(value) => handlePresentAddressChange("village", value)}
                    disabled={!presentAddress.district}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select village" />
                    </SelectTrigger>
                    <SelectContent>
                      {presentVillages?.map((village) => (
                        <SelectItem key={village} value={village}>
                          {village}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <Label htmlFor="presentDetails">Additional Details</Label>
                  <Textarea
                    value={presentAddress.details || ""}
                    onChange={(e) => handlePresentAddressChange("details", e.target.value)}
                    placeholder="Enter additional address details"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Permanent Address */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Permanent Address</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="sameAsPresent"
                    checked={sameAsPresentAddress}
                    onChange={(e) => setSameAsPresentAddress(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="sameAsPresent" className="text-sm">
                    Same as present address
                  </Label>
                </div>
              </div>
              {!sameAsPresentAddress && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="permanentCountry">Country</Label>
                    <Select
                      value={permanentAddress.country || ""}
                      onValueChange={(value) => handlePermanentAddressChange("country", value)}
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
                    <Label htmlFor="permanentState">State</Label>
                    <Select
                      value={permanentAddress.state || ""}
                      onValueChange={(value) => handlePermanentAddressChange("state", value)}
                      disabled={!permanentAddress.country}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {permanentStates?.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="permanentDistrict">District</Label>
                    <Select
                      value={permanentAddress.district || ""}
                      onValueChange={(value) => handlePermanentAddressChange("district", value)}
                      disabled={!permanentAddress.state}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {permanentDistricts?.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="permanentSubDistrict">Sub-District</Label>
                    <Select
                      value={permanentAddress.subDistrict || ""}
                      onValueChange={(value) => handlePermanentAddressChange("subDistrict", value)}
                      disabled={!permanentAddress.district}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-district" />
                      </SelectTrigger>
                      <SelectContent>
                        {permanentSubDistricts?.map((subDistrict) => (
                          <SelectItem key={subDistrict} value={subDistrict}>
                            {subDistrict}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="permanentVillage">Village</Label>
                    <Select
                      value={permanentAddress.village || ""}
                      onValueChange={(value) => handlePermanentAddressChange("village", value)}
                      disabled={!permanentAddress.district}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select village" />
                      </SelectTrigger>
                      <SelectContent>
                        {permanentVillages?.map((village) => (
                          <SelectItem key={village} value={village}>
                            {village}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label htmlFor="permanentDetails">Additional Details</Label>
                    <Textarea
                      value={permanentAddress.details || ""}
                      onChange={(e) => handlePermanentAddressChange("details", e.target.value)}
                      placeholder="Enter additional address details"
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Devotional Courses */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Devotional Courses</h3>
                <Button type="button" variant="outline" size="sm" onClick={addDevotionalCourse}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </div>
              {devotionalCourses.map((course, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`course-name-${index}`}>Course Name</Label>
                    <Input
                      value={course.name}
                      onChange={(e) => updateDevotionalCourse(index, "name", e.target.value)}
                      placeholder="Enter course name"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`course-date-${index}`}>Date</Label>
                    <Input
                      type="date"
                      value={course.date}
                      onChange={(e) => updateDevotionalCourse(index, "date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`course-institute-${index}`}>Institute</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={course.institute}
                        onChange={(e) => updateDevotionalCourse(index, "institute", e.target.value)}
                        placeholder="Enter institute name"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDevotionalCourse(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : (isEditing ? "Update Devotee" : "Create Devotee")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}