// CODEF API 테스트 스크립트
// 사용법: node test-codef-api.js

async function testCodefApi() {
  // const baseUrl = 'http://localhost:3001'; // 로컬 개발 서버
  const baseUrl = 'https://car-care-platform.vercel.app'; // 배포된 서버
  
  console.log('🚗 CODEF 자동차 제원 상세 정보 API 테스트 시작\n');

  // 테스트 케이스들
  const testCases = [
    {
      name: '현대 그랜저 2021년 하이브리드',
      data: {
        makerCode: '현대',
        modelName: '그랜저',
        year: '2021',
        trim: 'HG300 하이브리드',
        fuel: '하이브리드',
        transmission: 'AT'
      }
    },
    {
      name: '기아 쏘나타 2020년 가솔린',
      data: {
        makerCode: '기아',
        modelName: '쏘나타',
        year: '2020',
        fuel: '가솔린',
        transmission: 'AT'
      }
    },
    {
      name: '필수 파라미터만 (최소 요청)',
      data: {
        makerCode: '현대',
        modelName: '아반떼',
        year: '2022'
      }
    },
    {
      name: '잘못된 요청 (필수 파라미터 누락)',
      data: {
        modelName: '그랜저',
        year: '2021'
        // makerCode 누락
      }
    }
  ];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📋 테스트 ${i + 1}: ${testCase.name}`);
    console.log('요청 데이터:', JSON.stringify(testCase.data, null, 2));
    
    try {
      const response = await fetch(`${baseUrl}/api/codef/car-spec-detail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCase.data)
      });

      console.log(`응답 상태: ${response.status} ${response.statusText}`);
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ 성공!');
        console.log('응답 데이터:', {
          result_code: result.result?.code,
          result_message: result.result?.message,
          data_count: result.data?.length || 0,
          transaction_id: result.result?.transactionId
        });
        
        // 첫 번째 데이터만 상세 출력
        if (result.data && result.data.length > 0) {
          console.log('첫 번째 차량 정보:');
          const firstCar = result.data[0];
          console.log(`  - 차량명: ${firstCar.resCarName}`);
          console.log(`  - 제조사: ${firstCar.resMakerName}`);
          console.log(`  - 모델: ${firstCar.resModelName}`);
          console.log(`  - 연식: ${firstCar.resYear}`);
          console.log(`  - 트림: ${firstCar.resTrim}`);
          console.log(`  - 연료: ${firstCar.resFuel}`);
          console.log(`  - 변속기: ${firstCar.resTransmission}`);
          console.log(`  - 배기량: ${firstCar.resDisplacement}`);
          console.log(`  - 연비: ${firstCar.resFuelEfficiency}`);
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
    const response = await fetch(`${baseUrl}/api/codef/car-spec-detail`, {
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

  console.log('\n🏁 CODEF API 테스트 완료');
}

// 테스트 실행
testCodefApi().catch(console.error);