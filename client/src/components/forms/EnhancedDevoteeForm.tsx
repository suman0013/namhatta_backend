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
import { Plus, Trash2, Save, X, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddressSection from "@/components/ui/AddressSection";
import type { Devotee, Address } from "@/lib/types";

// Leadership role hierarchy for automatic setup
const LEADERSHIP_HIERARCHY = {
  MALA_SENAPOTI: { level: 1, reportsTo: null },
  MAHA_CHAKRA_SENAPOTI: { level: 2, reportsTo: 'MALA_SENAPOTI' },
  CHAKRA_SENAPOTI: { level: 3, reportsTo: 'MAHA_CHAKRA_SENAPOTI' },
  UPA_CHAKRA_SENAPOTI: { level: 4, reportsTo: 'CHAKRA_SENAPOTI' },
} as const;

interface EnhancedDevoteeFormProps {
  devotee?: Devotee;
  onClose: () => void;
  onSuccess?: (devotee: Devotee) => void;
  namhattaId?: number;
  // Enhanced props for role assignment
  preAssignedRole?: keyof typeof LEADERSHIP_HIERARCHY | 'SECRETARY' | 'PRESIDENT' | 'ACCOUNTANT';
  reportingToDevoteeId?: number;
  districtInfo?: {
    country?: string;
    state?: string;
    district?: string;
  };
  isModal?: boolean;
  modalTitle?: string;
}

interface FormData {
  legalName: string;
  name: string; // Initiated/spiritual name
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
  harinamInitiationGurudevId: number | undefined;
  pancharatrikInitiationGurudevId: number | undefined;
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
  // Leadership fields
  leadershipRole?: string;
  reportingToDevoteeId?: number;
  hasSystemAccess?: boolean;
}

export default function EnhancedDevoteeForm({ 
  devotee, 
  onClose, 
  onSuccess, 
  namhattaId,
  preAssignedRole,
  reportingToDevoteeId,
  districtInfo,
  isModal = false,
  modalTitle = "Create New Devotee"
}: EnhancedDevoteeFormProps) {
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
      presentAddress: devotee?.presentAddress || districtInfo || {},
      permanentAddress: devotee?.permanentAddress || districtInfo || {},
      devotionalStatusId: devotee?.devotionalStatusId,
      harinamInitiationGurudevId: devotee?.harinamInitiationGurudevId,
      pancharatrikInitiationGurudevId: devotee?.pancharatrikInitiationGurudevId,
      initiatedName: devotee?.initiatedName || "",
      harinamDate: devotee?.harinamDate || "",
      pancharatrikDate: devotee?.pancharatrikDate || "",
      shraddhakutirId: devotee?.shraddhakutirId,
      education: devotee?.education || "",
      occupation: devotee?.occupation || "",
      devotionalCourses: devotee?.devotionalCourses || [],
      additionalComments: devotee?.additionalComments || "",
      // Leadership role pre-assignment
      leadershipRole: preAssignedRole || devotee?.leadershipRole || undefined,
      reportingToDevoteeId: reportingToDevoteeId || devotee?.reportingToDevoteeId || undefined,
      hasSystemAccess: devotee?.hasSystemAccess || false
    }
  });

  const [presentAddress, setPresentAddress] = useState<Address>(devotee?.presentAddress || districtInfo || {});
  const [permanentAddress, setPermanentAddress] = useState<Address>(devotee?.permanentAddress || districtInfo || {});
  const [devotionalCourses, setDevotionalCourses] = useState(devotee?.devotionalCourses || []);
  const [sameAsPresentAddress, setSameAsPresentAddress] = useState(false);
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  // Pre-fill district information for Mala Senapoti
  useEffect(() => {
    if (preAssignedRole === 'MALA_SENAPOTI' && districtInfo) {
      const newPresentAddress = { ...presentAddress, ...districtInfo };
      const newPermanentAddress = { ...permanentAddress, ...districtInfo };
      setPresentAddress(newPresentAddress);
      setPermanentAddress(newPermanentAddress);
      setValue("presentAddress", newPresentAddress);
      setValue("permanentAddress", newPermanentAddress);
    }
  }, [preAssignedRole, districtInfo, setValue, presentAddress, permanentAddress]);

  // Data queries
  const { data: statuses } = useQuery({
    queryKey: ["/api/statuses"],
    queryFn: () => api.getStatuses(),
  });

  const { data: gurudevs } = useQuery({
    queryKey: ["/api/gurudevs"],
    queryFn: () => api.getGurudevs(),
  });

  const { data: shraddhakutirs } = useQuery({
    queryKey: ["/api/shraddhakutirs", permanentAddress.district],
    queryFn: () => api.getShraddhakutirs(permanentAddress.district),
    enabled: !!permanentAddress.district,
  });

  // Enhanced creation mutation with role assignment
  const createMutation = useMutation({
    mutationFn: async (data: Partial<Devotee>) => {
      // Only assign leadership role if it's a valid Senapoti role
      const validLeadershipRoles = ['MALA_SENAPOTI', 'MAHA_CHAKRA_SENAPOTI', 'CHAKRA_SENAPOTI', 'UPA_CHAKRA_SENAPOTI'];
      const isValidLeadershipRole = preAssignedRole && validLeadershipRoles.includes(preAssignedRole);
      
      const devoteeData = {
        ...data,
        leadershipRole: isValidLeadershipRole ? preAssignedRole as any : null,
        reportingToDevoteeId: reportingToDevoteeId,
        hasSystemAccess: data.hasSystemAccess || false,
        appointedDate: new Date().toISOString().split('T')[0],
        // appointedBy will be set by the backend based on the current user
      };

      if (namhattaId) {
        return api.createDevoteeForNamhatta(devoteeData, namhattaId);
      }
      return api.createDevotee(devoteeData);
    },
    onSuccess: (devotee) => {
      queryClient.invalidateQueries({ queryKey: ["/api/devotees"] });
      if (namhattaId) {
        queryClient.invalidateQueries({ queryKey: ["/api/namhattas", namhattaId.toString(), "devotees"] });
      }
      
      toast({
        title: "Success",
        description: `${preAssignedRole ? preAssignedRole.replace(/_/g, ' ') + ' ' : ''}Devotee created successfully`,
        duration: 3000,
      });
      
      onSuccess?.(devotee);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create devotee",
        variant: "destructive",
        duration: 3000,
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
        duration: 3000,
      });
      onSuccess?.(devotee!);
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update devotee",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const validateAddresses = () => {
    const errors: Record<string, string> = {};
    
    if (!presentAddress.country) errors.presentCountry = "Country is required";
    if (!presentAddress.state) errors.presentState = "State is required";
    if (!presentAddress.district) errors.presentDistrict = "District is required";
    
    if (!permanentAddress.country) errors.permanentCountry = "Country is required";
    if (!permanentAddress.state) errors.permanentState = "State is required";
    if (!permanentAddress.district) errors.permanentDistrict = "District is required";

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (data: FormData) => {
    setShowValidation(true);

    if (!validateAddresses()) {
      toast({
        title: "Error",
        description: "Please fill in all required address fields",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    const devoteeData = {
      ...data,
      gender: data.gender as "MALE" | "FEMALE" | "OTHER" | undefined,
      maritalStatus: data.maritalStatus as "MARRIED" | "UNMARRIED" | "WIDOWED" | undefined,
      presentAddress,
      permanentAddress,
      devotionalCourses,
      namhattaId: namhattaId || null
    };

    if (isEditing) {
      updateMutation.mutate(devoteeData);
    } else {
      createMutation.mutate(devoteeData);
    }
  };

  const handleAddressChange = (field: keyof Address, value: string, isPresent: boolean) => {
    if (isPresent) {
      const newAddress = { ...presentAddress, [field]: value };
      setPresentAddress(newAddress);
      setValue("presentAddress", newAddress);
      
      if (sameAsPresentAddress) {
        setPermanentAddress(newAddress);
        setValue("permanentAddress", newAddress);
      }
    } else {
      const newAddress = { ...permanentAddress, [field]: value };
      setPermanentAddress(newAddress);
      setValue("permanentAddress", newAddress);
    }
    
    if (showValidation) {
      validateAddresses();
    }
  };

  const addDevotionalCourse = () => {
    setDevotionalCourses([...devotionalCourses, { name: "", date: "", institute: "" }]);
  };

  const removeDevotionalCourse = (index: number) => {
    setDevotionalCourses(devotionalCourses.filter((_, i) => i !== index));
  };

  const updateDevotionalCourse = (index: number, field: string, value: string) => {
    const updated = [...devotionalCourses];
    updated[index] = { ...updated[index], [field]: value };
    setDevotionalCourses(updated);
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="form-devotee">
      {/* Role Assignment Display */}
      {preAssignedRole && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">
                Creating {preAssignedRole.replace(/_/g, ' ')} for Namhatta
              </span>
            </div>
            {reportingToDevoteeId && (
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
                Will report to the designated superior in the hierarchy
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="legalName">Legal Name *</Label>
              <Input
                id="legalName"
                data-testid="input-legal-name"
                {...register("legalName", { required: "Legal name is required" })}
                className={errors.legalName ? "border-red-500" : ""}
              />
              {errors.legalName && (
                <span className="text-red-500 text-sm">{errors.legalName.message}</span>
              )}
            </div>

            <div>
              <Label htmlFor="name">Spiritual Name</Label>
              <Input
                id="name"
                data-testid="input-spiritual-name"
                {...register("name")}
                placeholder="Initiated or spiritual name"
              />
            </div>

            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                data-testid="input-dob"
                type="date"
                {...register("dob")}
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={watch("gender")} onValueChange={(value) => setValue("gender", value)}>
                <SelectTrigger data-testid="select-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                {...register("email")}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                data-testid="input-phone"
                {...register("phone")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Present Address */}
          <div>
            <h4 className="font-medium mb-4">Present Address</h4>
            <AddressSection
              title="Present Address"
              address={presentAddress}
              onAddressChange={(field, value) => handleAddressChange(field, value, true)}
              showValidation={showValidation}
              disabled={preAssignedRole === 'MALA_SENAPOTI' && !!districtInfo}
            />
          </div>

          <Separator />

          {/* Permanent Address */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Permanent Address</h4>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  data-testid="checkbox-same-address"
                  checked={sameAsPresentAddress}
                  onChange={(e) => {
                    setSameAsPresentAddress(e.target.checked);
                    if (e.target.checked) {
                      setPermanentAddress(presentAddress);
                      setValue("permanentAddress", presentAddress);
                    }
                  }}
                />
                Same as present address
              </label>
            </div>
            <AddressSection
              title="Permanent Address"
              address={permanentAddress}
              onAddressChange={(field, value) => handleAddressChange(field, value, false)}
              showValidation={showValidation}
              disabled={sameAsPresentAddress || (preAssignedRole === 'MALA_SENAPOTI' && !!districtInfo)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Spiritual Information */}
      <Card>
        <CardHeader>
          <CardTitle>Spiritual Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="devotionalStatusId">Devotional Status</Label>
              <Select 
                value={watch("devotionalStatusId")?.toString() || ""} 
                onValueChange={(value) => setValue("devotionalStatusId", value ? parseInt(value) : undefined)}
              >
                <SelectTrigger data-testid="select-devotional-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
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
              <Input
                id="initiatedName"
                data-testid="input-initiated-name"
                {...register("initiatedName")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          data-testid="button-cancel"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createMutation.isPending || updateMutation.isPending}
          data-testid="button-save"
        >
          <Save className="h-4 w-4 mr-2" />
          {createMutation.isPending || updateMutation.isPending ? "Saving..." : isEditing ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            {preAssignedRole && (
              <DialogDescription>
                Creating a new devotee for the {preAssignedRole.replace('_', ' ')} role
              </DialogDescription>
            )}
          </DialogHeader>
          <FormContent />
        </DialogContent>
      </Dialog>
    );
  }

  return <FormContent />;
}