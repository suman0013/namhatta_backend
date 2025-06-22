import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
  legalName: string;
  name: string;
  dob: string;
  email: string;
  phone: string;
  fatherName: string;
  motherName: string;
  husbandName: string;
  bloodGroup: string;
  maritalStatus: string;
  presentAddress: Address;
  permanentAddress: Address;
  devotionalStatusId: number | undefined;
  gurudevHarinam: number | undefined;
  gurudevPancharatrik: number | undefined;
  initiatedName: string;
  harinamDate: string;
  pancharatrikDate: string;
  education: string;
  occupation: string;
  devotionalCourses: Array<{
    name: string;
    date: string;
    institute: string;
  }>;
  shraddhakutirId: number | undefined;
}

export default function DevoteeForm({ devotee, onClose, onSuccess }: DevoteeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!devotee;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      legalName: devotee?.legalName || "",
      name: devotee?.name || "",
      dob: devotee?.dob || "",
      email: devotee?.email || "",
      phone: devotee?.phone || "",
      fatherName: devotee?.fatherName || "",
      motherName: devotee?.motherName || "",
      husbandName: devotee?.husbandName || "",
      bloodGroup: devotee?.bloodGroup || "",
      maritalStatus: devotee?.maritalStatus || "",
      presentAddress: devotee?.presentAddress || {},
      permanentAddress: devotee?.permanentAddress || {},
      devotionalStatusId: devotee?.devotionalStatusId,
      gurudevHarinam: devotee?.gurudevHarinam,
      gurudevPancharatrik: devotee?.gurudevPancharatrik,
      initiatedName: devotee?.initiatedName || "",
      harinamDate: devotee?.harinamDate || "",
      pancharatrikDate: devotee?.pancharatrikDate || "",
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
                  <Label htmlFor="legalName">Legal Name *</Label>
                  <Input
                    {...register("legalName", { required: "Legal name is required" })}
                    placeholder="Enter legal name"
                  />
                  {errors.legalName && (
                    <p className="text-sm text-red-500 mt-1">{errors.legalName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="name">Initiated Name</Label>
                  <Input {...register("name")} placeholder="Enter initiated/spiritual name" />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input type="date" {...register("dob")} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" {...register("email")} placeholder="Enter email address" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input {...register("phone")} placeholder="Enter phone number" />
                </div>
                <div>
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Select value={watch("bloodGroup")} onValueChange={(value) => setValue("bloodGroup", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Family Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Family Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input {...register("fatherName")} placeholder="Enter father's name" />
                </div>
                <div>
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input {...register("motherName")} placeholder="Enter mother's name" />
                </div>
                <div>
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Select value={watch("maritalStatus")} onValueChange={(value) => setValue("maritalStatus", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UNMARRIED">Unmarried</SelectItem>
                      <SelectItem value="MARRIED">Married</SelectItem>
                      <SelectItem value="WIDOWED">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="husbandName">Husband's Name</Label>
                  <Input {...register("husbandName")} placeholder="Enter husband's name (if applicable)" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Spiritual Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Spiritual Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="devotionalStatusId">Devotional Status</Label>
                  <Select
                    value={watch("devotionalStatusId")?.toString() || ""}
                    onValueChange={(value) => setValue("devotionalStatusId", value ? parseInt(value) : undefined)}
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
                  <Label htmlFor="initiatedName">Initiated Name</Label>
                  <Input {...register("initiatedName")} placeholder="Enter initiated name" />
                </div>
                <div>
                  <Label htmlFor="harinamDate">Harinama Initiation Date</Label>
                  <Input type="date" {...register("harinamDate")} />
                </div>
                <div>
                  <Label htmlFor="pancharatrikDate">Pancharatrik Initiation Date</Label>
                  <Input type="date" {...register("pancharatrikDate")} />
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
              </div>
            </div>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SearchableSelect
                    value={presentAddress.country || ""}
                    onValueChange={(value) => handlePresentAddressChange("country", value)}
                    options={countries || []}
                    placeholder="Select or type country"
                  />
                </div>
                <div>
                  <Label htmlFor="presentState">State</Label>
                  <SearchableSelect
                    value={presentAddress.state || ""}
                    onValueChange={(value) => handlePresentAddressChange("state", value)}
                    options={presentStates || []}
                    placeholder="Select or type state"
                    disabled={!presentAddress.country}
                  />
                </div>
                <div>
                  <Label htmlFor="presentDistrict">District</Label>
                  <SearchableSelect
                    value={presentAddress.district || ""}
                    onValueChange={(value) => handlePresentAddressChange("district", value)}
                    options={presentDistricts || []}
                    placeholder="Select or type district"
                    disabled={!presentAddress.state}
                  />
                </div>
                <div>
                  <Label htmlFor="presentSubDistrict">Sub-District</Label>
                  <SearchableSelect
                    value={presentAddress.subDistrict || ""}
                    onValueChange={(value) => handlePresentAddressChange("subDistrict", value)}
                    options={presentSubDistricts || []}
                    placeholder="Select or type sub-district"
                    disabled={!presentAddress.district}
                  />
                </div>
                <div>
                  <Label htmlFor="presentVillage">Village</Label>
                  <SearchableSelect
                    value={presentAddress.village || ""}
                    onValueChange={(value) => handlePresentAddressChange("village", value)}
                    options={presentVillages || []}
                    placeholder="Select or type village"
                    disabled={!presentAddress.district}
                  />
                </div>
                <div>
                  <Label htmlFor="presentPostalCode">Postal Code</Label>
                  <Input
                    value={presentAddress.postalCode || ""}
                    onChange={(e) => handlePresentAddressChange("postalCode", e.target.value)}
                    placeholder="Enter postal code"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <Label htmlFor="presentLandmark">Landmark</Label>
                  <Textarea
                    value={presentAddress.landmark || ""}
                    onChange={(e) => handlePresentAddressChange("landmark", e.target.value)}
                    placeholder="Enter landmark or additional details"
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
                    <SearchableSelect
                      value={permanentAddress.country || ""}
                      onValueChange={(value) => handlePermanentAddressChange("country", value)}
                      options={countries || []}
                      placeholder="Select or type country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="permanentState">State</Label>
                    <SearchableSelect
                      value={permanentAddress.state || ""}
                      onValueChange={(value) => handlePermanentAddressChange("state", value)}
                      options={permanentStates || []}
                      placeholder="Select or type state"
                      disabled={!permanentAddress.country}
                    />
                  </div>
                  <div>
                    <Label htmlFor="permanentDistrict">District</Label>
                    <SearchableSelect
                      value={permanentAddress.district || ""}
                      onValueChange={(value) => handlePermanentAddressChange("district", value)}
                      options={permanentDistricts || []}
                      placeholder="Select or type district"
                      disabled={!permanentAddress.state}
                    />
                  </div>
                  <div>
                    <Label htmlFor="permanentSubDistrict">Sub-District</Label>
                    <SearchableSelect
                      value={permanentAddress.subDistrict || ""}
                      onValueChange={(value) => handlePermanentAddressChange("subDistrict", value)}
                      options={permanentSubDistricts || []}
                      placeholder="Select or type sub-district"
                      disabled={!permanentAddress.district}
                    />
                  </div>
                  <div>
                    <Label htmlFor="permanentVillage">Village</Label>
                    <SearchableSelect
                      value={permanentAddress.village || ""}
                      onValueChange={(value) => handlePermanentAddressChange("village", value)}
                      options={permanentVillages || []}
                      placeholder="Select or type village"
                      disabled={!permanentAddress.district}
                    />
                  </div>
                  <div>
                    <Label htmlFor="permanentPostalCode">Postal Code</Label>
                    <Input
                      value={permanentAddress.postalCode || ""}
                      onChange={(e) => handlePermanentAddressChange("postalCode", e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <Label htmlFor="permanentLandmark">Landmark</Label>
                    <Textarea
                      value={permanentAddress.landmark || ""}
                      onChange={(e) => handlePermanentAddressChange("landmark", e.target.value)}
                      placeholder="Enter landmark or additional details"
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