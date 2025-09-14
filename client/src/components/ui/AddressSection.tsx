import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { SearchablePincodeSelect } from "@/components/ui/searchable-pincode-select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Search, RotateCcw } from "lucide-react";
import type { Address } from "@/lib/types";

interface AddressSectionProps {
  title: string;
  address: Address;
  onAddressChange: (field: keyof Address, value: string) => void;
  onBatchAddressChange?: (newAddress: Partial<Address>) => void;
  required?: boolean;
  showValidation?: boolean;
  disabled?: boolean;
}

export default function AddressSection({
  title,
  address = {},
  onAddressChange,
  onBatchAddressChange,
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

  // Set India as default country when countries are loaded and no country is set
  useEffect(() => {
    if (countries && countries.includes("India") && !address.country) {
      onAddressChange("country", "India");
    }
  }, [countries, address.country, onAddressChange]);

  // Remove the old pincodes query since we'll use the new searchable component

  const { data: subDistricts } = useQuery({
    queryKey: ["/api/sub-districts", address.district, address.postalCode],
    queryFn: () => api.getSubDistricts(address.district, address.postalCode),
    enabled: !!address.postalCode, // Enable when pincode is available
  });

  const { data: villages } = useQuery({
    queryKey: ["/api/villages", address.subDistrict, address.postalCode],
    queryFn: () => api.getVillages(address.subDistrict, address.postalCode),
    enabled: !!address.subDistrict && !!address.postalCode, // Enable when both subDistrict and pincode are available
  });

  const handlePincodeChange = async (pincode: string) => {
    if (!pincode.trim()) {
      // Clear auto-populated fields when pincode is removed
      onAddressChange("postalCode", "");
      onAddressChange("state", "");
      onAddressChange("district", "");
      onAddressChange("subDistrict", "");
      onAddressChange("village", "");
      return;
    }
    
    setIsLoadingPincode(true);
    try {
      const addressInfo = await api.getAddressByPincode(pincode.trim());
      console.log("Pincode lookup result:", addressInfo);
      if (addressInfo) {
        // Call a special batch update function that doesn't trigger cascading resets
        if (onBatchAddressChange) {
          onBatchAddressChange({
            postalCode: pincode,
            state: addressInfo.state,
            district: addressInfo.district,
            subDistrict: "",
            village: ""
          });
        } else {
          // Fallback: update fields individually but with a flag to prevent resets
          onAddressChange("postalCode", pincode);
          onAddressChange("state", addressInfo.state);
          onAddressChange("district", addressInfo.district);
          onAddressChange("subDistrict", "");
          onAddressChange("village", "");
        }
      } else {
        onAddressChange("postalCode", pincode);
      }
    } catch (error) {
      console.error("Error fetching address by pincode:", error);
      onAddressChange("postalCode", pincode);
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
      <CardContent className="space-y-6">
        {/* Address fields in the specified order */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium">
              Country {required && <span className="text-red-500">*</span>}
            </Label>
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
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-sm font-medium">
              Postal Code {required && <span className="text-red-500">*</span>}
            </Label>
            <SearchablePincodeSelect
              value={address.postalCode || ""}
              onValueChange={handlePincodeChange}
              country={address.country || ""}
              placeholder="Search postal code"
              disabled={disabled || isLoadingPincode}
            />
            {isLoadingPincode && (
              <p className="text-sm text-gray-500 mt-1">Loading address...</p>
            )}
            {hasRequiredError("postalCode") && (
              <p className="text-sm text-red-500 mt-1">Postal Code is required</p>
            )}
          </div>

          {/* State - auto-populated (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="state" className="text-sm font-medium">
              State {required && <span className="text-red-500">*</span>}
            </Label>
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
          <div className="space-y-2">
            <Label htmlFor="district" className="text-sm font-medium">
              District {required && <span className="text-red-500">*</span>}
            </Label>
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
          <div className="space-y-2">
            <Label htmlFor="subDistrict" className="text-sm font-medium">
              Sub-District {required && <span className="text-red-500">*</span>}
            </Label>
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
          <div className="space-y-2">
            <Label htmlFor="village" className="text-sm font-medium">
              Village {required && <span className="text-red-500">*</span>}
            </Label>
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

      </CardContent>
    </Card>
  );
}