import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  Music, 
  BookOpen, 
  Utensils, 
  Sparkles, 
  ExternalLink,
  Image,
  Facebook,
  Youtube
} from "lucide-react";
import { format } from "date-fns";

interface NamhattaUpdate {
  id: number;
  namhattaId: number;
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
  createdAt: string;
}

interface NamhattaUpdateCardProps {
  update: NamhattaUpdate;
  showNamhattaName?: boolean;
  namhattaName?: string;
}

export default function NamhattaUpdateCard({ 
  update, 
  showNamhattaName = false, 
  namhattaName 
}: NamhattaUpdateCardProps) {
  const activities = [
    { key: 'nagarKirtan', label: 'Nagar Kirtan', icon: Music, color: 'text-orange-500' },
    { key: 'bookDistribution', label: 'Book Distribution', icon: BookOpen, color: 'text-blue-500' },
    { key: 'chanting', label: 'Chanting', icon: Music, color: 'text-purple-500' },
    { key: 'arati', label: 'Arati', icon: Sparkles, color: 'text-yellow-500' },
    { key: 'bhagwatPath', label: 'Bhagwat Path', icon: BookOpen, color: 'text-green-500' }
  ];

  const activeActivities = activities.filter(activity => 
    update[activity.key as keyof NamhattaUpdate] === true
  );

  return (
    <Card className="glass-card hover-lift">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {update.programType}
            </h3>
            {showNamhattaName && namhattaName && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{namhattaName}</p>
            )}
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="mr-1 h-4 w-4" />
              {format(new Date(update.date), "PPP")}
            </div>
          </div>
          <Badge variant="secondary" className="status-badge-active">
            Active
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Attendance and Distribution */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {update.attendance}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Attendees</p>
            </div>
          </div>
          
          {update.prasadDistribution && (
            <div className="flex items-center space-x-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <Utensils className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {update.prasadDistribution}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Prasadam</p>
              </div>
            </div>
          )}
        </div>

        {/* Activities */}
        {activeActivities.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Activities</p>
            <div className="flex flex-wrap gap-2">
              {activeActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <Badge 
                    key={activity.key} 
                    variant="outline" 
                    className="flex items-center space-x-1"
                  >
                    <Icon className={`h-3 w-3 ${activity.color}`} />
                    <span>{activity.label}</span>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Attraction */}
        {update.specialAttraction && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Special Attraction</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              "{update.specialAttraction}"
            </p>
          </div>
        )}

        {/* Media Links */}
        <div className="flex items-center space-x-2">
          {update.facebookLink && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={() => window.open(update.facebookLink, '_blank')}
            >
              <Facebook className="h-3 w-3" />
              <span>Facebook</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
          
          {update.youtubeLink && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center space-x-1"
              onClick={() => window.open(update.youtubeLink, '_blank')}
            >
              <Youtube className="h-3 w-3" />
              <span>YouTube</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
          
          {update.imageUrls && update.imageUrls.length > 0 && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <Image className="h-3 w-3" />
              <span>{update.imageUrls.length} Images</span>
            </Badge>
          )}
        </div>

        {/* Image Gallery */}
        {update.imageUrls && update.imageUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {update.imageUrls.slice(0, 3).map((url, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src={url} 
                  alt={`${update.programType} image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  onClick={() => window.open(url, '_blank')}
                />
              </div>
            ))}
            {update.imageUrls.length > 3 && (
              <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  +{update.imageUrls.length - 3} more
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}