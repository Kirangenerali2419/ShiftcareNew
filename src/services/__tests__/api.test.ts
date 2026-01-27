import { fetchDoctorAvailability, groupDoctorsByAvailability, getDoctors } from '../api';
import { DoctorAvailability } from '../../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchDoctorAvailability', () => {
    it('should fetch and return doctor availability data', async () => {
      const mockData: DoctorAvailability[] = [
        {
          name: 'Dr. Test',
          timezone: 'Australia/Sydney',
          day_of_week: 'Monday',
          available_at: ' 9:00AM',
          available_until: ' 5:00PM',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await fetchDoctorAvailability();
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/suyogshiftcare/jsontest/main/available.json'
      );
    });

    it('should throw error when API request fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(fetchDoctorAvailability()).rejects.toThrow('API request failed with status 404');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchDoctorAvailability()).rejects.toThrow(
        'Failed to fetch doctor availability: Network error'
      );
    });
  });

  describe('groupDoctorsByAvailability', () => {
    it('should group availability entries by doctor name', () => {
      const input: DoctorAvailability[] = [
        {
          name: 'Dr. Test',
          timezone: 'Australia/Sydney',
          day_of_week: 'Monday',
          available_at: ' 9:00AM',
          available_until: ' 5:00PM',
        },
        {
          name: 'Dr. Test',
          timezone: 'Australia/Sydney',
          day_of_week: 'Tuesday',
          available_at: ' 9:00AM',
          available_until: ' 5:00PM',
        },
        {
          name: 'Dr. Another',
          timezone: 'Australia/Perth',
          day_of_week: 'Monday',
          available_at: ' 8:00AM',
          available_until: ' 4:00PM',
        },
      ];

      const result = groupDoctorsByAvailability(input);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Dr. Test');
      expect(result[0].availability).toHaveLength(2);
      expect(result[1].name).toBe('Dr. Another');
      expect(result[1].availability).toHaveLength(1);
    });

    it('should handle empty array', () => {
      const result = groupDoctorsByAvailability([]);
      expect(result).toEqual([]);
    });

    it('should assign unique IDs to doctors', () => {
      const input: DoctorAvailability[] = [
        {
          name: 'Dr. One',
          timezone: 'Australia/Sydney',
          day_of_week: 'Monday',
          available_at: ' 9:00AM',
          available_until: ' 5:00PM',
        },
        {
          name: 'Dr. Two',
          timezone: 'Australia/Perth',
          day_of_week: 'Monday',
          available_at: ' 8:00AM',
          available_until: ' 4:00PM',
        },
      ];

      const result = groupDoctorsByAvailability(input);
      expect(result[0].id).toBe('doctor-1');
      expect(result[1].id).toBe('doctor-2');
      expect(result[0].id).not.toBe(result[1].id);
    });
  });

  describe('getDoctors', () => {
    it('should fetch and process doctor data', async () => {
      const mockData: DoctorAvailability[] = [
        {
          name: 'Dr. Test',
          timezone: 'Australia/Sydney',
          day_of_week: 'Monday',
          available_at: ' 9:00AM',
          available_until: ' 5:00PM',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await getDoctors();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Dr. Test');
      expect(result[0].id).toBeDefined();
    });
  });
});
