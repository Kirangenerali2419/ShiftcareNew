import { DoctorAvailability, Doctor } from '../types';

const API_URL = 'https://raw.githubusercontent.com/suyogshiftcare/jsontest/main/available.json';

/**
 * Fetches doctor availability data from the API
 * @returns Promise resolving to array of doctor availability entries
 * @throws Error if API request fails
 */
export const fetchDoctorAvailability = async (): Promise<DoctorAvailability[]> => {
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data: DoctorAvailability[] = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch doctor availability: ${error.message}`);
    }
    throw new Error('Failed to fetch doctor availability: Unknown error');
  }
};

/**
 * Groups availability data by doctor name and creates Doctor objects
 * @param availabilityData Raw availability data from API
 * @returns Array of Doctor objects with unique IDs
 */
export const groupDoctorsByAvailability = (availabilityData: DoctorAvailability[]): Doctor[] => {
  const doctorMap = new Map<string, DoctorAvailability[]>();
  
  // Group entries by doctor name
  availabilityData.forEach((entry) => {
    const existing = doctorMap.get(entry.name) || [];
    doctorMap.set(entry.name, [...existing, entry]);
  });
  
  // Convert to Doctor array with IDs
  const doctors: Doctor[] = Array.from(doctorMap.entries()).map(([name, availability], index) => ({
    id: `doctor-${index + 1}`,
    name,
    timezone: availability[0].timezone, // All entries for a doctor should have same timezone
    availability,
  }));
  
  return doctors;
};

/**
 * Fetches and processes doctor data
 * @returns Promise resolving to array of Doctor objects
 */
export const getDoctors = async (): Promise<Doctor[]> => {
  const availabilityData = await fetchDoctorAvailability();
  return groupDoctorsByAvailability(availabilityData);
};
