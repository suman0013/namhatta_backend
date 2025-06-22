import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, X, Plus, Trash2, Image, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NamhattaUpdateFormProps {
  namhattaId: number;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  programType: string;
  date: string;
  attendance: number;
  hasKirtan: boolean;
  hasPrasadam: boolean;
  hasClass: boolean;
  imageUrls: string[];
  facebookLink: string;
  youtubeLink: string;
  specialAttraction: string;
}

export default function NamhattaUpdateForm({ namhattaId, onClose, onSuccess }: NamhattaUpdateFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      programType: "",
      date: new Date().toISOString().split('T')[0],
      attendance: 0,
      hasKirtan: false,
      hasPrasadam: false,
      hasClass: false,
      imageUrls: [],
      facebookLink: "",
      youtubeLink: "",
      specialAttraction: "",
    }
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createNamhattaUpdate({ ...data, namhattaId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/namhattas/${namhattaId}/updates`] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Update posted successfully",
      });
      onSuccess?.();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post update",
        variant: "destructive",
      });
    },
  });

  const addImageUrl = () => {
    if (imageUrls.length < 10) {
      const newUrls = [...imageUrls, ""];
      setImageUrls(newUrls);
      setValue("imageUrls", newUrls);
    }
  };

  const removeImageUrl = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    setValue("imageUrls", newUrls);
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
    setValue("imageUrls", newUrls);
  };

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      imageUrls: imageUrls.filter(url => url.trim() !== ""),
      attendance: Number(data.attendance),
    };

    createMutation.mutate(submitData);
  };

  const isLoading = createMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Namhatta Update</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Program Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="programType">Program Type *</Label>
                  <Select
                    value={watch("programType")}
                    onValueChange={(value) => setValue("programType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select program type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bhagavad Gita">Bhagavad Gita</SelectItem>
                      <SelectItem value="Srimad Bhagavatam">Srimad Bhagavatam</SelectItem>
                      <SelectItem value="Chaitanya Charitamrita">Chaitanya Charitamrita</SelectItem>
                      <SelectItem value="Nectar of Devotion">Nectar of Devotion</SelectItem>
                      <SelectItem value="Kirtan">Kirtan</SelectItem>
                      <SelectItem value="Festival">Festival</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.programType && (
                    <p className="text-sm text-red-500 mt-1">Program type is required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    type="date"
                    {...register("date", { required: "Date is required" })}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="attendance">Attendance *</Label>
                  <Input
                    type="number"
                    min="0"
                    {...register("attendance", { 
                      required: "Attendance is required",
                      min: { value: 0, message: "Attendance cannot be negative" }
                    })}
                    placeholder="Enter number of attendees"
                  />
                  {errors.attendance && (
                    <p className="text-sm text-red-500 mt-1">{errors.attendance.message}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Program Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Program Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasKirtan"
                    checked={watch("hasKirtan")}
                    onCheckedChange={(checked) => setValue("hasKirtan", checked)}
                  />
                  <Label htmlFor="hasKirtan">Had Kirtan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasPrasadam"
                    checked={watch("hasPrasadam")}
                    onCheckedChange={(checked) => setValue("hasPrasadam", checked)}
                  />
                  <Label htmlFor="hasPrasadam">Had Prasadam</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasClass"
                    checked={watch("hasClass")}
                    onCheckedChange={(checked) => setValue("hasClass", checked)}
                  />
                  <Label htmlFor="hasClass">Had Class</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Media Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebookLink">Facebook Link</Label>
                  <Input
                    {...register("facebookLink")}
                    placeholder="https://facebook.com/..."
                    type="url"
                  />
                </div>
                <div>
                  <Label htmlFor="youtubeLink">YouTube Link</Label>
                  <Input
                    {...register("youtubeLink")}
                    placeholder="https://youtube.com/..."
                    type="url"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Image URLs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Images</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addImageUrl}
                  disabled={imageUrls.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Image URL ({imageUrls.length}/10)
                </Button>
              </div>
              {imageUrls.map((url, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={url}
                    onChange={(e) => updateImageUrl(index, e.target.value)}
                    placeholder="Enter image URL"
                    type="url"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImageUrl(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {imageUrls.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No images added yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Click "Add Image URL" to start</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Special Attraction */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Special Attraction</h3>
              <div>
                <Label htmlFor="specialAttraction">Description</Label>
                <Textarea
                  {...register("specialAttraction")}
                  placeholder="Describe any special attractions or highlights of this program..."
                  rows={4}
                />
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
                {isLoading ? "Posting..." : "Post Update"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}