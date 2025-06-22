import { useState, useEffect, useRef } from "react";
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
import L from "leaflet";

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
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

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
      'Western': [79.8, 6.9],
      'Bagmati': [85.3, 27.7],
      // Districts
      'Kolkata': [88.4, 22.6],
      'Nadia': [88.4, 23.4],
      'Colombo': [79.8, 6.9],
      'Kathmandu': [85.3, 27.7],
      // Sub-districts
      'Mayapur': [88.4, 23.4],
      'Central': [88.35, 22.57],
      'Krishnanagar': [88.5, 23.4],
      'North': [88.37, 22.62],
      'Dhanmondi': [90.37, 23.75],
      'Port Area': [91.8, 22.3],
      'Colombo Central': [79.8, 6.9]
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

  // Initialize Leaflet map
  useEffect(() => {
    const initMap = () => {
      const mapContainer = document.getElementById('leaflet-map');
      if (!mapContainer) {
        console.log('Map container not found, retrying...');
        setTimeout(initMap, 100);
        return;
      }
      
      if (mapRef.current) {
        return; // Map already initialized
      }

      try {
        // Initialize the map with full interaction capabilities
        const map = L.map('leaflet-map', {
          zoomControl: false, // We'll add custom controls
          doubleClickZoom: true, // Enable double click zoom
          scrollWheelZoom: true, // Enable mouse wheel zoom
          touchZoom: true, // Enable touch zoom on mobile
          dragging: true, // Enable dragging
          tap: true, // Enable tap on mobile
          boxZoom: true, // Enable box zoom with shift+drag
        }).setView([20, 77], 4); // Centered on South Asia
        
        // Add OpenStreetMap tiles (like Google Maps)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);
        
        // Initialize marker layer
        markersRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        
        console.log('Leaflet map initialized successfully');
      } catch (error) {
        console.error('Error initializing map:', error);
        setTimeout(initMap, 500);
      }
    };

    // Start initialization
    initMap();
    
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;
    
    // Clear existing markers
    markersRef.current.clearLayers();
    
    // Add new markers
    currentData.forEach((data) => {
      if (!data.coordinates || !markersRef.current) return;
      
      const [lng, lat] = data.coordinates;
      const radius = Math.max(10, Math.sqrt(data.count) * 8);
      
      // Create circle marker with color based on count
      const circle = L.circleMarker([lat, lng], {
        radius: radius,
        fillColor: colorScale(data.count),
        color: 'white',
        weight: 3,
        opacity: 0.9,
        fillOpacity: 0.8
      });
      
      // Add popup
      circle.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-lg">${data.name}</h3>
          <p class="text-sm text-gray-600">Namhattas: <span class="font-medium">${data.count}</span></p>
          <p class="text-xs text-gray-500">${currentLevel.replace('_', ' ')}</p>
        </div>
      `);
      
      // Add click handler for drilling down
      circle.on('click', () => {
        handleMarkerClick(data);
      });
      
      markersRef.current.addLayer(circle);
    });
  }, [currentData, colorScale, currentLevel]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleReset = () => {
    setCurrentLevel('COUNTRY');
    setSelectedCountry('');
    setSelectedState('');
    setSelectedDistrict('');
    if (mapRef.current) {
      mapRef.current.setView([20, 77], 4);
    }
  };

  const handleLevelChange = (level: MapLevel) => {
    setCurrentLevel(level);
    if (mapRef.current) {
      const zoomLevels = {
        COUNTRY: { center: [20, 77] as [number, number], zoom: 4 },
        STATE: { center: [22.5, 88] as [number, number], zoom: 6 },
        DISTRICT: { center: [22.6, 88.4] as [number, number], zoom: 8 },
        SUB_DISTRICT: { center: [22.6, 88.4] as [number, number], zoom: 10 }
      };
      const config = zoomLevels[level];
      mapRef.current.setView(config.center, config.zoom);
    }
  };

  const handleMarkerClick = (data: MapData) => {
    if (data.level === 'COUNTRY' && currentLevel === 'COUNTRY') {
      setSelectedCountry(data.name);
      setCurrentLevel('STATE');
      // Zoom to the country
      if (mapRef.current && data.coordinates) {
        const [lng, lat] = data.coordinates;
        mapRef.current.setView([lat, lng], 6);
      }
    } else if (data.level === 'STATE' && currentLevel === 'STATE') {
      setSelectedState(data.name);
      setCurrentLevel('DISTRICT');
      // Zoom to the state
      if (mapRef.current && data.coordinates) {
        const [lng, lat] = data.coordinates;
        mapRef.current.setView([lat, lng], 8);
      }
    } else if (data.level === 'DISTRICT' && currentLevel === 'DISTRICT') {
      setSelectedDistrict(data.name);
      setCurrentLevel('SUB_DISTRICT');
      // Zoom to the district
      if (mapRef.current && data.coordinates) {
        const [lng, lat] = data.coordinates;
        mapRef.current.setView([lat, lng], 10);
      }
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
            <div 
              id="leaflet-map" 
              className="w-full h-[600px] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
              style={{ minHeight: '600px' }}
            />
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