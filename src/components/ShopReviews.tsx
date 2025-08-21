'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Star,
  User,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  booking: {
    id: string;
    bookingDate: string;
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
    };
  };
}

interface ShopReviewsProps {
  shopId: string;
  shopName: string;
  averageRating: number;
  totalReviews: number;
}

export default function ShopReviews({ 
  shopId, 
  shopName, 
  averageRating, 
  totalReviews 
}: ShopReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 리뷰 목록 조회
  const fetchReviews = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reviews?shopId=${shopId}&page=${page}&limit=5`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '리뷰를 불러오는데 실패했습니다.');
      }

      setReviews(data.data);
      setCurrentPage(data.pagination.current);
      setTotalPages(data.pagination.pages);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [shopId]);

  // 별점 렌더링
  const renderStars = (rating: number, size = 'small') => {
    const starSize = size === 'large' ? 'h-5 w-5' : 'h-4 w-4';
    
    return [1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`${starSize} ${
          star <= rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  // 평점 분포 계산
  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // 1성~5성
    
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });

    return distribution.reverse(); // 5성부터 표시
  };

  const ratingDistribution = getRatingDistribution();

  if (loading && reviews.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 평점 요약 */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>고객 리뷰</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 전체 평점 */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating), 'large')}
              </div>
              <p className="text-gray-600">
                총 {totalReviews}개의 리뷰
              </p>
            </div>

            {/* 평점 분포 */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating, index) => {
                const count = ratingDistribution[index];
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-2 text-sm">
                    <span className="w-3">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 리뷰 목록 */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>최근 리뷰</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          )}

          {!error && reviews.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                아직 리뷰가 없습니다
              </h3>
              <p className="text-gray-500">
                첫 번째 리뷰를 남겨보세요!
              </p>
            </div>
          )}

          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                {/* 리뷰 헤더 */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={review.user.image} alt={review.user.name} />
                      <AvatarFallback>
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-gray-900">
                        {review.user.name}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 서비스 정보 */}
                  <div className="text-right text-xs text-gray-500">
                    <div>{review.booking.service.name}</div>
                    <div>{review.booking.car.brand} {review.booking.car.model}</div>
                  </div>
                </div>

                {/* 리뷰 내용 */}
                {review.comment && (
                  <div className="ml-13 bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => fetchReviews(currentPage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => fetchReviews(currentPage + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}