'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Star,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
  Car,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Wrench
} from 'lucide-react';

interface Booking {
  id: string;
  bookingDate: string;
  bookingTime: string;
  finalCost?: number;
  estimatedCost?: number;
  shop: {
    id: string;
    businessName: string;
    address: string;
    phone: string;
  };
  service: {
    name: string;
    category: {
      name: string;
    };
  };
  car: {
    name: string;
    brand: string;
    model: string;
    licensePlate: string;
  };
}

interface ExistingReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function ReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // 리뷰 폼 상태
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  // 인증 확인
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // 예약 정보 및 기존 리뷰 조회
  const fetchBookingAndReview = async () => {
    try {
      setLoading(true);
      setError(null);

      // 예약 정보 조회
      const bookingResponse = await fetch(`/api/bookings/${params.id}`);
      const bookingData = await bookingResponse.json();

      if (!bookingResponse.ok) {
        throw new Error(bookingData.error || '예약 정보를 불러오는데 실패했습니다.');
      }

      if (bookingData.data.status !== 'COMPLETED') {
        throw new Error('완료된 예약만 리뷰를 작성할 수 있습니다.');
      }

      setBooking(bookingData.data);

      // 기존 리뷰 확인
      const reviewsResponse = await fetch(`/api/bookings/${params.id}/review`);
      if (reviewsResponse.ok) {
        const reviewData = await reviewsResponse.json();
        if (reviewData.data) {
          setExistingReview(reviewData.data);
          setRating(reviewData.data.rating);
          setComment(reviewData.data.comment);
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchBookingAndReview();
    }
  }, [status, params.id]);

  // 리뷰 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('평점을 선택해 주세요.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const url = existingReview 
        ? `/api/reviews/${existingReview.id}` 
        : '/api/reviews';
      
      const method = existingReview ? 'PUT' : 'POST';
      
      const body = existingReview 
        ? { rating, comment }
        : { bookingId: params.id, rating, comment };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '리뷰 저장에 실패했습니다.');
      }

      setSuccess(true);
      
      // 3초 후 예약 목록으로 이동
      setTimeout(() => {
        router.push('/bookings');
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : '리뷰 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 별점 렌더링
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        className={`p-1 transition-colors ${
          star <= (hoverRating || rating) 
            ? 'text-yellow-400' 
            : 'text-gray-300 hover:text-yellow-200'
        }`}
        onMouseEnter={() => setHoverRating(star)}
        onMouseLeave={() => setHoverRating(0)}
        onClick={() => setRating(star)}
      >
        <Star className="h-8 w-8 fill-current" />
      </button>
    ));
  };

  // 로딩 상태
  if (status === 'loading' || loading) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8">
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm w-full max-w-md">
          <CardContent className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {existingReview ? '리뷰가 수정되었습니다!' : '리뷰가 등록되었습니다!'}
            </h3>
            <p className="text-gray-600 mb-6">
              소중한 의견을 남겨주셔서 감사합니다.
            </p>
            <Button 
              onClick={() => router.push('/bookings')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              예약 목록으로 이동
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600">
            {error || '예약 정보를 찾을 수 없습니다.'}
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
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {existingReview ? '리뷰 수정' : '리뷰 작성'}
              </h1>
              <p className="text-gray-600">
                서비스 이용 후기를 남겨주세요
              </p>
            </div>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-600">{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 예약 정보 */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>예약 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">정비소</Label>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-medium">{booking.shop.businessName}</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">{booking.shop.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">서비스</Label>
                    <div className="flex items-center mt-1">
                      <Wrench className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{booking.service.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">{booking.service.category.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">차량</Label>
                    <div className="flex items-center mt-1">
                      <Car className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{booking.car.name} ({booking.car.licensePlate})</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      {booking.car.brand} {booking.car.model}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">이용일시</Label>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{new Date(booking.bookingDate).toLocaleDateString('ko-KR')}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{booking.bookingTime}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-gray-500">최종 비용</Label>
                  <div className="flex items-center mt-1">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-lg font-medium text-green-600">
                      {(booking.finalCost || booking.estimatedCost || 0).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 리뷰 작성 폼 */}
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span>{existingReview ? '리뷰 수정' : '리뷰 작성'}</span>
                </CardTitle>
                <CardDescription>
                  서비스에 대한 솔직한 평가를 남겨주세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 별점 */}
                  <div>
                    <Label className="text-base font-medium">평점 *</Label>
                    <div className="flex items-center mt-2">
                      {renderStars()}
                      <span className="ml-3 text-sm text-gray-600">
                        {rating > 0 && (
                          <>
                            {rating}점
                            {rating === 5 && ' (최고예요!)'}
                            {rating === 4 && ' (좋아요!)'}
                            {rating === 3 && ' (보통이에요)'}
                            {rating === 2 && ' (아쉬워요)'}
                            {rating === 1 && ' (별로예요)'}
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* 댓글 */}
                  <div>
                    <Label htmlFor="comment" className="text-base font-medium">
                      후기 작성
                    </Label>
                    <Textarea
                      id="comment"
                      placeholder="서비스 이용 경험을 자세히 알려주세요. 다른 고객들에게 도움이 될 수 있습니다."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={6}
                      className="mt-2 resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {comment.length}/500자
                    </p>
                  </div>

                  {/* 제출 버튼 */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || rating === 0}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                    >
                      {submitting ? (
                        <>처리 중...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          {existingReview ? '리뷰 수정' : '리뷰 등록'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 안내사항 */}
          <div>
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-8">
              <CardContent className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">리뷰 작성 안내</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    완료된 예약에 대해서만 리뷰를 작성할 수 있습니다.
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    작성 후 7일 이내에 수정 및 삭제가 가능합니다.
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    솔직하고 건설적인 리뷰를 작성해 주세요.
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    다른 고객들의 선택에 도움이 됩니다.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}