import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { api } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Users, Image, Link, Music, Utensils, BookOpen, Sparkles } from "lucide-react";

interface NamhattaUpdateFormProps {
  namhattaId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface UpdateFormData {
  programType: string;
  date: string;
  attendance: number;
  prasadDistribution?: number;
  nagarKirtan: boolean;
  bookDistribution: boolean;
  chanting: boolean;
  arati: boolean;
  bhagwatPath: boolean;
  specialAttraction?: string;
  facebookLink?: string;
  youtubeLink?: string;
  imageUrls?: string[];
}

const programTypes = [
  "Weekly Satsang Program",
  "Bhagavad Gita Study Circle",
  "Harinama Sankirtana",
  "Festival Celebration",
  "Bhagavatam Class",
  "Kirtan Session",
  "Prasadam Distribution",
  "Community Service",
  "Youth Program",
  "Ladies Program"
];

export default function NamhattaUpdateForm({ namhattaId, isOpen, onClose }: NamhattaUpdateFormProps) {
  const { toast } = useToast();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<UpdateFormData>({
    defaultValues: {
      programType: "",
      date: new Date().toISOString().split('T')[0],
      attendance: 0,
      prasadDistribution: 0,
      nagarKirtan: false,
      bookDistribution: false,
      chanting: false,
      arati: false,
      bhagwatPath: false,
      specialAttraction: "",
      facebookLink: "",
      youtubeLink: "",
      imageUrls: []
    }
  });

  const createUpdateMutation = useMutation({
    mutationFn: (data: UpdateFormData) => api.createNamhattaUpdate({
      namhattaId,
      ...data,
      imageUrls
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/namhattas/${namhattaId}/updates`] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Update posted successfully",
      });
      reset();
      setImageUrls([]);
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post update",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UpdateFormData) => {
    createUpdateMutation.mutate({
      ...data,
      imageUrls
    });
  };

  const addImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const updateImageUrl = (index: number, url: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = url;
    setImageUrls(newUrls);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-indigo-500" />
            Post Namhatta Update
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Program Type */}
          <div className="space-y-2">
            <Label htmlFor="programType">Program Type</Label>
            <Select onValueChange={(value) => setValue("programType", value)}>
              <SelectTrigger className="glass">
                <SelectValue placeholder="Select program type" />
              </SelectTrigger>
              <SelectContent>
                {programTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.programType && (
              <p className="text-sm text-red-500">Program type is required</p>
            )}
          </div>

          {/* Date and Attendance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                type="date"
                {...register("date", { required: "Date is required" })}
                className="glass"
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendance">Attendance</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="number"
                  min="0"
                  {...register("attendance", { 
                    required: "Attendance is required",
                    min: { value: 0, message: "Attendance must be positive" }
                  })}
                  className="pl-10 glass"
                  placeholder="Number of attendees"
                />
              </div>
              {errors.attendance && (
                <p className="text-sm text-red-500">{errors.attendance.message}</p>
              )}
            </div>
          </div>

          {/* Prasadam Distribution */}
          <div className="space-y-2">
            <Label htmlFor="prasadDistribution">Prasadam Distribution (optional)</Label>
            <div className="relative">
              <Utensils className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="number"
                min="0"
                {...register("prasadDistribution")}
                className="pl-10 glass"
                placeholder="Number of prasadam distributed"
              />
            </div>
          </div>

          {/* Program Activities */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Program Activities</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg glass">
                <div className="flex items-center space-x-2">
                  <Music className="h-4 w-4 text-orange-500" />
                  <span>Nagar Kirtan</span>
                </div>
                <Switch 
                  onCheckedChange={(checked) => setValue("nagarKirtan", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg glass">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span>Book Distribution</span>
                </div>
                <Switch 
                  onCheckedChange={(checked) => setValue("bookDistribution", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg glass">
                <div className="flex items-center space-x-2">
                  <Music className="h-4 w-4 text-purple-500" />
                  <span>Chanting</span>
                </div>
                <Switch 
                  onCheckedChange={(checked) => setValue("chanting", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg glass">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span>Arati</span>
                </div>
                <Switch 
                  onCheckedChange={(checked) => setValue("arati", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg glass md:col-span-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span>Bhagwat Path</span>
                </div>
                <Switch 
                  onCheckedChange={(checked) => setValue("bhagwatPath", checked)}
                />
              </div>
            </div>
          </div>

          {/* Special Attraction */}
          <div className="space-y-2">
            <Label htmlFor="specialAttraction">Special Attraction (optional)</Label>
            <Textarea
              {...register("specialAttraction")}
              className="glass"
              placeholder="Describe any special highlights or attractions..."
              rows={3}
            />
          </div>

          {/* Social Media Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebookLink">Facebook Link (optional)</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="url"
                  {...register("facebookLink")}
                  className="pl-10 glass"
                  placeholder="https://facebook.com/..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtubeLink">YouTube Link (optional)</Label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="url"
                  {...register("youtubeLink")}
                  className="pl-10 glass"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>

          {/* Image URLs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Images (optional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>
                <Image className="mr-2 h-4 w-4" />
                Add Image URL
              </Button>
            </div>
            
            {imageUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => updateImageUrl(index, e.target.value)}
                  className="glass"
                  placeholder="https://example.com/image.jpg"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => removeImageUrl(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="gradient-button"
              disabled={createUpdateMutation.isPending}
            >
              {createUpdateMutation.isPending ? "Posting..." : "Post Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}