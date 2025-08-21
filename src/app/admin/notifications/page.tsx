"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Bell, AlertCircle, CheckCircle, Clock, Send } from 'lucide-react';

interface NotificationResult {
  channel: string;
  success: boolean;
  error?: string;
}

interface TestResult {
  bookingId: string;
  type: string;
  channels: string[];
  results: NotificationResult[];
}

interface BookingData {
  id: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  shop: {
    businessName: string;
  };
  service: {
    name: string;
  };
  car: {
    name: string;
    licensePlate: string;
  };
}

export default function NotificationsTestPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string>('');
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [reminderResult, setReminderResult] = useState<any>(null);

  // 테스트용 폼 상태
  const [selectedBooking, setSelectedBooking] = useState('');
  const [notificationType, setNotificationType] = useState<string>('booking_confirmed');
  const [channels, setChannels] = useState<string[]>(['email']);

  useEffect(() => {
    if (session?.user?.userType === 'ADMIN' || session?.user?.userType === 'SHOP_OWNER') {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error('예약 목록 조회 오류:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!selectedBooking) {
      setError('예약을 선택해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: selectedBooking,
          type: notificationType,
          channels: channels
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.data);
      } else {
        setError(data.error || '알림 전송에 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const sendReminders = async () => {
    setLoading(true);
    setError('');
    setReminderResult(null);

    try {
      const response = await fetch('/api/notifications/reminder', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setReminderResult(data);
      } else {
        setError(data.error || '리마인더 전송에 실패했습니다.');
      }
    } catch (error) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>;
  }

  if (!session || (session.user?.userType !== 'ADMIN' && session.user?.userType !== 'SHOP_OWNER')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            이 페이지는 관리자와 정비소 운영자만 접근할 수 있습니다.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          알림 시스템 테스트
        </h1>
        <p className="text-gray-600">
          이메일과 SMS 알림 시스템의 기능을 테스트하고 관리할 수 있습니다.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="test" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test">알림 테스트</TabsTrigger>
          <TabsTrigger value="reminders">리마인더 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="h-5 w-5" />
                <span>알림 전송 테스트</span>
              </CardTitle>
              <CardDescription>
                특정 예약에 대해 알림을 테스트로 전송해볼 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="booking">예약 선택</Label>
                  <Select value={selectedBooking} onValueChange={setSelectedBooking}>
                    <SelectTrigger>
                      <SelectValue placeholder="예약을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {bookings.map((booking) => (
                        <SelectItem key={booking.id} value={booking.id}>
                          {booking.user.name} - {booking.service.name} ({new Date(booking.bookingDate).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">알림 종류</Label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking_confirmed">예약 확정</SelectItem>
                      <SelectItem value="booking_cancelled">예약 취소</SelectItem>
                      <SelectItem value="booking_reminder">예약 리마인더</SelectItem>
                      <SelectItem value="booking_completed">서비스 완료</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>전송 채널</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={channels.includes('email')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setChannels([...channels, 'email']);
                        } else {
                          setChannels(channels.filter(c => c !== 'email'));
                        }
                      }}
                      className="rounded"
                    />
                    <Mail className="h-4 w-4" />
                    <span>이메일</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={channels.includes('sms')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setChannels([...channels, 'sms']);
                        } else {
                          setChannels(channels.filter(c => c !== 'sms'));
                        }
                      }}
                      className="rounded"
                    />
                    <MessageSquare className="h-4 w-4" />
                    <span>SMS</span>
                  </label>
                </div>
              </div>

              <Button 
                onClick={sendTestNotification} 
                disabled={loading || !selectedBooking || channels.length === 0}
                className="w-full"
              >
                {loading ? '전송 중...' : '테스트 알림 전송'}
              </Button>

              {result && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">전송 결과</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {result.results.map((res, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-2">
                          {res.channel === 'email' ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                          <span className="capitalize">{res.channel}</span>
                        </div>
                        <Badge variant={res.success ? "success" : "destructive"}>
                          {res.success ? '성공' : '실패'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>예약 리마인더 관리</span>
              </CardTitle>
              <CardDescription>
                내일 예정된 예약들에 대해 리마인더를 전송할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600 space-y-2">
                <p>• 매일 오전 9시에 자동으로 다음날 예약 리마인더가 전송됩니다.</p>
                <p>• 수동으로 리마인더를 전송하려면 아래 버튼을 클릭하세요.</p>
              </div>

              <Button 
                onClick={sendReminders} 
                disabled={loading}
                className="w-full"
              >
                {loading ? '전송 중...' : '수동 리마인더 전송'}
              </Button>

              {reminderResult && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-semibold">리마인더 전송 결과</h3>
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {reminderResult.message}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 환경 변수 설정 안내 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>설정 안내</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>이메일 서비스 설정 (Gmail SMTP):</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>SMTP_HOST=smtp.gmail.com</li>
              <li>SMTP_PORT=587</li>
              <li>SMTP_USER=your-gmail@gmail.com</li>
              <li>SMTP_PASS=your-app-password</li>
              <li>EMAIL_FROM=your-gmail@gmail.com</li>
            </ul>

            <p className="pt-4"><strong>SMS 서비스 설정 (Twilio):</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>TWILIO_ACCOUNT_SID=your-account-sid</li>
              <li>TWILIO_AUTH_TOKEN=your-auth-token</li>
              <li>TWILIO_PHONE_NUMBER=your-twilio-phone</li>
            </ul>

            <p className="pt-4"><strong>Cron Job 설정:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>CRON_SECRET_KEY=your-secret-key</li>
              <li>매일 09:00에 실행: 0 9 * * *</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}