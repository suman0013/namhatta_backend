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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  gender: string;
  bloodGroup: string;
  maritalStatus: string;
  presentAddress: Address;
  permanentAddress: Address;
  devotionalStatusId: number | undefined;
  gurudevHarinam: number | undefined;
  gurudevPancharatrik: number | undefined;
  harinamInitiationGurudev: string;
  pancharatrikInitiationGurudev: string;
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
  additionalComments: string;
  shraddhakutirId: number | undefined;
}

export default function DevoteeForm({ devotee, onClose, onSuccess }: DevoteeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!devotee;

  const { register, handleSubmit, watch, setValue, formState: { errors }, setError, clearErrors } = useForm<FormData>({
    defaultValues: {
      legalName: devotee?.legalName || "",
      name: devotee?.name || "",
      dob: devotee?.dob || "",
      email: devotee?.email || "",
      phone: devotee?.phone || "",
      fatherName: devotee?.fatherName || "",
      motherName: devotee?.motherName || "",
      husbandName: devotee?.husbandName || "",
      gender: devotee?.gender || "",
      bloodGroup: devotee?.bloodGroup || "",
      maritalStatus: devotee?.maritalStatus || "",
      presentAddress: devotee?.presentAddress || {},
      permanentAddress: devotee?.permanentAddress || {},
      devotionalStatusId: devotee?.devotionalStatusId,
      gurudevHarinam: devotee?.gurudevHarinam,
      gurudevPancharatrik: devotee?.gurudevPancharatrik,
      harinamInitiationGurudev: devotee?.harinamInitiationGurudev || "",
      pancharatrikInitiationGurudev: devotee?.pancharatrikInitiationGurudev || "",
      initiatedName: devotee?.initiatedName || "",
      harinamDate: devotee?.harinamDate || "",
      pancharatrikDate: devotee?.pancharatrikDate || "",
      shraddhakutirId: devotee?.shraddhakutirId,
      education: devotee?.education || "",
      occupation: devotee?.occupation || "",
      devotionalCourses: devotee?.devotionalCourses || [],
      additionalComments: devotee?.additionalComments || ""
    }
  });

  const [presentAddress, setPresentAddress] = useState<Address>(devotee?.presentAddress || {});
  const [permanentAddress, setPermanentAddress] = useState<Address>(devotee?.permanentAddress || {});
  const [devotionalCourses, setDevotionalCourses] = useState(devotee?.devotionalCourses || []);
  const [sameAsPresentAddress, setSameAsPresentAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);


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
    queryKey: ["/api/villages", presentAddress.subDistrict],
    queryFn: () => api.getVillages(presentAddress.subDistrict!),
    enabled: !!presentAddress.subDistrict,
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
    queryKey: ["/api/villages", permanentAddress.subDistrict],
    queryFn: () => api.getVillages(permanentAddress.subDistrict!),
    enabled: !!permanentAddress.subDistrict && !sameAsPresentAddress,
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
    // Clear previous errors
    clearErrors();
    setAddressErrors({});
    
    // Simple validation - check required fields
    const errors: string[] = [];
    const newAddressErrors: Record<string, string> = {};
    
    // Check basic required fields
    if (!data.legalName?.trim()) {
      setError("legalName", { type: "required", message: "Legal Name is required" });
      errors.push("Legal Name");
    }
    
    if (!data.dob) {
      setError("dob", { type: "required", message: "Date of Birth is required" });
      errors.push("Date of Birth");
    }
    
    if (!data.gender) {
      setError("gender", { type: "required", message: "Gender is required" });
      errors.push("Gender");
    }
    
    if (!data.devotionalStatusId) {
      setError("devotionalStatusId", { type: "required", message: "Devotional Status is required" });
      errors.push("Devotional Status");
    }
    
    // Check present address
    if (!presentAddress.country) {
      newAddressErrors["presentAddress.country"] = "Country is required";
      errors.push("Present Address Country");
    }
    if (!presentAddress.state) {
      newAddressErrors["presentAddress.state"] = "State is required";
      errors.push("Present Address State");
    }
    if (!presentAddress.district) {
      newAddressErrors["presentAddress.district"] = "District is required";
      errors.push("Present Address District");
    }
    if (!presentAddress.subDistrict) {
      newAddressErrors["presentAddress.subDistrict"] = "Sub-District is required";
      errors.push("Present Address Sub-District");
    }
    if (!presentAddress.village) {
      newAddressErrors["presentAddress.village"] = "Village is required";
      errors.push("Present Address Village");
    }
    if (!presentAddress.postalCode) {
      newAddressErrors["presentAddress.postalCode"] = "Postal Code is required";
      errors.push("Present Address Postal Code");
    }
    
    // Check permanent address (if not same as present)
    if (!sameAsPresentAddress) {
      if (!permanentAddress.country) {
        newAddressErrors["permanentAddress.country"] = "Country is required";
        errors.push("Permanent Address Country");
      }
      if (!permanentAddress.state) {
        newAddressErrors["permanentAddress.state"] = "State is required";
        errors.push("Permanent Address State");
      }
      if (!permanentAddress.district) {
        newAddressErrors["permanentAddress.district"] = "District is required";
        errors.push("Permanent Address District");
      }
      if (!permanentAddress.subDistrict) {
        newAddressErrors["permanentAddress.subDistrict"] = "Sub-District is required";
        errors.push("Permanent Address Sub-District");
      }
      if (!permanentAddress.village) {
        newAddressErrors["permanentAddress.village"] = "Village is required";
        errors.push("Permanent Address Village");
      }
      if (!permanentAddress.postalCode) {
        newAddressErrors["permanentAddress.postalCode"] = "Postal Code is required";
        errors.push("Permanent Address Postal Code");
      }
    }
    
    // If there are errors, show them and stop
    if (errors.length > 0) {
      setShowValidation(true);
      setAddressErrors(newAddressErrors);
      toast({
        title: `Please fill in ${errors.length} required fields`,
        description: `Missing: ${errors.join(", ")}`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const submitData: Partial<Devotee> = {
      ...data,
      presentAddress,
      permanentAddress: sameAsPresentAddress ? presentAddress : permanentAddress,
      devotionalCourses,
      gender: data.gender as "MALE" | "FEMALE" | "OTHER" | undefined,
      maritalStatus: data.maritalStatus as "MARRIED" | "UNMARRIED" | "WIDOWED" | undefined,
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
      <DialogContent className="w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Devotee" : "Add New Devotee"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update devotee information" : "Fill in the details to register a new devotee"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="legalName">Legal Name *</Label>
                  <Input
                    {...register("legalName")}
                    placeholder="Enter legal name"
                  />
                  {errors.legalName && (
                    <p className="text-sm text-red-500 mt-1">{errors.legalName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input 
                    type="date" 
                    {...register("dob")} 
                  />
                  {errors.dob && (
                    <p className="text-sm text-red-500 mt-1">{errors.dob.message}</p>
                  )}
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
                  <Label htmlFor="gender">Gender *</Label>
                  <Select 
                    value={watch("gender")} 
                    onValueChange={(value) => {
                      setValue("gender", value);
                      clearErrors("gender");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>
                  )}
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
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Family Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Personal Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="education">Education</Label>
                  <Input {...register("education")} placeholder="Enter education details" />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input {...register("occupation")} placeholder="Enter occupation" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="additionalComments">Additional Comments</Label>
                  <textarea
                    {...register("additionalComments")}
                    placeholder="Enter any additional comments or notes"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Present Address */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Present Address *</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <div>
                  <Label htmlFor="presentCountry">Country *</Label>
                  <Select
                    value={presentAddress.country || ""}
                    onValueChange={(value) => {
                      handlePresentAddressChange("country", value);
                      clearErrors("presentAddress.country");
                    }}
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
                  {showValidation && !presentAddress.country && (
                    <p className="text-sm text-red-500 mt-1">Country is required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="presentState">State *</Label>
                  <Select
                    value={presentAddress.state || ""}
                    onValueChange={(value) => {
                      handlePresentAddressChange("state", value);
                      clearErrors("presentAddress.state");
                    }}
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
                  {showValidation && !presentAddress.state && (
                    <p className="text-sm text-red-500 mt-1">State is required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="presentDistrict">District *</Label>
                  <Select
                    value={presentAddress.district || ""}
                    onValueChange={(value) => {
                      handlePresentAddressChange("district", value);
                      clearErrors("presentAddress.district");
                    }}
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
                  {showValidation && !presentAddress.district && (
                    <p className="text-sm text-red-500 mt-1">District is required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="presentSubDistrict">Sub-District *</Label>
                  <Select
                    value={presentAddress.subDistrict || ""}
                    onValueChange={(value) => {
                      handlePresentAddressChange("subDistrict", value);
                      clearErrors("presentAddress.subDistrict");
                    }}
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
                  {showValidation && !presentAddress.subDistrict && (
                    <p className="text-sm text-red-500 mt-1">Sub-District is required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="presentVillage">Village *</Label>
                  <Select
                    value={presentAddress.village || ""}
                    onValueChange={(value) => {
                      handlePresentAddressChange("village", value);
                      clearErrors("presentAddress.village");
                    }}
                    disabled={!presentAddress.subDistrict}
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
                  {showValidation && !presentAddress.village && (
                    <p className="text-sm text-red-500 mt-1">Village is required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="presentPostalCode">Postal Code *</Label>
                  <Input
                    value={presentAddress.postalCode || ""}
                    onChange={(e) => {
                      handlePresentAddressChange("postalCode", e.target.value);
                      clearErrors("presentAddress.postalCode");
                    }}
                    placeholder="Enter postal code"
                  />
                  {showValidation && !presentAddress.postalCode && (
                    <p className="text-sm text-red-500 mt-1">Postal Code is required</p>
                  )}
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <Label htmlFor="presentLandmark">Landmark</Label>
                  <Textarea
                    value={presentAddress.landmark || ""}
                    onChange={(e) => handlePresentAddressChange("landmark", e.target.value)}
                    placeholder="Enter landmark or additional details"
                  />
                </div>
              </div>
              {errors.presentAddress && (
                <p className="text-sm text-red-500 mt-2">{errors.presentAddress.message}</p>
              )}
            </div>

            <Separator />

            {/* Permanent Address */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Permanent Address *</h3>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  <div>
                    <Label htmlFor="permanentCountry">Country *</Label>
                    <Select
                      value={permanentAddress.country || ""}
                      onValueChange={(value) => {
                        handlePermanentAddressChange("country", value);
                        clearErrors("permanentAddress.country");
                      }}
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
                    {showValidation && !sameAsPresentAddress && !permanentAddress.country && (
                      <p className="text-sm text-red-500 mt-1">Country is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="permanentState">State *</Label>
                    <Select
                      value={permanentAddress.state || ""}
                      onValueChange={(value) => {
                        handlePermanentAddressChange("state", value);
                        clearErrors("permanentAddress.state");
                      }}
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
                    {showValidation && !sameAsPresentAddress && !permanentAddress.state && (
                      <p className="text-sm text-red-500 mt-1">State is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="permanentDistrict">District *</Label>
                    <Select
                      value={permanentAddress.district || ""}
                      onValueChange={(value) => {
                        handlePermanentAddressChange("district", value);
                        clearErrors("permanentAddress.district");
                      }}
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
                    {showValidation && !sameAsPresentAddress && !permanentAddress.district && (
                      <p className="text-sm text-red-500 mt-1">District is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="permanentSubDistrict">Sub-District *</Label>
                    <Select
                      value={permanentAddress.subDistrict || ""}
                      onValueChange={(value) => {
                        handlePermanentAddressChange("subDistrict", value);
                        clearErrors("permanentAddress.subDistrict");
                      }}
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
                    {showValidation && !sameAsPresentAddress && !permanentAddress.subDistrict && (
                      <p className="text-sm text-red-500 mt-1">Sub-District is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="permanentVillage">Village *</Label>
                    <Select
                      value={permanentAddress.village || ""}
                      onValueChange={(value) => {
                        handlePermanentAddressChange("village", value);
                        clearErrors("permanentAddress.village");
                      }}
                      disabled={!permanentAddress.subDistrict}
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
                    {showValidation && !sameAsPresentAddress && !permanentAddress.village && (
                      <p className="text-sm text-red-500 mt-1">Village is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="permanentPostalCode">Postal Code *</Label>
                    <Input
                      value={permanentAddress.postalCode || ""}
                      onChange={(e) => {
                        handlePermanentAddressChange("postalCode", e.target.value);
                        clearErrors("permanentAddress.postalCode");
                      }}
                      placeholder="Enter postal code"
                    />
                    {showValidation && !sameAsPresentAddress && !permanentAddress.postalCode && (
                      <p className="text-sm text-red-500 mt-1">Postal Code is required</p>
                    )}
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <Label htmlFor="permanentLandmark">Landmark</Label>
                    <Textarea
                      value={permanentAddress.landmark || ""}
                      onChange={(e) => handlePermanentAddressChange("landmark", e.target.value)}
                      placeholder="Enter landmark or additional details"
                    />
                  </div>
                </div>
              )}
              {errors.permanentAddress && (
                <p className="text-sm text-red-500 mt-2">{errors.permanentAddress.message}</p>
              )}
            </div>

            <Separator />

            {/* Spiritual Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Spiritual Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Spiritual Name</Label>
                  <Input {...register("name")} placeholder="Enter spiritual name" />
                </div>
                <div>
                  <Label htmlFor="devotionalStatusId">Devotional Status *</Label>
                  <Select
                    value={watch("devotionalStatusId")?.toString() || ""}
                    onValueChange={(value) => {
                      setValue("devotionalStatusId", value ? parseInt(value) : undefined);
                      clearErrors("devotionalStatusId");
                    }}
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
                  {errors.devotionalStatusId && (
                    <p className="text-sm text-red-500 mt-1">{errors.devotionalStatusId.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="initiatedName">Initiated Name</Label>
                  <Input {...register("initiatedName")} placeholder="Enter initiated name" />
                </div>
                <div>
                  <Label htmlFor="harinamInitiationGurudev">Harinam Initiation Gurudev</Label>
                  <Input {...register("harinamInitiationGurudev")} placeholder="Enter harinam initiation gurudev name" />
                </div>
                <div>
                  <Label htmlFor="harinamDate">Harinama Initiation Date</Label>
                  <Input type="date" {...register("harinamDate")} />
                </div>
                <div>
                  <Label htmlFor="pancharatrikInitiationGurudev">Pancharatrik Initiation Gurudev</Label>
                  <Input {...register("pancharatrikInitiationGurudev")} placeholder="Enter pancharatrik initiation gurudev name" />
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

            {/* Devotional Courses */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Devotional Courses</h3>
                <Button type="button" variant="outline" size="sm" onClick={addDevotionalCourse}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              </div>
              {devotionalCourses.map((course, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg">
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
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : (isEditing ? "Update Devotee" : "Create Devotee")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
  );
}