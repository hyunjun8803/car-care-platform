// 차량 검색 API 테스트 스크립트
// 사용법: node test-vehicle-search.js

async function testVehicleSearch() {
  const baseUrl = 'http://localhost:3001'; // 로컬 개발 서버
  
  console.log('🚗 차량번호 검색 API 테스트 시작\n');

  // 테스트 케이스들
  const testCases = [
    {
      name: '기본 차량번호 (12가3456)',
      data: {
        licensePlate: '12가3456'
      }
    },
    {
      name: '다른 차량번호 (34나5678)',
      data: {
        licensePlate: '34나5678'
      }
    },
    {
      name: '공백이 있는 차량번호 (56 다 7890)',
      data: {
        licensePlate: '56 다 7890'
      }
    },
    {
      name: '임의의 차량번호 (78라9012)',
      data: {
        licensePlate: '78라9012'
      }
    },
    {
      name: '잘못된 형식 (가나다123)',
      data: {
        licensePlate: '가나다123'
      }
    },
    {
      name: '빈 값',
      data: {
        licensePlate: ''
      }
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 테스트 ${i + 1}: ${testCase.name}`);
    console.log('요청 데이터:', JSON.stringify(testCase.data, null, 2));
    
    try {
      const response = await fetch(`${baseUrl}/api/vehicles/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 실제 테스트시에는 인증 토큰이 필요합니다
          // 'Authorization': 'Bearer your-token-here'
        },
        body: JSON.stringify(testCase.data)
      });

      console.log(`응답 상태: ${response.status} ${response.statusText}`);
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ 성공!');
        console.log('응답 데이터:', {
          success: result.success,
          licensePlate: result.data?.licensePlate,
          brand: result.data?.brand,
          model: result.data?.model,
          year: result.data?.year,
          fuelType: result.data?.fuelType
        });
        
        // 상세 정보 출력
        if (result.data) {
          const vehicle = result.data;
          console.log('차량 상세 정보:');
          console.log(`  - 차량명: ${vehicle.name}`);
          console.log(`  - 제조사: ${vehicle.brand}`);
          console.log(`  - 모델: ${vehicle.model}`);
          console.log(`  - 연식: ${vehicle.year}년`);
          console.log(`  - 색상: ${vehicle.color}`);
          console.log(`  - 연료: ${vehicle.fuelType}`);
          console.log(`  - 배기량: ${vehicle.engineSize}`);
          console.log(`  - 차량 종류: ${vehicle.carType}`);
        }
      } else {
        console.log('❌ 실패!');
        console.log('오류 응답:', result);
      }
      
    } catch (error) {
      console.log('❌ 네트워크 오류!');
      console.error('오류:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
  }

  // GET 요청 테스트 (405 오류 확인)
  console.log('\n📋 추가 테스트: GET 요청 (Method Not Allowed 확인)');
  try {
    const response = await fetch(`${baseUrl}/api/vehicles/search`, {
      method: 'GET'
    });
    
    console.log(`응답 상태: ${response.status} ${response.statusText}`);
    const result = await response.json();
    
    if (response.status === 405) {
      console.log('✅ 정상적으로 405 오류 반환');
      console.log('응답:', result);
    } else {
      console.log('❌ 예상과 다른 응답');
      console.log('응답:', result);
    }
  } catch (error) {
    console.log('❌ 네트워크 오류!');
    console.error('오류:', error.message);
  }

  console.log('\n🏁 차량 검색 API 테스트 완료');
}

// 테스트 실행
testVehicleSearch().catch(console.error);