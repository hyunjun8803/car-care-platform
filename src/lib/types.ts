export interface User {
  id: string
  email: string
  name: string
  phone?: string
  userType: 'customer' | 'shop_owner' | 'admin'
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Car {
  id: string
  userId: string
  make: string
  model: string
  year: number
  licensePlate: string
  vin?: string
  engineType?: string
  mileage: number
  purchaseDate?: Date
  isActive: boolean
  createdAt: Date
}

export interface MaintenanceLog {
  id: string
  carId: string
  shopId?: string
  serviceType: string
  description?: string
  cost: number
  mileageAtService?: number
  serviceDate: Date
  nextServiceDate?: Date
  invoiceUrl?: string
  createdAt: Date
}

export interface Shop {
  id: string
  ownerId: string
  businessName: string
  businessNumber: string
  address: string
  latitude?: number
  longitude?: number
  phone: string
  email: string
  operatingHours?: Record<string, any>
  rating: number
  totalReviews: number
  isVerified: boolean
  isActive: boolean
  createdAt: Date
}

export interface Service {
  id: string
  shopId: string
  categoryId: string
  name: string
  description?: string
  basePrice: number
  estimatedDuration: number
  isAvailable: boolean
  createdAt: Date
}

export interface Booking {
  id: string
  userId: string
  carId: string
  shopId: string
  serviceId: string
  bookingDate: Date
  bookingTime: string
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  estimatedCost?: number
  finalCost?: number
  paymentStatus: 'unpaid' | 'paid' | 'refunded'
  createdAt: Date
}