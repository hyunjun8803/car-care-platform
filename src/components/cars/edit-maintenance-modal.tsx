"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, X, Save } from "lucide-react";
import { MaintenanceRecord, MaintenanceFormData } from "@/lib/api-client";

interface EditMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateMaintenance: (maintenanceData: MaintenanceRecord) => void;
  maintenance: MaintenanceRecord | null;
  carName: string;
}

const MAINTENANCE_TYPES = [
  "정기점검", "엔진정비", "브레이크", "타이어", "에어컨", 
  "배터리", "오일교환", "필터교체", "벨트교체", "세차", "기타"
];

const COMMON_SHOPS = [
  "현대 블루핸즈 강남점",
  "기아 오토큐 서초점", 
  "프리미엄 오토케어",
  "현대 블루핸즈 잠실점",
  "기아 오토큐 강남점",
  "토탈 카케어센터"
];

export function EditMaintenanceModal({ 
  isOpen, 
  onClose, 
  onUpdateMaintenance, 
  maintenance,
  carName 
}: EditMaintenanceModalProps) {
  const [formData, setFormData] = useState<MaintenanceFormData>({
    carId: "",
    date: "",
    type: "",
    description: "",
    cost: 0,
    mileage: 0,
    shopName: "",
    shopAddress: "",
    parts: "",
    notes: ""
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (maintenance) {
      setFormData({
        carId: maintenance.carId,
        date: maintenance.date,
        type: maintenance.type,
        description: maintenance.description,
        cost: maintenance.cost,
        mileage: maintenance.mileage,
        shopName: maintenance.shopName,
        shopAddress: maintenance.shopAddress || "",
        parts: maintenance.parts || "",
        notes: maintenance.notes || ""
      });
    }
  }, [maintenance]);

  const handleChange = (field: keyof MaintenanceFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.date) newErrors.date = "날짜를 입력하세요";
    if (!formData.type) newErrors.type = "정비 유형을 선택하세요";
    if (!formData.description.trim()) newErrors.description = "정비 내용을 입력하세요";
    if (formData.cost <= 0) newErrors.cost = "비용을 입력하세요";
    if (formData.mileage < 0) newErrors.mileage = "주행거리는 0 이상이어야 합니다";
    if (!formData.shopName.trim()) newErrors.shopName = "정비소명을 입력하세요";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !maintenance) return;

    setLoading(true);
    try {
      await onUpdateMaintenance({
        ...maintenance,
        ...formData
      });
      onClose();
    } catch (error) {
      console.error("Failed to update maintenance:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !maintenance) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl bg-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">정비 기록 수정</CardTitle>
                <CardDescription>
                  {carName}의 정비 기록을 수정하세요
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">정비 정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold text-gray-700">
                    정비 날짜 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange("date", e.target.value)}
                    className={`h-11 ${errors.date ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-semibold text-gray-700">
                    정비 유형 <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className={`w-full h-11 px-3 border rounded-md bg-white ${
                      errors.type ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <option value="">정비 유형 선택</option>
                    {MAINTENANCE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.type && <p className="text-red-500 text-xs">{errors.type}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                  정비 내용 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="예: 엔진오일 교환, 에어필터 교체"
                  className={`h-11 ${errors.description ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost" className="text-sm font-semibold text-gray-700">
                    정비 비용 (원) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    value={formData.cost}
                    onChange={(e) => handleChange("cost", parseInt(e.target.value) || 0)}
                    placeholder="예: 120000"
                    min="0"
                    className={`h-11 ${errors.cost ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.cost && <p className="text-red-500 text-xs">{errors.cost}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-sm font-semibold text-gray-700">
                    정비 시 주행거리 (km)
                  </Label>
                  <Input
                    id="mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleChange("mileage", parseInt(e.target.value) || 0)}
                    placeholder="예: 35000"
                    min="0"
                    className={`h-11 ${errors.mileage ? "border-red-500" : "border-gray-200"}`}
                  />
                  {errors.mileage && <p className="text-red-500 text-xs">{errors.mileage}</p>}
                </div>
              </div>
            </div>

            {/* Shop Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">정비소 정보</h3>
              
              <div className="space-y-2">
                <Label htmlFor="shopName" className="text-sm font-semibold text-gray-700">
                  정비소명 <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  <select
                    value={formData.shopName}
                    onChange={(e) => handleChange("shopName", e.target.value)}
                    className={`w-full h-11 px-3 border rounded-md bg-white ${
                      errors.shopName ? "border-red-500" : "border-gray-200"
                    }`}
                  >
                    <option value="">정비소 선택 또는 직접 입력</option>
                    {COMMON_SHOPS.map(shop => (
                      <option key={shop} value={shop}>{shop}</option>
                    ))}
                    <option value="직접입력">직접 입력하기</option>
                  </select>
                  {(formData.shopName === "직접입력" || !COMMON_SHOPS.includes(formData.shopName)) && (
                    <Input
                      placeholder="정비소명을 입력하세요"
                      value={formData.shopName === "직접입력" ? "" : formData.shopName}
                      onChange={(e) => handleChange("shopName", e.target.value)}
                      className={`h-11 ${errors.shopName ? "border-red-500" : "border-gray-200"}`}
                    />
                  )}
                </div>
                {errors.shopName && <p className="text-red-500 text-xs">{errors.shopName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopAddress" className="text-sm font-semibold text-gray-700">
                  정비소 주소 (선택사항)
                </Label>
                <Input
                  id="shopAddress"
                  value={formData.shopAddress}
                  onChange={(e) => handleChange("shopAddress", e.target.value)}
                  placeholder="예: 서울시 강남구 테헤란로 123"
                  className="h-11 border-gray-200"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">추가 정보</h3>
              
              <div className="space-y-2">
                <Label htmlFor="parts" className="text-sm font-semibold text-gray-700">
                  교체 부품 (선택사항)
                </Label>
                <Input
                  id="parts"
                  value={formData.parts}
                  onChange={(e) => handleChange("parts", e.target.value)}
                  placeholder="예: 엔진오일, 에어필터"
                  className="h-11 border-gray-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                  추가 메모 (선택사항)
                </Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="정비와 관련된 추가 메모를 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    저장 중...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    저장
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