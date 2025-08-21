'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Car,
  Wrench,
  BookOpen,
  DollarSign,
  Settings,
  Bell,
  Shield,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Lock
} from 'lucide-react';

interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    preferences: {
      emailNotifications: boolean;
      smsNotifications: boolean;
      maintenanceReminders: boolean;
      marketingEmails: boolean;
    };
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    totalCars: number;
    totalMaintenanceRecords: number;
    totalMaintenanceCost: number;
    totalBookings: number;
    memberSince: string;
    firstCarRegistered?: string;
    lastActivity?: string;
  };
}

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    maintenanceReminders: boolean;
    marketingEmails: boolean;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    preferences: {
      emailNotifications: true,
      smsNotifications: true,
      maintenanceReminders: true,
      marketingEmails: false
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 프로필 데이터 조회
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/profile');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '프로필 정보를 불러오는데 실패했습니다.');
      }

      setProfile(data.data);
      setFormData({
        name: data.data.user.name || '',
        email: data.data.user.email || '',
        phone: data.data.user.phone || '',
        address: data.data.user.address || '',
        preferences: data.data.user.preferences
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 조회 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  // 폼 입력 핸들러
  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 환경설정 변경 핸들러
  const handlePreferenceChange = (field: keyof ProfileFormData['preferences'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value
      }
    }));
  };

  // 프로필 업데이트
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 기본 유효성 검사
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }

    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          address: formData.address.trim() || undefined,
          preferences: formData.preferences
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '프로필 업데이트에 실패했습니다.');
      }

      setSuccess(true);
      
      // 프로필 데이터 새로고침
      await fetchProfile();

      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : '프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 비용 포맷 함수
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 이니셜 생성
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  // 로딩 상태
  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  프로필 관리
                </h1>
                <p className="text-gray-600">
                  계정 정보 및 환경설정을 관리하세요
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 성공 메시지 */}
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              프로필이 성공적으로 업데이트되었습니다.
            </AlertDescription>
          </Alert>
        )}

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 프로필 정보 및 통계 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 프로필 카드 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      {profile?.user.name ? getInitials(profile.user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl text-gray-900">
                  {profile?.user.name || '사용자'}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {profile?.user.email}
                </CardDescription>
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-500 mt-2">
                  <Calendar className="h-4 w-4" />
                  <span>가입일: {profile?.stats.memberSince ? formatDate(profile.stats.memberSince) : '-'}</span>
                </div>
              </CardHeader>
            </Card>

            {/* 통계 카드 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>활동 통계</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                    <Car className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{profile?.stats.totalCars || 0}</p>
                    <p className="text-sm text-gray-600">등록 차량</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <Wrench className="h-6 w-6 text-green-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{profile?.stats.totalMaintenanceRecords || 0}</p>
                    <p className="text-sm text-gray-600">정비 기록</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{profile?.stats.totalBookings || 0}</p>
                    <p className="text-sm text-gray-600">총 예약</p>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">₩{formatCurrency(profile?.stats.totalMaintenanceCost || 0)}</p>
                    <p className="text-sm text-gray-600">총 정비비</p>
                  </div>
                </div>
                
                {profile?.stats.firstCarRegistered && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-600 text-center">
                      첫 차량 등록: {formatDate(profile.stats.firstCarRegistered)}
                    </p>
                  </div>
                )}
                
                {profile?.stats.lastActivity && (
                  <div className="pb-2">
                    <p className="text-sm text-gray-600 text-center">
                      최근 활동: {formatDate(profile.stats.lastActivity)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 프로필 편집 폼 */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span>프로필 편집</span>
                </CardTitle>
                <CardDescription>
                  개인 정보 및 환경설정을 수정할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 기본 정보 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <span>기본 정보</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-base font-medium">
                          이름 *
                        </Label>
                        <div className="relative mt-2">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="이름을 입력하세요"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-base font-medium">
                          이메일 *
                        </Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="이메일을 입력하세요"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-base font-medium">
                          전화번호
                        </Label>
                        <div className="relative mt-2">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="전화번호를 입력하세요"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor="address" className="text-base font-medium">
                        주소
                      </Label>
                      <div className="relative mt-2">
                        <MapPin className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                        <Textarea
                          id="address"
                          placeholder="주소를 입력하세요"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="pl-10"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* 알림 설정 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <span>알림 설정</span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="emailNotifications" className="text-base font-medium cursor-pointer">
                            이메일 알림
                          </Label>
                          <p className="text-sm text-gray-600">중요한 알림을 이메일로 받습니다</p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={formData.preferences.emailNotifications}
                          onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="smsNotifications" className="text-base font-medium cursor-pointer">
                            SMS 알림
                          </Label>
                          <p className="text-sm text-gray-600">예약 확인 및 긴급 알림을 SMS로 받습니다</p>
                        </div>
                        <Switch
                          id="smsNotifications"
                          checked={formData.preferences.smsNotifications}
                          onCheckedChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="maintenanceReminders" className="text-base font-medium cursor-pointer">
                            정비 알림
                          </Label>
                          <p className="text-sm text-gray-600">정기 정비 시기 알림을 받습니다</p>
                        </div>
                        <Switch
                          id="maintenanceReminders"
                          checked={formData.preferences.maintenanceReminders}
                          onCheckedChange={(checked) => handlePreferenceChange('maintenanceReminders', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <Label htmlFor="marketingEmails" className="text-base font-medium cursor-pointer">
                            마케팅 이메일
                          </Label>
                          <p className="text-sm text-gray-600">프로모션 및 이벤트 정보를 받습니다</p>
                        </div>
                        <Switch
                          id="marketingEmails"
                          checked={formData.preferences.marketingEmails}
                          onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 저장 버튼 */}
                  <div className="flex justify-end pt-6">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      {saving ? (
                        <>저장 중...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          프로필 저장
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}