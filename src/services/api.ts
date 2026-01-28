import { DoctorAvailability, Doctor } from '../types';
import { API_CONFIG } from '../constants';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

const createApiUrl = (endpoint: string): string => 
  `${API_CONFIG.BASE_URL}${endpoint}`;

export const fetchDoctorAvailability = async (): Promise<DoctorAvailability[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
  
  try {
    const response = await fetch(createApiUrl(API_CONFIG.ENDPOINTS.AVAILABILITY), {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new ApiError(`API request failed with status ${response.status}`, response.status);
    }
    
    const data: DoctorAvailability[] = await response.json();
    
    if (!Array.isArray(data)) {
      throw new ApiError('Invalid API response format');
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout');
      }
      throw new ApiError(`Network error: ${error.message}`);
    }
    
    throw new ApiError('Unknown error occurred');
  }
};

export const groupDoctorsByAvailability = (availabilityData: DoctorAvailability[]): Doctor[] => {
  const doctorMap = new Map<string, DoctorAvailability[]>();
  
  availabilityData.forEach((entry) => {
    const existing = doctorMap.get(entry.name) || [];
    doctorMap.set(entry.name, [...existing, entry]);
  });
  
  return Array.from(doctorMap.entries()).map(([name, availability], index) => ({
    id: `doctor-${index + 1}`,
    name,
    timezone: availability[0].timezone,
    availability,
  }));
};

export const getDoctors = async (): Promise<Doctor[]> => {
  const availabilityData = await fetchDoctorAvailability();
  return groupDoctorsByAvailability(availabilityData);
};
