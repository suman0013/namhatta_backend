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
  const [usePincodeEntry, setUsePincodeEntry] = useState(false);
  const [pincodeInput, setPincodeInput] = useState("");
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);

  // Geography queries for manual entry
  const { data: countries } = useQuery({
    queryKey: ["/api/countries"],
    queryFn: () => api.getCountries(),
    enabled: !usePincodeEntry
  });

  const { data: states } = useQuery({
    queryKey: ["/api/states", address.country],
    queryFn: () => api.getStates(address.country!),
    enabled: !!address.country && !usePincodeEntry,
  });

  const { data: districts } = useQuery({
    queryKey: ["/api/districts", address.state],
    queryFn: () => api.getDistricts(address.state!),
    enabled: !!address.state && !usePincodeEntry,
  });

  const { data: subDistricts } = useQuery({
    queryKey: ["/api/sub-districts", address.district],
    queryFn: () => api.getSubDistricts(address.district!),
    enabled: !!address.district && !usePincodeEntry,
  });

  const { data: villages } = useQuery({
    queryKey: ["/api/villages", address.subDistrict],
    queryFn: () => api.getVillages(address.subDistrict!),
    enabled: !!address.subDistrict && !usePincodeEntry,
  });

  const { data: pincodes } = useQuery({
    queryKey: ["/api/pincodes", address.village, address.district, address.subDistrict],
    queryFn: () => api.getPincodes(address.village, address.district, address.subDistrict),
    enabled: !!address.subDistrict && !usePincodeEntry,
  });

  const handlePincodeSearch = async () => {
    if (!pincodeInput.trim()) return;
    
    setIsLoadingPincode(true);
    try {
      const addressInfo = await api.getAddressByPincode(pincodeInput.trim());
      if (addressInfo) {
        // Auto-fill the form with pincode data
        onAddressChange("country", addressInfo.country);
        onAddressChange("state", addressInfo.state);
        onAddressChange("district", addressInfo.district);
        onAddressChange("postalCode", pincodeInput.trim());
        
        // Clear sub-district and village since user needs to select from available options
        onAddressChange("subDistrict", "");
        onAddressChange("village", "");
      }
    } catch (error) {
      console.error("Error fetching address by pincode:", error);
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const resetForm = () => {
    onAddressChange("country", "");
    onAddressChange("state", "");
    onAddressChange("district", "");
    onAddressChange("subDistrict", "");
    onAddressChange("village", "");
    onAddressChange("postalCode", "");
    onAddressChange("landmark", "");
    setPincodeInput("");
  };

  // Available options based on pincode lookup results
  const { data: pincodeSubDistricts } = useQuery({
    queryKey: ["/api/sub-districts", address.district],
    queryFn: () => api.getSubDistricts(address.district!),
    enabled: usePincodeEntry && !!address.district,
  });

  const { data: pincodeVillages } = useQuery({
    queryKey: ["/api/villages", address.subDistrict],
    queryFn: () => api.getVillages(address.subDistrict!),
    enabled: usePincodeEntry && !!address.subDistrict,
  });

  const requiredFields = ["country", "state", "district", "subDistrict", "village", "postalCode"];
  const hasRequiredError = (field: string) => {
    return required && showValidation && !address[field as keyof Address];
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {title}
            {required && <Badge variant="destructive" className="text-xs">Required</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={usePincodeEntry ? "default" : "outline"}
              size="sm"
              onClick={() => setUsePincodeEntry(!usePincodeEntry)}
              disabled={disabled}
            >
              {usePincodeEntry ? "Manual Entry" : "Pincode Entry"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetForm}
              disabled={disabled}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {usePincodeEntry ? (
          <>
            {/* Pincode Entry Mode */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="pincodeInput">Enter Pincode</Label>
                  <Input
                    id="pincodeInput"
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    disabled={disabled}
                  />
                </div>
                <div className="pt-6">
                  <Button
                    type="button"
                    onClick={handlePincodeSearch}
                    disabled={!pincodeInput.trim() || isLoadingPincode || disabled}
                    size="sm"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isLoadingPincode ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {/* Auto-filled fields (read-only) */}
              {address.country && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Country</Label>
                    <Input value={address.country} disabled className="bg-gray-50 dark:bg-gray-800" />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input value={address.state || ""} disabled className="bg-gray-50 dark:bg-gray-800" />
                  </div>
                  <div>
                    <Label>District</Label>
                    <Input value={address.district || ""} disabled className="bg-gray-50 dark:bg-gray-800" />
                  </div>
                </div>
              )}

              {/* User selectable fields */}
              {address.district && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subDistrict">Sub-District {required && "*"}</Label>
                    <SearchableSelect
                      value={address.subDistrict || ""}
                      onValueChange={(value) => onAddressChange("subDistrict", value)}
                      options={pincodeSubDistricts || []}
                      placeholder="Select sub-district"
                      disabled={disabled}
                    />
                    {hasRequiredError("subDistrict") && (
                      <p className="text-sm text-red-500 mt-1">Sub-District is required</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="village">Village {required && "*"}</Label>
                    <SearchableSelect
                      value={address.village || ""}
                      onValueChange={(value) => onAddressChange("village", value)}
                      options={pincodeVillages || []}
                      placeholder="Select village"
                      disabled={!address.subDistrict || disabled}
                    />
                    {hasRequiredError("village") && (
                      <p className="text-sm text-red-500 mt-1">Village is required</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Manual Entry Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="country">Country {required && "*"}</Label>
                <SearchableSelect
                  value={address.country || ""}
                  onValueChange={(value) => onAddressChange("country", value)}
                  options={countries || []}
                  placeholder="Select or type country"
                  disabled={disabled}
                />
                {hasRequiredError("country") && (
                  <p className="text-sm text-red-500 mt-1">Country is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State {required && "*"}</Label>
                <SearchableSelect
                  value={address.state || ""}
                  onValueChange={(value) => onAddressChange("state", value)}
                  options={states || []}
                  placeholder="Select or type state"
                  disabled={!address.country || disabled}
                />
                {hasRequiredError("state") && (
                  <p className="text-sm text-red-500 mt-1">State is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="district">District {required && "*"}</Label>
                <SearchableSelect
                  value={address.district || ""}
                  onValueChange={(value) => onAddressChange("district", value)}
                  options={districts || []}
                  placeholder="Select or type district"
                  disabled={!address.state || disabled}
                />
                {hasRequiredError("district") && (
                  <p className="text-sm text-red-500 mt-1">District is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="subDistrict">Sub-District {required && "*"}</Label>
                <SearchableSelect
                  value={address.subDistrict || ""}
                  onValueChange={(value) => onAddressChange("subDistrict", value)}
                  options={subDistricts || []}
                  placeholder="Select or type sub-district"
                  disabled={!address.district || disabled}
                />
                {hasRequiredError("subDistrict") && (
                  <p className="text-sm text-red-500 mt-1">Sub-District is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="village">Village {required && "*"}</Label>
                <SearchableSelect
                  value={address.village || ""}
                  onValueChange={(value) => onAddressChange("village", value)}
                  options={villages || []}
                  placeholder="Select or type village"
                  disabled={!address.subDistrict || disabled}
                />
                {hasRequiredError("village") && (
                  <p className="text-sm text-red-500 mt-1">Village is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="postalCode">Postal Code {required && "*"}</Label>
                <SearchableSelect
                  value={address.postalCode || ""}
                  onValueChange={(value) => onAddressChange("postalCode", value)}
                  options={pincodes || []}
                  placeholder="Select or type postal code"
                  disabled={!address.subDistrict || disabled}
                />
                {hasRequiredError("postalCode") && (
                  <p className="text-sm text-red-500 mt-1">Postal Code is required</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Landmark field (always visible) */}
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