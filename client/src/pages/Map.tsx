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

  // Determine level based on zoom - simplified thresholds
  const getLevelFromZoom = (zoom: number): MapLevel => {
    if (zoom >= 10) return 'DISTRICT';
    if (zoom >= 6) return 'STATE';
    return 'COUNTRY';
  };

  // Update level when zoom changes
  useEffect(() => {
    const newLevel = getLevelFromZoom(zoomLevel);
    if (newLevel !== currentLevel) {
      setCurrentLevel(newLevel);
      console.log(`Zoom level ${zoomLevel} -> switching to ${newLevel} view`);
    }
  }, [zoomLevel, currentLevel]);

  // Always load all data - no conditional loading to avoid blank screens
  const { data: countryData = [], isLoading: countryLoading } = useQuery({
    queryKey: ["/api/map/countries"],
    queryFn: getQueryFn({ on401: "throw" }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: stateData = [], isLoading: stateLoading } = useQuery({
    queryKey: ["/api/map/states"],
    queryFn: getQueryFn({ on401: "throw" }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: districtData = [], isLoading: districtLoading } = useQuery({
    queryKey: ["/api/map/districts"], 
    queryFn: getQueryFn({ on401: "throw" }),
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = countryLoading || stateLoading || districtLoading;

  // Get current data based on level
  const getCurrentData = (): MapData[] => {
    const coordinatesMap: Record<string, [number, number]> = {
      // Countries
      'India': [77, 20],
      'Bangladesh': [90, 24],
      'Sri Lanka': [81, 7],
      'Nepal': [84, 28],
      
      // States
      'West Bengal': [88, 22.5],
      'Odisha': [85, 20],
      'Bihar': [85, 25.5],
      'Jharkhand': [85.5, 23.5],
      'Assam': [94, 26.5],
      'Dhaka': [90.4, 23.8],
      'Chittagong Division': [91.8, 22.3],
      'Western': [79.8, 6.9],
      'Bagmati': [85.3, 27.7],
      
      // Districts - West Bengal
      'Nadia': [88.4, 23.4],
      'Kolkata': [88.4, 22.6],
      'Howrah': [88.3, 22.6],
      'Paschim Bardhaman': [87.3, 23.2],
      'Darjeeling': [88.3, 27.0],
      'Malda': [88.0, 25.0],
      'Cooch Behar': [89.4, 26.3],
      'Jalpaiguri': [88.7, 26.5],
      'Murshidabad': [88.2, 24.2],
      'Bankura': [87.1, 23.2],
      'Purulia': [86.4, 23.3],
      'Paschim Medinipur': [87.3, 22.4],
      
      // Districts - Odisha
      'Khordha': [85.8, 20.2],
      'Puri': [85.8, 19.8],
      'Cuttack': [85.9, 20.5],
      'Ganjam': [84.8, 19.4],
      'Sundargarh': [84.0, 22.1],
      'Sambalpur': [83.9, 21.5],
      'Balasore': [86.9, 21.5],
      'Mayurbhanj': [86.7, 22.1],
      'Jharsuguda': [84.0, 21.9],
      'Angul': [85.1, 20.8],
      'Kendrapara': [86.4, 20.5],
      'Koraput': [82.7, 18.8],
      
      // Districts - Bihar
      'Patna': [85.1, 25.6],
      'Gaya': [85.0, 24.8],
      'Muzaffarpur': [85.4, 26.1],
      'Bhagalpur': [87.0, 25.2],
      'Darbhanga': [85.9, 26.2],
      'Purnia': [87.5, 25.8],
      'Bhojpur': [84.4, 25.5],
      'Begusarai': [86.1, 25.4],
      'Katihar': [87.6, 25.5],
      'Rohtas': [84.0, 24.9],
      
      // Districts - Jharkhand
      'Ranchi': [85.3, 23.4],
      'East Singhbhum': [86.2, 22.8],
      'Dhanbad': [86.4, 23.8],
      'Bokaro': [86.0, 23.8],
      'Deoghar': [86.7, 24.5],
      'Hazaribagh': [85.4, 24.0],
      'Giridih': [86.3, 24.2],
      'West Singhbhum': [85.8, 22.6],
      
      // Districts - Assam
      'Kamrup Metropolitan': [91.7, 26.2],
      'Dibrugarh': [95.0, 27.5],
      'Cachar': [92.8, 24.8],
      'Jorhat': [94.2, 26.8],
      'Sonitpur': [92.8, 26.6],
      'Nagaon': [92.7, 26.3],
      'Tinsukia': [95.4, 27.5],
      'Bongaigaon': [90.5, 26.5],
      
      // Other countries/regions
      'Dhaka Metro': [90.4, 23.8],
      'Chittagong Metro': [91.8, 22.3],
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
        const countries = Array.isArray(countryData) ? countryData.map((item: any) => ({
          name: item.country,
          count: item.count,
          coordinates: coordinatesMap[item.country],
          level: 'COUNTRY' as MapLevel
        })).filter((item: any) => item.coordinates) : [];
        console.log(`Showing ${countries.length} countries at zoom ${zoomLevel}`);
        return countries;
      case 'STATE':
        const states = Array.isArray(stateData) ? stateData.map((item: any) => ({
          name: item.state,
          count: item.count,
          coordinates: coordinatesMap[item.state],
          level: 'STATE' as MapLevel
        })).filter((item: any) => item.coordinates) : [];
        console.log(`Showing ${states.length} states at zoom ${zoomLevel}`);
        return states;
      case 'DISTRICT':
        const districts = Array.isArray(districtData) ? districtData.map((item: any) => ({
          name: item.district,
          count: item.count,
          coordinates: coordinatesMap[item.district],
          level: 'DISTRICT' as MapLevel
        })).filter((item: any) => item.coordinates) : [];
        console.log(`Showing ${districts.length} districts at zoom ${zoomLevel}`);
        return districts;
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
          boxZoom: true, // Enable box zoom with shift+drag
          attributionControl: false, // Disable attribution control
        }).setView([20, 77], 4); // Centered on South Asia
        
        // Listen for zoom changes to update level automatically
        map.on('zoomend', () => {
          const zoom = map.getZoom();
          console.log('Zoom changed to:', zoom);
          setZoomLevel(Math.round(zoom));
        });
        
        // Listen for view changes to ensure markers are always visible
        map.on('moveend', () => {
          console.log('Map moved, current bounds:', map.getBounds());
        });
        
        // Set initial zoom level
        setZoomLevel(4);
        
        // Add OpenStreetMap tiles with better error handling
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '',
          maxZoom: 19,
          minZoom: 2,
          detectRetina: true,
          crossOrigin: true
        });
        
        // Remove the problematic error handler for now
        // tileLayer.on('tileerror', (e: L.LeafletEvent) => {
        //   console.log('Tile error:', e);
        // });
        
        tileLayer.addTo(map);
        
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
    
    console.log(`Updating markers for ${currentLevel} with ${currentData.length} items:`, currentData);
    
    // Clear existing markers
    markersRef.current.clearLayers();
    
    if (currentData.length === 0) {
      console.log('No data to display on map for level:', currentLevel);
      // Don't return early - let the map stay visible even without markers
    }
    
    // Add new markers - only if we have data
    if (currentData.length > 0) {
      currentData.forEach((data, index) => {
        if (!data.coordinates || !markersRef.current) {
          console.log('Missing coordinates for:', data.name);
          return;
        }
        
        const [lng, lat] = data.coordinates;
        
        console.log(`Adding marker for ${data.name} at [${lat}, ${lng}] with ${data.count} namhattas`);
        
        // Create a combined marker with visible count
        const markerSize = Math.max(40, Math.sqrt(data.count) * 15);
        const combinedIcon = L.divIcon({
          html: `
            <div style="
              background: ${colorScale(data.count)};
              color: white;
              border: 3px solid white;
              border-radius: 50%;
              width: ${markerSize}px;
              height: ${markerSize}px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              cursor: pointer;
              font-size: ${Math.max(12, markerSize * 0.3)}px;
              line-height: 1;
              z-index: 1000;
            ">
              <div style="font-size: ${Math.max(18, markerSize * 0.4)}px; margin-bottom: 2px;">${data.count}</div>
              <div style="font-size: ${Math.max(10, markerSize * 0.25)}px; opacity: 0.9;">${data.name.length > 8 ? data.name.substring(0, 8) + '...' : data.name}</div>
            </div>
          `,
          className: 'namhatta-marker',
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2]
        });
        
        const marker = L.marker([lat, lng], { icon: combinedIcon });
        
        // Add popup
        marker.bindPopup(`
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
        
        marker.on('click', () => {
          console.log('Marker clicked:', data.name);
          handleMarkerClick(data);
        });
        
        markersRef.current.addLayer(marker);
      });
    }
    
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
      let targetZoom = mapRef.current.getZoom() + 3;
      if (data.level === 'COUNTRY') targetZoom = 7;
      else if (data.level === 'STATE') targetZoom = 11;
      
      console.log(`Zooming to [${lat}, ${lng}] at zoom ${targetZoom}`);
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
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset View
          </Button>
          <p className="text-sm text-muted-foreground">
            Zoom in/out to see different levels automatically
          </p>
        </div>
      </div>

      {/* Full Width Map */}
      <Card>
        <CardContent className="p-0">
          <div 
            id="leaflet-map" 
            className="w-full h-[80vh] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
            style={{ minHeight: '80vh' }}
          />
        </CardContent>
      </Card>

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