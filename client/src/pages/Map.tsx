import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { scaleSequential } from "d3-scale";
import { interpolateBlues } from "d3-scale-chromatic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getQueryFn } from "@/lib/queryClient";
import { Map as MapIcon, ZoomIn, ZoomOut, RotateCcw, Globe, MapPin } from "lucide-react";

// Geographic boundaries for different zoom levels
const ZOOM_LEVELS = {
  COUNTRY: { scale: 800, center: [77, 20] as [number, number] }, // India-centered
  STATE: { scale: 1600, center: [88, 22] as [number, number] }, // West Bengal-centered  
  DISTRICT: { scale: 3200, center: [88.4, 22.9] as [number, number] }, // Kolkata area
  SUB_DISTRICT: { scale: 6400, center: [88.4, 22.9] as [number, number] }
};

type MapLevel = 'COUNTRY' | 'STATE' | 'DISTRICT' | 'SUB_DISTRICT';

interface MapData {
  name: string;
  count: number;
  coordinates?: [number, number];
  level: MapLevel;
}

export default function Map() {
  const [currentLevel, setCurrentLevel] = useState<MapLevel>('COUNTRY');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [position, setPosition] = useState({ coordinates: ZOOM_LEVELS.COUNTRY.center, zoom: 1 });

  // Fetch data based on current level
  const { data: countryData, isLoading: countryLoading } = useQuery({
    queryKey: ["/api/map/countries"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: currentLevel === 'COUNTRY'
  });

  const { data: stateData, isLoading: stateLoading } = useQuery({
    queryKey: ["/api/map/states", selectedCountry],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: currentLevel === 'STATE' && !!selectedCountry
  });

  const { data: districtData, isLoading: districtLoading } = useQuery({
    queryKey: ["/api/map/districts", selectedState], 
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: currentLevel === 'DISTRICT' && !!selectedState
  });

  const { data: subDistrictData, isLoading: subDistrictLoading } = useQuery({
    queryKey: ["/api/map/sub-districts", selectedDistrict],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: currentLevel === 'SUB_DISTRICT' && !!selectedDistrict
  });

  const isLoading = countryLoading || stateLoading || districtLoading || subDistrictLoading;

  // Get current data based on level
  const getCurrentData = (): MapData[] => {
    const coordinatesMap: Record<string, [number, number]> = {
      // Countries
      'India': [77, 20],
      'Bangladesh': [90, 24],
      'Sri Lanka': [81, 7],
      'Nepal': [84, 28],
      // States in India
      'West Bengal': [88, 22.5],
      'Odisha': [85, 20],
      'Bihar': [85, 25.5],
      // States in Bangladesh  
      'Dhaka': [90.4, 23.8],
      'Chittagong': [91.8, 22.3],
      // Districts
      'Kolkata': [88.4, 22.6],
      'Nadia': [88.4, 23.4],
      'Dhaka': [90.4, 23.8],
      // Sub-districts
      'Mayapur': [88.4, 23.4],
      'Central': [88.35, 22.57],
      'Dhanmondi': [90.37, 23.75]
    };

    switch (currentLevel) {
      case 'COUNTRY':
        return countryData?.map((item: any) => ({
          name: item.country,
          count: item.count,
          coordinates: coordinatesMap[item.country],
          level: 'COUNTRY' as MapLevel
        })) || [];
      case 'STATE':
        return stateData?.map((item: any) => ({
          name: item.state,
          count: item.count,
          coordinates: coordinatesMap[item.state],
          level: 'STATE' as MapLevel
        })) || [];
      case 'DISTRICT':
        return districtData?.map((item: any) => ({
          name: item.district,
          count: item.count,
          coordinates: coordinatesMap[item.district],
          level: 'DISTRICT' as MapLevel
        })) || [];
      case 'SUB_DISTRICT':
        return subDistrictData?.map((item: any) => ({
          name: item.subDistrict,
          count: item.count,
          coordinates: coordinatesMap[item.subDistrict],
          level: 'SUB_DISTRICT' as MapLevel
        })) || [];
      default:
        return [];
    }
  };

  const currentData = getCurrentData();
  const maxCount = Math.max(...currentData.map(d => d.count), 1);
  const colorScale = scaleSequential(interpolateBlues).domain([0, maxCount]);

  const handleZoomIn = () => {
    setPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }));
  };

  const handleZoomOut = () => {
    setPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }));
  };

  const handleReset = () => {
    setCurrentLevel('COUNTRY');
    setSelectedCountry('');
    setSelectedState('');
    setSelectedDistrict('');
    setPosition({ coordinates: ZOOM_LEVELS.COUNTRY.center, zoom: 1 });
  };

  const handleLevelChange = (level: MapLevel) => {
    setCurrentLevel(level);
    const zoomConfig = ZOOM_LEVELS[level];
    setPosition({ coordinates: zoomConfig.center, zoom: 1 });
  };

  const handleMarkerClick = (data: MapData) => {
    if (data.level === 'COUNTRY' && currentLevel === 'COUNTRY') {
      setSelectedCountry(data.name);
      setCurrentLevel('STATE');
    } else if (data.level === 'STATE' && currentLevel === 'STATE') {
      setSelectedState(data.name);
      setCurrentLevel('DISTRICT');
    } else if (data.level === 'DISTRICT' && currentLevel === 'DISTRICT') {
      setSelectedDistrict(data.name);
      setCurrentLevel('SUB_DISTRICT');
    }
  };

  if (isLoading) {
    return <MapSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapIcon className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Namhatta Distribution Map</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              View Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Zoom Level</label>
              <Select value={currentLevel} onValueChange={(value: MapLevel) => handleLevelChange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COUNTRY">Country View</SelectItem>
                  <SelectItem value="STATE">State View</SelectItem>
                  <SelectItem value="DISTRICT">District View</SelectItem>
                  <SelectItem value="SUB_DISTRICT">Sub-District View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedCountry && (
              <div>
                <label className="text-sm font-medium mb-2 block">Selected Country</label>
                <Badge variant="secondary">{selectedCountry}</Badge>
              </div>
            )}

            {selectedState && (
              <div>
                <label className="text-sm font-medium mb-2 block">Selected State</label>
                <Badge variant="secondary">{selectedState}</Badge>
              </div>
            )}

            {selectedDistrict && (
              <div>
                <label className="text-sm font-medium mb-2 block">Selected District</label>
                <Badge variant="secondary">{selectedDistrict}</Badge>
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-200"></div>
                  <span className="text-sm">Low (1-2)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Medium (3-5)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-800"></div>
                  <span className="text-sm">High (6+)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {currentLevel.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())} Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[600px] bg-gradient-to-br from-blue-50 to-green-50 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden">
              <svg viewBox="0 0 800 600" className="w-full h-full">
                {/* Simple world map outline */}
                <path
                  d="M50 200 Q200 150 350 180 Q500 210 750 200 Q750 300 700 400 Q500 450 350 420 Q200 390 50 400 Z"
                  fill="#E5E7EB"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  className="dark:fill-slate-700 dark:stroke-slate-600"
                />
                
                {/* Country boundaries */}
                <path
                  d="M300 250 Q400 240 500 260 Q500 340 400 350 Q300 340 300 250 Z"
                  fill="#F3F4F6"
                  stroke="#9CA3AF"
                  strokeWidth="1"
                  className="dark:fill-slate-600 dark:stroke-slate-500"
                />
                
                <path
                  d="M520 270 Q580 265 620 280 Q620 330 580 340 Q520 335 520 270 Z"
                  fill="#F3F4F6"
                  stroke="#9CA3AF"
                  strokeWidth="1"
                  className="dark:fill-slate-600 dark:stroke-slate-500"
                />
                
                {/* Data markers */}
                {currentData.map((data, index) => {
                  if (!data.coordinates) return null;
                  
                  const [x, y] = data.coordinates;
                  // Scale coordinates to SVG viewBox
                  const scaledX = (x - 68) * 10 + 200; // Approximate scaling
                  const scaledY = (28 - y) * 15 + 150; // Approximate scaling
                  const radius = Math.max(6, Math.sqrt(data.count) * 4);
                  
                  return (
                    <g key={`${data.name}-${index}`}>
                      <circle
                        cx={scaledX}
                        cy={scaledY}
                        r={radius}
                        fill={colorScale(data.count)}
                        stroke="white"
                        strokeWidth="2"
                        opacity="0.9"
                        className="cursor-pointer hover:opacity-100 transition-opacity"
                        onClick={() => handleMarkerClick(data)}
                      />
                      <text
                        x={scaledX}
                        y={scaledY - radius - 8}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#374151"
                        fontWeight="500"
                        className="pointer-events-none dark:fill-white"
                      >
                        {data.name}
                      </text>
                      <text
                        x={scaledX}
                        y={scaledY + 3}
                        textAnchor="middle"
                        fontSize="10"
                        fill="white"
                        fontWeight="600"
                        className="pointer-events-none"
                      >
                        {data.count}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Namhattas</p>
                <p className="text-2xl font-bold">{currentData.reduce((sum, d) => sum + d.count, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Regions</p>
                <p className="text-2xl font-bold">{currentData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MapIcon className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Current View</p>
                <p className="text-2xl font-bold">{currentLevel.replace('_', ' ')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Skeleton className="h-[400px]" />
        <Skeleton className="lg:col-span-3 h-[600px]" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  );
}