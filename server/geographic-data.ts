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
    const csvPath = path.join(process.cwd(), 'geographic_data_with_pincode.csv');
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
  const states = new Set<string>();
  
  // Add states from CSV data
  if (isDataLoaded) {
    geographicData.forEach(record => {
      states.add(record.stateNameEnglish);
    });
  }
  
  // Add states from existing Namhatta data to ensure coverage
  const additionalStates = [
    "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", 
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "Andhra Pradesh",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep",
    "Andaman and Nicobar Islands"
  ];
  
  additionalStates.forEach(state => states.add(state));
  
  return Array.from(states).sort();
}

export function getDistricts(state: string): string[] {
  const districts = new Set<string>();
  
  // Add districts from CSV data
  if (isDataLoaded) {
    geographicData
      .filter(record => record.stateNameEnglish === state)
      .forEach(record => {
        districts.add(record.districtNameEnglish);
      });
  }
  
  // Add fallback districts for states not in CSV data
  const additionalDistricts: Record<string, string[]> = {
    "Arunachal Pradesh": ["East Siang", "West Siang", "Upper Siang", "East Kameng", "West Kameng", "Papum Pare", "Lower Subansiri", "Upper Subansiri", "Kurung Kumey", "Dibang Valley", "Upper Dibang Valley", "Lohit", "Anjaw", "Changlang", "Tirap", "Longding", "Namsai", "Lower Dibang Valley", "Central Siang", "Siang", "Kamle", "Kra Daadi", "Lower Siang", "Shi Yomi", "Tawang"],
    "Assam": ["Kamrup", "Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tinsukia", "Nagaon", "Barpeta", "Dhubri"],
    // Add more states and their districts as needed
  };
  
  if (additionalDistricts[state]) {
    additionalDistricts[state].forEach(district => districts.add(district));
  }
  
  return Array.from(districts).sort();
}

export function getSubDistricts(district: string): string[] {
  const subDistricts = new Set<string>();
  
  // Add sub-districts from CSV data
  if (isDataLoaded) {
    geographicData
      .filter(record => record.districtNameEnglish === district)
      .forEach(record => {
        subDistricts.add(record.subdistrictNameEnglish);
      });
  }
  
  // Add fallback sub-districts for districts not in CSV data
  const additionalSubDistricts: Record<string, string[]> = {
    "East Siang": ["Pasighat", "Ruksin", "Boleng", "Nari", "Koyu"],
    "West Siang": ["Along", "Basar", "Bagra", "Liromoba"],
    // Add more districts and their sub-districts as needed
  };
  
  if (additionalSubDistricts[district]) {
    additionalSubDistricts[district].forEach(subDistrict => subDistricts.add(subDistrict));
  }
  
  return Array.from(subDistricts).sort();
}

export function getVillages(subDistrict: string): string[] {
  const villages = new Set<string>();
  
  // Add villages from CSV data
  if (isDataLoaded) {
    geographicData
      .filter(record => record.subdistrictNameEnglish === subDistrict)
      .forEach(record => {
        villages.add(record.villageNameEnglish);
      });
  }
  
  // Add fallback villages for sub-districts not in CSV data
  const additionalVillages: Record<string, string[]> = {
    "Pasighat": ["Pasighat", "Borguli", "Ruksin", "Pangin", "Bilat", "Sille", "Rebo"],
    "Along": ["Along", "Basar", "Daporijo", "Yingkiong"],
    // Add more sub-districts and their villages as needed
  };
  
  if (additionalVillages[subDistrict]) {
    additionalVillages[subDistrict].forEach(village => villages.add(village));
  }
  
  return Array.from(villages).sort();
}

export function getPincodes(village?: string, district?: string, subDistrict?: string): string[] {
  const pincodes = new Set<string>();
  
  if (isDataLoaded) {
    geographicData
      .filter(record => {
        if (village) return record.villageNameEnglish === village;
        if (subDistrict) return record.subdistrictNameEnglish === subDistrict;
        if (district) return record.districtNameEnglish === district;
        return true;
      })
      .forEach(record => {
        if (record.pincode && record.pincode.trim()) {
          pincodes.add(record.pincode.trim());
        }
      });
  }
  
  return Array.from(pincodes).sort();
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