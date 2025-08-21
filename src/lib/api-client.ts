// API 클라이언트 유틸리티

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    current: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CarRecord {
  id: string;
  userId: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
  fuelType: string;
  engineSize?: string;
  color?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  totalCost: number;
  maintenanceCount: number;
  createdAt: string;
}

export interface CarFormData {
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  mileage: number;
  fuelType: string;
  engineSize?: string;
  color?: string;
}

export interface MaintenanceRecord {
  id: string;
  carId: string;
  userId: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  mileage: number;
  shopName: string;
  shopAddress?: string;
  parts?: string;
  notes?: string;
  createdAt: string;
}

export interface MaintenanceFormData {
  carId: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  mileage: number;
  shopName: string;
  shopAddress?: string;
  parts?: string;
  notes?: string;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 400,
    public response?: ApiResponse
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || `HTTP ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.',
        0
      );
    }
  }

  // 차량 관리 API
  async getCars(): Promise<ApiResponse<CarRecord[]>> {
    return this.request<CarRecord[]>('/cars');
  }

  async getCar(id: string): Promise<ApiResponse<CarRecord>> {
    return this.request<CarRecord>(`/cars/${id}`);
  }

  async createCar(data: CarFormData): Promise<ApiResponse<CarRecord>> {
    return this.request<CarRecord>('/cars', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCar(id: string, data: Partial<CarFormData>): Promise<ApiResponse<CarRecord>> {
    return this.request<CarRecord>(`/cars/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCar(id: string): Promise<ApiResponse<CarRecord>> {
    return this.request<CarRecord>(`/cars/${id}`, {
      method: 'DELETE',
    });
  }

  // 정비 기록 관리 API
  async getMaintenanceRecords(params?: {
    carId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<MaintenanceRecord[]>> {
    const searchParams = new URLSearchParams();
    
    if (params?.carId) searchParams.set('carId', params.carId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return this.request<MaintenanceRecord[]>(`/maintenance${query ? `?${query}` : ''}`);
  }

  async getMaintenanceRecord(id: string): Promise<ApiResponse<MaintenanceRecord>> {
    return this.request<MaintenanceRecord>(`/maintenance/${id}`);
  }

  async createMaintenanceRecord(data: MaintenanceFormData): Promise<ApiResponse<MaintenanceRecord>> {
    return this.request<MaintenanceRecord>('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMaintenanceRecord(
    id: string, 
    data: Partial<MaintenanceFormData>
  ): Promise<ApiResponse<MaintenanceRecord>> {
    return this.request<MaintenanceRecord>(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMaintenanceRecord(id: string): Promise<ApiResponse<MaintenanceRecord>> {
    return this.request<MaintenanceRecord>(`/maintenance/${id}`, {
      method: 'DELETE',
    });
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();

// 편의 함수들
export const carsApi = {
  getAll: () => apiClient.getCars(),
  getById: (id: string) => apiClient.getCar(id),
  create: (data: CarFormData) => apiClient.createCar(data),
  update: (id: string, data: Partial<CarFormData>) => apiClient.updateCar(id, data),
  delete: (id: string) => apiClient.deleteCar(id),
};

export const maintenanceApi = {
  getAll: (params?: Parameters<typeof apiClient.getMaintenanceRecords>[0]) => 
    apiClient.getMaintenanceRecords(params),
  getById: (id: string) => apiClient.getMaintenanceRecord(id),
  create: (data: MaintenanceFormData) => apiClient.createMaintenanceRecord(data),
  update: (id: string, data: Partial<MaintenanceFormData>) => 
    apiClient.updateMaintenanceRecord(id, data),
  delete: (id: string) => apiClient.deleteMaintenanceRecord(id),
};

// 에러 처리 헬퍼
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '알 수 없는 오류가 발생했습니다.';
}

// 로딩 상태 관리를 위한 헬퍼
export function createAsyncHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  setLoading?: (loading: boolean) => void,
  onError?: (error: string) => void
): T {
  return (async (...args: Parameters<T>) => {
    try {
      setLoading?.(true);
      const result = await fn(...args);
      return result;
    } catch (error) {
      const errorMessage = handleApiError(error);
      onError?.(errorMessage);
      throw error;
    } finally {
      setLoading?.(false);
    }
  }) as T;
}