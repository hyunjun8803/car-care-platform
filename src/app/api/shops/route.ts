import { NextRequest, NextResponse } from 'next/server';
import { supabaseUserStorage } from '@/lib/supabase-storage';
import { userStorage } from '@/lib/storage';
import { fileUserStorage } from '@/lib/file-storage';

// 승인된 정비소 목록 조회 함수
async function getApprovedShops() {
  let allShops: any[] = [];
  
  // Supabase에서 승인된 정비소 조회
  try {
    const supabaseUsers = await supabaseUserStorage.getAll();
    const supabaseShops = supabaseUsers.filter(user => 
      user.userType === 'SHOP_OWNER' && 
      user.shopInfo?.status === 'APPROVED'
    );
    allShops.push(...supabaseShops);
    console.log('Supabase approved shops:', supabaseShops.length);
  } catch (error) {
    console.log('Supabase query failed:', error);
  }
  
  // 파일 저장소에서 승인된 정비소 조회 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    try {
      const fileUsers = await fileUserStorage.getAll();
      const fileShops = fileUsers.filter(user => 
        user.userType === 'SHOP_OWNER' && 
        user.shopInfo?.status === 'APPROVED'
      );
      allShops.push(...fileShops);
      console.log('File approved shops:', fileShops.length);
    } catch (error) {
      console.log('File storage query failed:', error);
    }
  }

  // 메모리 저장소에서 승인된 정비소 조회
  try {
    const memoryUsers = await userStorage.getAll();
    const memoryShops = memoryUsers.filter(user => 
      user.userType === 'SHOP_OWNER' && 
      user.shopInfo?.status === 'APPROVED'
    );
    allShops.push(...memoryShops);
    console.log('Memory approved shops:', memoryShops.length);
  } catch (error) {
    console.log('Memory storage query failed:', error);
  }

  // 중복 제거 (이메일 기준)
  const uniqueShops = allShops.filter((shop, index, self) =>
    index === self.findIndex(s => s.email === shop.email)
  );

  console.log('Total unique approved shops:', uniqueShops.length);
  return uniqueShops;
}

// GET /api/shops - 승인된 정비소 목록 조회 (위치 기반 정렬)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'distance'; // distance, rating, name
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');

    // 승인된 정비소 조회
    const approvedShops = await getApprovedShops();

    // 검색어 필터링
    let filteredShops = approvedShops;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredShops = approvedShops.filter(shop =>
        shop.shopInfo?.shopName.toLowerCase().includes(searchLower) ||
        shop.shopInfo?.address.toLowerCase().includes(searchLower) ||
        shop.name.toLowerCase().includes(searchLower)
      );
    }

    // 거리 계산 함수 (Haversine formula)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // 지구 반지름 (km)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // 기본 서울 좌표 (위치 정보가 없는 경우 사용)
    const defaultLocations = [
      { name: '강남구', lat: 37.5173, lng: 127.0473 },
      { name: '서초구', lat: 37.4837, lng: 127.0324 },
      { name: '송파구', lat: 37.5145, lng: 127.1059 },
      { name: '영등포구', lat: 37.5264, lng: 126.8963 },
      { name: '마포구', lat: 37.5663, lng: 126.9014 }
    ];

    // API 응답에 맞게 데이터 변환
    const transformedShops = filteredShops.map((shop, index) => {
      let distance = null;
      let shopLat = null;
      let shopLng = null;

      // 정비소 위치 설정 (기본값 사용)
      if (index < defaultLocations.length) {
        shopLat = defaultLocations[index].lat;
        shopLng = defaultLocations[index].lng;
      } else {
        // 랜덤 서울 지역 좌표 생성
        shopLat = 37.5 + (Math.random() - 0.5) * 0.2;
        shopLng = 127.0 + (Math.random() - 0.5) * 0.2;
      }
      
      // 사용자 위치가 제공된 경우 거리 계산
      if (latitude && longitude && shopLat && shopLng) {
        distance = calculateDistance(
          parseFloat(latitude), 
          parseFloat(longitude), 
          shopLat, 
          shopLng
        );
      }

      return {
        id: shop.id,
        businessName: shop.shopInfo?.shopName || '정비소명 없음',
        address: shop.shopInfo?.address || '주소 없음',
        latitude: shopLat,
        longitude: shopLng,
        phone: shop.phone || '전화번호 없음',
        email: shop.email,
        operatingHours: '09:00 - 18:00',
        rating: 4.5 + Math.random() * 0.5, // 4.5-5.0 사이 랜덤 평점
        totalReviews: Math.floor(Math.random() * 100) + 10,
        distance: distance ? Math.round(distance * 10) / 10 : null,
        serviceCategories: ['정기점검', '수리', '교체'],
        services: [
          {
            id: `service-${shop.id}-1`,
            name: '엔진오일 교환',
            description: '엔진오일 및 오일필터 교체 서비스',
            basePrice: 50000,
            estimatedDuration: 30,
            category: '정기점검'
          },
          {
            id: `service-${shop.id}-2`,
            name: '브레이크 패드 교체',
            description: '안전한 제동을 위한 브레이크 패드 교체',
            basePrice: 120000,
            estimatedDuration: 60,
            category: '교체'
          }
        ],
        totalBookings: Math.floor(Math.random() * 200) + 50,
        createdAt: shop.createdAt,
        isApproved: true
      };
    });

    // 정렬 적용
    switch (sort) {
      case 'distance':
        if (latitude && longitude) {
          transformedShops.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
        }
        break;
      case 'rating':
        transformedShops.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        transformedShops.sort((a, b) => a.businessName.localeCompare(b.businessName));
        break;
      default:
        // 기본은 거리순
        if (latitude && longitude) {
          transformedShops.sort((a, b) => {
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
          });
        }
    }

    return NextResponse.json({
      success: true,
      data: transformedShops,
      meta: {
        total: transformedShops.length,
        hasUserLocation: !!(latitude && longitude),
        searchQuery: search,
        sortBy: sort
      }
    });

  } catch (error) {
    console.error('정비소 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}