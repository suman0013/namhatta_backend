import React, { useState, useEffect, useRef } from "react";
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

type MapLevel = 'COUNTRY' | 'STATE' | 'DISTRICT' | 'SUB_DISTRICT' | 'VILLAGE';

interface MapData {
  name: string;
  count: number;
  coordinates?: [number, number];
  level: MapLevel;
}

export default function Map() {
  const [currentLevel, setCurrentLevel] = useState<MapLevel>('COUNTRY');
  const [zoomLevel, setZoomLevel] = useState<number>(4);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Determine level based on zoom
  const getLevelFromZoom = (zoom: number): MapLevel => {
    if (zoom >= 12) return 'VILLAGE';
    if (zoom >= 9) return 'SUB_DISTRICT';
    if (zoom >= 7) return 'DISTRICT';
    if (zoom >= 5) return 'STATE';
    return 'COUNTRY';
  };

  // Update level when zoom changes
  useEffect(() => {
    const newLevel = getLevelFromZoom(zoomLevel);
    if (newLevel !== currentLevel) {
      setCurrentLevel(newLevel);
    }
  }, [zoomLevel, currentLevel]);

  // Fetch data based on current level - always load all data for zoom-based switching
  const { data: countryData, isLoading: countryLoading } = useQuery({
    queryKey: ["/api/map/countries"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: currentLevel === 'COUNTRY'
  });

  const { data: stateData, isLoading: stateLoading } = useQuery({
    queryKey: ["/api/map/states"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: currentLevel === 'STATE'
  });

  const { data: districtData, isLoading: districtLoading } = useQuery({
    queryKey: ["/api/map/districts"], 
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: currentLevel === 'DISTRICT'
  });

  const { data: subDistrictData, isLoading: subDistrictLoading } = useQuery({
    queryKey: ["/api/map/sub-districts"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: currentLevel === 'SUB_DISTRICT'
  });

  const { data: villageData, isLoading: villageLoading } = useQuery({
    queryKey: ["/api/map/villages"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: currentLevel === 'VILLAGE'
  });

  const isLoading = countryLoading || stateLoading || districtLoading || subDistrictLoading || villageLoading;

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
        if (!countryData) return [];
        const countries = countryData.map((item: any) => ({
          name: item.country,
          count: item.count,
          coordinates: coordinatesMap[item.country],
          level: 'COUNTRY' as MapLevel
        })).filter((item: any) => item.coordinates);
        console.log(`Showing ${countries.length} countries at zoom ${zoomLevel}`);
        return countries;
      case 'STATE':
        if (!stateData) return [];
        const states = stateData.map((item: any) => ({
          name: item.state,
          count: item.count,
          coordinates: coordinatesMap[item.state],
          level: 'STATE' as MapLevel
        })).filter((item: any) => item.coordinates);
        console.log(`Showing ${states.length} states at zoom ${zoomLevel}`);
        return states;
      case 'DISTRICT':
        if (!districtData) return [];
        const districts = districtData.map((item: any) => ({
          name: item.district,
          count: item.count,
          coordinates: coordinatesMap[item.district],
          level: 'DISTRICT' as MapLevel
        })).filter((item: any) => item.coordinates);
        console.log(`Showing ${districts.length} districts at zoom ${zoomLevel}`);
        return districts;
      case 'SUB_DISTRICT':
        if (!subDistrictData) return [];
        const subDistricts = subDistrictData.map((item: any) => ({
          name: item.subDistrict,
          count: item.count,
          coordinates: coordinatesMap[item.subDistrict],
          level: 'SUB_DISTRICT' as MapLevel
        })).filter((item: any) => item.coordinates);
        console.log(`Showing ${subDistricts.length} sub-districts at zoom ${zoomLevel}`);
        return subDistricts;
      case 'VILLAGE':
        if (!villageData) return [];
        const villages = villageData.map((item: any) => ({
          name: item.village,
          count: item.count,
          coordinates: coordinatesMap[item.village],
          level: 'VILLAGE' as MapLevel
        })).filter((item: any) => item.coordinates);
        console.log(`Showing ${villages.length} villages at zoom ${zoomLevel}`);
        return villages;
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
          zoomControl: true, // Enable zoom controls
          doubleClickZoom: true, // Enable double click zoom
          scrollWheelZoom: true, // Enable mouse wheel zoom
          touchZoom: true, // Enable touch zoom on mobile
          dragging: true, // Enable dragging
          tap: true, // Enable tap on mobile
          boxZoom: true, // Enable box zoom with shift+drag
        }).setView([20, 77], 4); // Centered on South Asia
        
        // Listen for zoom changes to update level automatically
        map.on('zoomend', () => {
          const zoom = map.getZoom();
          console.log('Zoom changed to:', zoom);
          setZoomLevel(zoom);
        });
        
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
    if (!mapRef.current || !markersRef.current) {
      console.log('Map or markers not ready yet');
      return;
    }
    
    console.log('Updating markers with data:', currentData);
    
    // Clear existing markers
    markersRef.current.clearLayers();
    
    if (currentData.length === 0) {
      console.log('No data to display on map');
      return;
    }
    
    // Add new markers
    currentData.forEach((data, index) => {
      if (!data.coordinates || !markersRef.current) {
        console.log('Missing coordinates for:', data.name);
        return;
      }
      
      const [lng, lat] = data.coordinates;
      const radius = Math.max(15, Math.sqrt(data.count) * 10);
      
      console.log(`Adding marker for ${data.name} at [${lat}, ${lng}] with ${data.count} namhattas`);
      
      // Create a highly visible circle marker with color based on count
      const circle = L.circleMarker([lat, lng], {
        radius: Math.max(15, Math.sqrt(data.count) * 8),
        fillColor: colorScale(data.count),
        color: '#ffffff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.8
      });
      
      // Add popup to the circle
      circle.bindPopup(`
        <div style="padding: 12px; min-width: 200px;">
          <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 8px 0; color: #1f2937;">${data.name}</h3>
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
            <strong style="color: #374151;">Namhattas:</strong> 
            <span style="font-weight: 600; color: #059669;">${data.count}</span>
          </p>
          <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 12px;">
            Level: ${currentLevel.replace('_', ' ')}
          </p>
          <p style="margin: 8px 0 0 0; color: #6366f1; font-size: 12px; cursor: pointer;">
            Click to zoom in →
          </p>
        </div>
      `);
      
      // Add click handler for drilling down
      circle.on('click', () => {
        console.log('Marker clicked:', data.name);
        handleMarkerClick(data);
      });
      
      // Add the marker to the layer group
      markersRef.current.addLayer(circle);
      
      // Add a text label on top of the circle
      const textIcon = L.divIcon({
        html: `
          <div style="
            color: white;
            font-weight: bold;
            font-size: 18px;
            text-align: center;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            pointer-events: none;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            ${data.count}
          </div>
        `,
        className: 'marker-label',
        iconSize: [50, 50],
        iconAnchor: [25, 25]
      });
      
      const textMarker = L.marker([lat, lng], { icon: textIcon });
      textMarker.on('click', () => {
        console.log('Text marker clicked:', data.name);
        handleMarkerClick(data);
      });
      markersRef.current.addLayer(textMarker);
    });
    
    console.log(`Added ${currentData.length} markers to map`);
  }, [currentData, colorScale, currentLevel]);



  const handleReset = () => {
    if (mapRef.current) {
      mapRef.current.setView([20, 77], 4);
    }
  };



  const handleMarkerClick = (data: MapData) => {
    console.log('Marker clicked:', data.name, 'Level:', data.level);
    
    // Simply zoom to the location and let the zoom level determine what data to show
    if (mapRef.current && data.coordinates) {
      const [lng, lat] = data.coordinates;
      
      // Determine appropriate zoom level for the next detail level
      let targetZoom = mapRef.current.getZoom() + 2;
      if (data.level === 'COUNTRY') targetZoom = 6;
      else if (data.level === 'STATE') targetZoom = 8;
      else if (data.level === 'DISTRICT') targetZoom = 10;
      else if (data.level === 'SUB_DISTRICT') targetZoom = 12;
      
      mapRef.current.setView([lat, lng], targetZoom);
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
            <div className="space-y-2">
              <Button onClick={handleReset} variant="outline" className="w-full">
                Reset to World View
              </Button>
              <p className="text-xs text-muted-foreground">
                Zoom in/out to see different levels of detail automatically
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Current Zoom Level</label>
              <Badge variant="secondary">Zoom {zoomLevel}</Badge>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Current View</label>
              <Badge variant="outline">{currentLevel.replace('_', ' ')}</Badge>
            </div>

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