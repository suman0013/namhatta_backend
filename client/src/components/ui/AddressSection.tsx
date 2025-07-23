import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, RotateCcw } from "lucide-react";
import type { Address } from "@/lib/types";

interface AddressSectionProps {
  title: string;
  address: Address;
  onAddressChange: (field: keyof Address, value: string) => void;
  required?: boolean;
  showValidation?: boolean;
  disabled?: boolean;
}

export default function AddressSection({
  title,
  address = {},
  onAddressChange,
  required = false,
  showValidation = false,
  disabled = false
}: AddressSectionProps) {
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  // Geography queries
  const { data: countries } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: () => api.getCountries(),
  });

  const { data: pincodes } = useQuery({
    queryKey: ["/api/pincodes"],
    queryFn: () => api.getPincodes(),
  });

  const { data: subDistricts } = useQuery({
    queryKey: ["/api/sub-districts", address.district],
    queryFn: () => api.getSubDistricts(address.district!),
    enabled: !!address.district,
  });

  const { data: villages } = useQuery({
    queryKey: ["/api/villages", address.subDistrict],
    queryFn: () => api.getVillages(address.subDistrict!),
    enabled: !!address.subDistrict,
  });

  const handlePincodeChange = async (pincode: string) => {
    onAddressChange("postalCode", pincode);
    
    if (!pincode.trim()) {
      // Clear auto-populated fields when pincode is removed
      onAddressChange("state", "");
      onAddressChange("district", "");
      onAddressChange("subDistrict", "");
      onAddressChange("village", "");
      return;
    }
    
    setIsLoadingPincode(true);
    try {
      const addressInfo = await api.getAddressByPincode(pincode.trim());
      if (addressInfo) {
        // Auto-populate state and district
        onAddressChange("state", addressInfo.state);
        onAddressChange("district", addressInfo.district);
        
        // Clear sub-district and village so user must select them
        onAddressChange("subDistrict", "");
        onAddressChange("village", "");
      }
    } catch (error) {
      console.error("Error fetching address by pincode:", error);
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const hasRequiredError = (field: string) => {
    return required && showValidation && !address[field as keyof Address];
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {title}
          {required && <Badge variant="destructive" className="text-xs">Required</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address fields in the specified order */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Country */}
          <div>
            <Label htmlFor="country">Country {required && "*"}</Label>
            <SearchableSelect
              value={address.country || ""}
              onValueChange={(value) => onAddressChange("country", value)}
              options={countries || []}
              placeholder="Select country"
              disabled={disabled}
            />
            {hasRequiredError("country") && (
              <p className="text-sm text-red-500 mt-1">Country is required</p>
            )}
          </div>

          {/* Pincode - searchable */}
          <div>
            <Label htmlFor="postalCode">Postal Code {required && "*"}</Label>
            <SearchableSelect
              value={address.postalCode || ""}
              onValueChange={handlePincodeChange}
              options={pincodes || []}
              placeholder="Select or type postal code"
              disabled={!address.country || disabled}
            />
            {hasRequiredError("postalCode") && (
              <p className="text-sm text-red-500 mt-1">Postal Code is required</p>
            )}
          </div>

          {/* State - auto-populated (read-only) */}
          <div>
            <Label htmlFor="state">State {required && "*"}</Label>
            <Input
              value={address.state || ""}
              placeholder={isLoadingPincode ? "Loading..." : "Auto-populated from postal code"}
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
            {hasRequiredError("state") && (
              <p className="text-sm text-red-500 mt-1">State is required</p>
            )}
          </div>

          {/* District - auto-populated (read-only) */}
          <div>
            <Label htmlFor="district">District {required && "*"}</Label>
            <Input
              value={address.district || ""}
              placeholder={isLoadingPincode ? "Loading..." : "Auto-populated from postal code"}
              disabled
              className="bg-gray-50 dark:bg-gray-800"
            />
            {hasRequiredError("district") && (
              <p className="text-sm text-red-500 mt-1">District is required</p>
            )}
          </div>

          {/* Sub-District - user selectable */}
          <div>
            <Label htmlFor="subDistrict">Sub-District {required && "*"}</Label>
            <SearchableSelect
              value={address.subDistrict || ""}
              onValueChange={(value) => onAddressChange("subDistrict", value)}
              options={subDistricts || []}
              placeholder="Select sub-district"
              disabled={!address.district || disabled}
            />
            {hasRequiredError("subDistrict") && (
              <p className="text-sm text-red-500 mt-1">Sub-District is required</p>
            )}
          </div>

          {/* Village - user selectable */}
          <div>
            <Label htmlFor="village">Village {required && "*"}</Label>
            <SearchableSelect
              value={address.village || ""}
              onValueChange={(value) => onAddressChange("village", value)}
              options={villages || []}
              placeholder="Select village"
              disabled={!address.subDistrict || disabled}
            />
            {hasRequiredError("village") && (
              <p className="text-sm text-red-500 mt-1">Village is required</p>
            )}
          </div>
        </div>

        {/* Landmark field */}
        <div>
          <Label htmlFor="landmark">Landmark</Label>
          <Textarea
            value={address.landmark || ""}
            onChange={(e) => onAddressChange("landmark", e.target.value)}
            placeholder="Enter landmark or additional details"
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}