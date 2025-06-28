import fs from 'fs';
import path from 'path';

export interface GeographicRecord {
  stateCode: string;
  stateNameEnglish: string;
  districtCode: string;
  districtNameEnglish: string;
  subdistrictCode: string;
  subdistrictNameEnglish: string;
  villageCode: string;
  villageNameEnglish: string;
  pincode: string;
}

let geographicData: GeographicRecord[] = [];
let isDataLoaded = false;

export async function loadGeographicData(): Promise<void> {
  if (isDataLoaded) return;

  try {
    const csvPath = path.join(process.cwd(), 'attached_assets', 'f17a1608-5f10-4610-bb50-a63c80d83974_5440046a63c72fe90e3dc31777d48358_1751117921697.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');
    
    // Skip header and parse each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',');
      if (values.length >= 9) {
        geographicData.push({
          stateCode: values[0],
          stateNameEnglish: values[1],
          districtCode: values[2],
          districtNameEnglish: values[3],
          subdistrictCode: values[4],
          subdistrictNameEnglish: values[5],
          villageCode: values[6],
          villageNameEnglish: values[7],
          pincode: values[8]
        });
      }
    }
    
    isDataLoaded = true;
    console.log(`Loaded ${geographicData.length} geographic records`);
  } catch (error) {
    console.error('Error loading geographic data:', error);
    // Fallback to existing mock data if CSV loading fails
    isDataLoaded = true;
  }
}

export function getCountries(): string[] {
  // For this Indian dataset, we'll return "India" as the primary country
  return ["India"];
}

export function getStates(country?: string): string[] {
  if (!isDataLoaded) return [];
  
  const states = new Set<string>();
  geographicData.forEach(record => {
    states.add(record.stateNameEnglish);
  });
  
  return Array.from(states).sort();
}

export function getDistricts(state: string): string[] {
  if (!isDataLoaded) return [];
  
  const districts = new Set<string>();
  geographicData
    .filter(record => record.stateNameEnglish === state)
    .forEach(record => {
      districts.add(record.districtNameEnglish);
    });
  
  return Array.from(districts).sort();
}

export function getSubDistricts(district: string): string[] {
  if (!isDataLoaded) return [];
  
  const subDistricts = new Set<string>();
  geographicData
    .filter(record => record.districtNameEnglish === district)
    .forEach(record => {
      subDistricts.add(record.subdistrictNameEnglish);
    });
  
  return Array.from(subDistricts).sort();
}

export function getVillages(subDistrict: string): string[] {
  if (!isDataLoaded) return [];
  
  const villages = new Set<string>();
  geographicData
    .filter(record => record.subdistrictNameEnglish === subDistrict)
    .forEach(record => {
      villages.add(record.villageNameEnglish);
    });
  
  return Array.from(villages).sort();
}

export function getGeographicCounts() {
  if (!isDataLoaded) return { countries: 0, states: 0, districts: 0, subDistricts: 0, villages: 0 };
  
  const countries = new Set<string>();
  const states = new Set<string>();
  const districts = new Set<string>();
  const subDistricts = new Set<string>();
  const villages = new Set<string>();
  
  geographicData.forEach(record => {
    countries.add("India"); // All records are for India
    states.add(record.stateNameEnglish);
    districts.add(record.districtNameEnglish);
    subDistricts.add(record.subdistrictNameEnglish);
    villages.add(record.villageNameEnglish);
  });
  
  return {
    countries: countries.size,
    states: states.size,
    districts: districts.size,
    subDistricts: subDistricts.size,
    villages: villages.size
  };
}