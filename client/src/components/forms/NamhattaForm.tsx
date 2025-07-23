import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
  malaSenapoti: string;
  mahaChakraSenapoti: string;
  chakraSenapoti: string;
  upaChakraSenapoti: string;
  secretary: string;
}

export default function NamhattaForm({ namhatta, onClose, onSuccess }: NamhattaFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!namhatta;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      code: namhatta?.code || "",
      name: namhatta?.name || "",
      meetingDay: namhatta?.meetingDay || "",
      meetingTime: namhatta?.meetingTime || "",
      address: namhatta?.address || {},
      malaSenapoti: namhatta?.malaSenapoti || "",
      mahaChakraSenapoti: namhatta?.mahaChakraSenapoti || "",
      chakraSenapoti: namhatta?.chakraSenapoti || "",
      upaChakraSenapoti: namhatta?.upaChakraSenapoti || "",
      secretary: namhatta?.secretary || "",
    }
  });

  const [address, setAddress] = useState<Address>(namhatta?.address || {});



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
                  <Input
                    {...register("code", { required: "Code is required" })}
                    placeholder="Enter namhatta code"
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>
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
                <div>
                  <Label htmlFor="secretary">Secretary</Label>
                  <Input
                    {...register("secretary")}
                    placeholder="Enter Secretary name"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <AddressSection
              title="Address"
              address={address}
              onAddressChange={handleAddressChange}
              required={false}
              showValidation={false}
            />

            <Separator />

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : (isEditing ? "Update Namhatta" : "Create Namhatta")}
              </Button>
            </div>
        </form>
        </DialogContent>
      </Dialog>
  );
}