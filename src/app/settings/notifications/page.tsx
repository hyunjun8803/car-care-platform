'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Settings,
  Mail,
  MessageSquare,
  Bell,
  Clock,
  CheckCircle,
  Save,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

interface NotificationSettings {
  emailNotifications: {
    bookingConfirmed: boolean;
    bookingCancelled: boolean;
    bookingCompleted: boolean;
    bookingReminder: boolean;
  };
  smsNotifications: {
    bookingConfirmed: boolean;
    bookingCancelled: boolean;
    bookingCompleted: boolean;
    bookingReminder: boolean;
  };
  reminderTiming: number;
}

export default function NotificationSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 알림 설정 조회
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/notification-settings');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '설정을 불러오는데 실패했습니다.');
      }

      setSettings(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  // 설정 저장
  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const response = await fetch('/api/user/notification-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '설정 저장에 실패했습니다.');
      }

      setSuccessMessage('알림 설정이 성공적으로 저장되었습니다.');
      
      // 성공 메시지 3초 후 자동 제거
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '설정 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 설정 업데이트 함수들
  const updateEmailSetting = (key: string, value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        [key]: value
      }
    });
  };

  const updateSmsSetting = (key: string, value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      smsNotifications: {
        ...settings.smsNotifications,
        [key]: value
      }
    });
  };

  const updateReminderTiming = (value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      reminderTiming: parseInt(value)
    });
  };

  // 로딩 상태
  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            {error || '설정을 불러올 수 없습니다.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
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
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  알림 설정
                </h1>
                <p className="text-gray-600 mt-1">
                  예약 관련 알림을 설정하세요
                </p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? '저장 중...' : '설정 저장'}
          </Button>
        </div>

        {/* 성공/오류 메시지 */}
        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 이메일 알림 설정 */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <span>이메일 알림</span>
              </CardTitle>
              <CardDescription>
                이메일로 받을 알림을 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">예약 확정</Label>
                  <p className="text-sm text-gray-500">정비소에서 예약을 승인했을 때</p>
                </div>
                <Switch
                  checked={settings.emailNotifications.bookingConfirmed}
                  onCheckedChange={(checked) => updateEmailSetting('bookingConfirmed', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">예약 취소</Label>
                  <p className="text-sm text-gray-500">예약이 취소되었을 때</p>
                </div>
                <Switch
                  checked={settings.emailNotifications.bookingCancelled}
                  onCheckedChange={(checked) => updateEmailSetting('bookingCancelled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">서비스 완료</Label>
                  <p className="text-sm text-gray-500">정비 서비스가 완료되었을 때</p>
                </div>
                <Switch
                  checked={settings.emailNotifications.bookingCompleted}
                  onCheckedChange={(checked) => updateEmailSetting('bookingCompleted', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">예약 리마인더</Label>
                  <p className="text-sm text-gray-500">예약 일정을 미리 알려줍니다</p>
                </div>
                <Switch
                  checked={settings.emailNotifications.bookingReminder}
                  onCheckedChange={(checked) => updateEmailSetting('bookingReminder', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* SMS 알림 설정 */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span>SMS 알림</span>
              </CardTitle>
              <CardDescription>
                문자 메시지로 받을 알림을 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">예약 확정</Label>
                  <p className="text-sm text-gray-500">정비소에서 예약을 승인했을 때</p>
                </div>
                <Switch
                  checked={settings.smsNotifications.bookingConfirmed}
                  onCheckedChange={(checked) => updateSmsSetting('bookingConfirmed', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">예약 취소</Label>
                  <p className="text-sm text-gray-500">예약이 취소되었을 때</p>
                </div>
                <Switch
                  checked={settings.smsNotifications.bookingCancelled}
                  onCheckedChange={(checked) => updateSmsSetting('bookingCancelled', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">서비스 완료</Label>
                  <p className="text-sm text-gray-500">정비 서비스가 완료되었을 때</p>
                </div>
                <Switch
                  checked={settings.smsNotifications.bookingCompleted}
                  onCheckedChange={(checked) => updateSmsSetting('bookingCompleted', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">예약 리마인더</Label>
                  <p className="text-sm text-gray-500">예약 일정을 미리 알려줍니다</p>
                </div>
                <Switch
                  checked={settings.smsNotifications.bookingReminder}
                  onCheckedChange={(checked) => updateSmsSetting('bookingReminder', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 리마인더 시간 설정 */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <span>리마인더 시간</span>
            </CardTitle>
            <CardDescription>
              예약 전 얼마나 미리 알림을 받을지 설정하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Label className="whitespace-nowrap">알림 시점:</Label>
              <Select value={settings.reminderTiming.toString()} onValueChange={updateReminderTiming}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1시간 전</SelectItem>
                  <SelectItem value="6">6시간 전</SelectItem>
                  <SelectItem value="12">12시간 전</SelectItem>
                  <SelectItem value="24">24시간 전 (1일 전)</SelectItem>
                  <SelectItem value="48">48시간 전 (2일 전)</SelectItem>
                  <SelectItem value="72">72시간 전 (3일 전)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 정보 카드 */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Settings className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h3 className="font-medium text-gray-900 mb-2">알림 설정 안내</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 이메일 알림은 기본적으로 모두 활성화되어 있습니다.</li>
                  <li>• SMS 알림은 중요한 알림만 기본적으로 활성화되어 있습니다.</li>
                  <li>• 리마인더는 예약 전 설정한 시간에 자동으로 전송됩니다.</li>
                  <li>• 설정은 언제든지 변경할 수 있습니다.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}