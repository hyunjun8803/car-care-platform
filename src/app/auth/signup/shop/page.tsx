"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddressSearch } from "@/components/ui/address-search";
import { 
  Car, 
  Upload, 
  FileText, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Building2,
  Phone,
  MapPin,
  User,
  Mail,
  Lock
} from "lucide-react";

interface FormData {
  // 기본 정보
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  
  // 정비소 정보
  shopName: string;
  businessNumber: string;
  address: string;
  detailAddress: string;
  description: string;
  
  // 사업자등록증
  businessLicense: File | null;
}

export default function ShopSignUpPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    shopName: "",
    businessNumber: "",
    address: "",
    detailAddress: "",
    description: "",
    businessLicense: null
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (file: File) => {
    // 파일 타입 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setError("JPG, PNG, PDF 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setFormData(prev => ({
      ...prev,
      businessLicense: file
    }));
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleAddressChange = (address: string, detailAddress?: string) => {
    setFormData(prev => ({
      ...prev,
      address,
      detailAddress: detailAddress || ""
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("기본 정보를 모두 입력해주세요.");
      return false;
    }

    if (!formData.shopName || !formData.businessNumber || !formData.address) {
      setError("정비소 정보를 모두 입력해주세요.");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }

    if (formData.password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return false;
    }

    if (!formData.businessLicense) {
      setError("사업자등록증을 업로드해주세요.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      console.log('정비소 회원가입 시작:', formData.email, formData.shopName);
      
      // 파일 업로드를 위한 FormData 생성
      const submitData = new FormData();
      
      // 기본 정보
      submitData.append('name', formData.name);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('phone', formData.phone);
      submitData.append('userType', 'SHOP_OWNER');
      
      // 정비소 정보
      submitData.append('shopName', formData.shopName);
      submitData.append('businessNumber', formData.businessNumber);
      const fullAddress = formData.detailAddress 
        ? `${formData.address} ${formData.detailAddress}`
        : formData.address;
      submitData.append('address', fullAddress);
      submitData.append('description', formData.description);
      
      // 사업자등록증 파일
      if (formData.businessLicense) {
        submitData.append('businessLicense', formData.businessLicense);
        console.log('사업자등록증 파일 첨부됨:', formData.businessLicense.name);
      }

      console.log('API 호출 시작: /api/auth/register/shop');
      const response = await fetch("/api/auth/register/shop", {
        method: "POST",
        body: submitData
      });

      console.log('API 응답 상태:', response.status, response.statusText);
      const data = await response.json();
      console.log('API 응답 데이터:', data);

      if (!response.ok) {
        throw new Error(data.error || "회원가입에 실패했습니다.");
      }

      // 회원가입 성공
      alert("정비소 회원가입이 완료되었습니다! 승인 후 이용 가능합니다.");
      router.push("/auth/signin");

    } catch (error) {
      console.error("회원가입 오류:", error);
      setError(error instanceof Error ? error.message : "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const isBasicComplete = formData.name && formData.email && formData.password && formData.confirmPassword && formData.phone;
  const isShopComplete = formData.shopName && formData.businessNumber && formData.address;
  const isLicenseComplete = !!formData.businessLicense;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            정비소 회원가입
          </h1>
          <p className="text-gray-600 mt-2">
            CarCare와 함께 정비소를 운영해보세요
          </p>
          
          <div className="flex items-center justify-center mt-4">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href="/auth/signup">
                <ArrowLeft className="h-4 w-4 mr-2" />
                고객 회원가입으로
              </Link>
            </Button>
          </div>
        </div>

        {/* 에러 표시 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* 회원가입 폼 */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>정비소 정보 등록</CardTitle>
            <CardDescription>
              단계별로 정보를 입력해주세요
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  기본정보
                  {isBasicComplete && <CheckCircle className="h-4 w-4 ml-2 text-green-600" />}
                </TabsTrigger>
                <TabsTrigger value="shop" className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  정비소정보
                  {isShopComplete && <CheckCircle className="h-4 w-4 ml-2 text-green-600" />}
                </TabsTrigger>
                <TabsTrigger value="license" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  사업자등록증
                  {isLicenseComplete && <CheckCircle className="h-4 w-4 ml-2 text-green-600" />}
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="mt-6">
                {/* 기본 정보 탭 */}
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">이름 *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="담당자 이름"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">연락처 *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="010-1234-5678"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">이메일 *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">비밀번호 *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="최소 6자 이상"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="비밀번호를 다시 입력"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      type="button"
                      onClick={() => setActiveTab("shop")}
                      disabled={!isBasicComplete}
                    >
                      다음 단계
                    </Button>
                  </div>
                </TabsContent>

                {/* 정비소 정보 탭 */}
                <TabsContent value="shop" className="space-y-4">
                  <div>
                    <Label htmlFor="shopName">정비소 이름 *</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="shopName"
                        name="shopName"
                        type="text"
                        value={formData.shopName}
                        onChange={handleInputChange}
                        placeholder="예: 서울정비소"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="businessNumber">사업자등록번호 *</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="businessNumber"
                        name="businessNumber"
                        type="text"
                        value={formData.businessNumber}
                        onChange={handleInputChange}
                        placeholder="000-00-00000"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <AddressSearch
                      value={formData.address}
                      onChange={handleAddressChange}
                      placeholder="정비소 주소를 검색해주세요"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">정비소 소개</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="정비소 소개 및 특징을 입력해주세요 (선택사항)"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                    >
                      이전 단계
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("license")}
                      disabled={!isShopComplete}
                    >
                      다음 단계
                    </Button>
                  </div>
                </TabsContent>

                {/* 사업자등록증 탭 */}
                <TabsContent value="license" className="space-y-4">
                  <div>
                    <Label>사업자등록증 첨부 *</Label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : formData.businessLicense 
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      {formData.businessLicense ? (
                        <div className="space-y-2">
                          <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                          <div>
                            <p className="font-medium text-green-700">업로드 완료</p>
                            <p className="text-sm text-green-600">{formData.businessLicense.name}</p>
                            <p className="text-xs text-gray-500">
                              {(formData.businessLicense.size / 1024 / 1024).toFixed(2)}MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData(prev => ({ ...prev, businessLicense: null }))}
                          >
                            파일 변경
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="font-medium">사업자등록증을 업로드하세요</p>
                            <p className="text-sm text-gray-500">
                              파일을 드래그하거나 클릭하여 선택
                            </p>
                            <p className="text-xs text-gray-400">
                              JPG, PNG, PDF (최대 5MB)
                            </p>
                          </div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="license-upload"
                          />
                          <label htmlFor="license-upload" className="cursor-pointer">
                            <div className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                              파일 선택
                            </div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      업로드된 사업자등록증은 관리자 승인 후 정비소 계정이 활성화됩니다.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("shop")}
                    >
                      이전 단계
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading || !isBasicComplete || !isShopComplete || !isLicenseComplete}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? "가입 중..." : "회원가입 완료"}
                    </Button>
                  </div>
                </TabsContent>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        {/* 하단 링크 */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:underline font-medium">
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}