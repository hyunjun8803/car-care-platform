"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, X, Plus, AlertTriangle } from "lucide-react";
import { CarFormData } from "@/lib/api-client";

interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCar: (carData: CarFormData) => void;
  currentCarCount: number;
  maxCars?: number;
}

const CAR_BRANDS = [
  "현대", "기아", "제네시스", "쌍용", "르노삼성",
  "BMW", "벤츠", "아우디", "폭스바겐", "볼보",
  "토요타", "혼다", "닛산", "마쓰다", "렉서스",
  "테슬라", "포드", "쉐보레", "기타"
];

const FUEL_TYPES = [
  "가솔린", "디젤", "하이브리드", "전기", "플러그인 하이브리드", "LPG"
];

const COLORS = [
  "흰색", "검은색", "은색", "회색", "빨간색", "파란색", 
  "노란색", "초록색", "갈색", "보라색", "기타"
];

export function AddCarModal({ 
  isOpen, 
  onClose, 
  onAddCar, 
  currentCarCount, 
  maxCars = 10 
}: AddCarModalProps) {
  const [formData, setFormData] = useState<CarFormData>({
    name: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    mileage: 0,
    fuelType: "",
    engineSize: "",
    color: ""
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof CarFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) newErrors.name = "차량명을 입력하세요";
    if (!formData.brand) newErrors.brand = "브랜드를 선택하세요";
    if (!formData.model.trim()) newErrors.model = "모델명을 입력하세요";
    if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "올바른 연도를 입력하세요";
    }
    if (!formData.licensePlate.trim()) newErrors.licensePlate = "번호판을 입력하세요";
    if (formData.mileage < 0) newErrors.mileage = "주행거리는 0 이상이어야 합니다";
    if (!formData.fuelType) newErrors.fuelType = "연료 타입을 선택하세요";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentCarCount >= maxCars) {
      alert(`최대 ${maxCars}대까지만 등록할 수 있습니다.`);
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      await onAddCar(formData);
      onClose();
      setFormData({
        name: "",
        brand: "",
        model: "",
        year: new Date().getFullYear(),
        licensePlate: "",
        mileage: 0,
        fuelType: "",
        engineSize: "",
        color: ""
      });
    } catch (error) {
      console.error("Failed to add car:", error);
    } finally {
      setLoading(false);
    }
  };

  const canAddCar = currentCarCount < maxCars;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">새 차량 등록</CardTitle>
                <CardDescription>
                  차량 정보를 입력하여 등록하세요 
                  <Badge variant="outline" className="ml-2">
                    {currentCarCount}/{maxCars}대
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {!canAddCar && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-red-800 font-semibold">등록 제한 초과</p>
                <p className="text-red-600 text-sm">최대 {maxCars}대까지만 등록할 수 있습니다.</p>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">기본 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    차량명 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="예: 내 소나타"
                    className={`h-11 ${errors.name ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand" className="text-sm font-semibold text-gray-700">
                    브랜드 <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleChange("brand", e.target.value)}
                    className={`w-full h-11 px-3 border rounded-md bg-white ${
                      errors.brand ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <option value="">브랜드 선택</option>
                    {CAR_BRANDS.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  {errors.brand && <p className="text-red-500 text-xs">{errors.brand}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model" className="text-sm font-semibold text-gray-700">
                    모델명 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleChange("model", e.target.value)}
                    placeholder="예: 소나타 DN8"
                    className={`h-11 ${errors.model ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.model && <p className="text-red-500 text-xs">{errors.model}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm font-semibold text-gray-700">
                    연식 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleChange("year", parseInt(e.target.value))}
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    className={`h-11 ${errors.year ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.year && <p className="text-red-500 text-xs">{errors.year}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licensePlate" className="text-sm font-semibold text-gray-700">
                    번호판 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="licensePlate"
                    value={formData.licensePlate}
                    onChange={(e) => handleChange("licensePlate", e.target.value)}
                    placeholder="예: 123가4567"
                    className={`h-11 ${errors.licensePlate ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.licensePlate && <p className="text-red-500 text-xs">{errors.licensePlate}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-sm font-semibold text-gray-700">
                    현재 주행거리 (km)
                  </Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleChange("mileage", parseInt(e.target.value) || 0)}
                    placeholder="예: 50000"
                    min="0"
                    className={`h-11 ${errors.mileage ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.mileage && <p className="text-red-500 text-xs">{errors.mileage}</p>}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">추가 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fuelType" className="text-sm font-semibold text-gray-700">
                    연료 타입 <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="fuelType"
                    value={formData.fuelType}
                    onChange={(e) => handleChange("fuelType", e.target.value)}
                    className={`w-full h-11 px-3 border rounded-md bg-white ${
                      errors.fuelType ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <option value="">연료 타입 선택</option>
                    {FUEL_TYPES.map(fuel => (
                      <option key={fuel} value={fuel}>{fuel}</option>
                    ))}
                  </select>
                  {errors.fuelType && <p className="text-red-500 text-xs">{errors.fuelType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="engineSize" className="text-sm font-semibold text-gray-700">
                    배기량
                  </Label>
                  <Input
                    id="engineSize"
                    value={formData.engineSize}
                    onChange={(e) => handleChange("engineSize", e.target.value)}
                    placeholder="예: 2.0L"
                    className="h-11 border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color" className="text-sm font-semibold text-gray-700">
                  차량 색상
                </Label>
                <select
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-full h-11 px-3 border border-gray-200 rounded-md bg-white"
                >
                  <option value="">색상 선택</option>
                  {COLORS.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={loading || !canAddCar}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    등록 중...
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    차량 등록
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}