// 차량 데이터를 위한 임시 메모리 저장소
// 실제 데이터베이스 연결 전까지 사용

interface Car {
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
  updatedAt: string;
}

// 메모리 저장소 (서버 재시작 시 초기화됨)
const carStorage = new Map<string, Car>();

export const carMemoryStorage = {
  // 사용자별 차량 목록 조회
  async findByUserId(userId: string): Promise<Car[]> {
    const userCars: Car[] = [];
    for (const car of carStorage.values()) {
      if (car.userId === userId) {
        userCars.push(car);
      }
    }
    return userCars.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  // 차량 ID로 조회
  async findById(carId: string): Promise<Car | null> {
    return carStorage.get(carId) || null;
  },

  // 차량 생성
  async create(carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Promise<Car> {
    const car: Car = {
      ...carData,
      id: `car_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    carStorage.set(car.id, car);
    return car;
  },

  // 차량 수정
  async update(carId: string, updateData: Partial<Omit<Car, 'id' | 'userId' | 'createdAt'>>): Promise<Car | null> {
    const existingCar = carStorage.get(carId);
    if (!existingCar) {
      return null;
    }

    const updatedCar: Car = {
      ...existingCar,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    carStorage.set(carId, updatedCar);
    return updatedCar;
  },

  // 차량 삭제
  async delete(carId: string): Promise<boolean> {
    return carStorage.delete(carId);
  },

  // 사용자의 차량 수 조회
  async countByUserId(userId: string): Promise<number> {
    let count = 0;
    for (const car of carStorage.values()) {
      if (car.userId === userId) {
        count++;
      }
    }
    return count;
  },

  // 차량번호 중복 확인
  async findByLicensePlate(licensePlate: string, excludeCarId?: string): Promise<Car | null> {
    for (const car of carStorage.values()) {
      if (car.licensePlate === licensePlate && car.id !== excludeCarId) {
        return car;
      }
    }
    return null;
  },

  // 전체 저장소 상태 확인 (디버그용)
  async getAll(): Promise<Car[]> {
    return Array.from(carStorage.values());
  },

  // 저장소 초기화 (테스트용)
  async clear(): Promise<void> {
    carStorage.clear();
  }
};

export type { Car };