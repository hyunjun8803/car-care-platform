"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ApiTestResult {
  method: string;
  url: string;
  status: number;
  data: any;
  timestamp: string;
}

export default function ApiTestPage() {
  const [results, setResults] = useState<ApiTestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (method: string, url: string, status: number, data: any) => {
    setResults(prev => [{
      method,
      url,
      status,
      data,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev]);
  };

  const testApi = async (method: string, endpoint: string, body?: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(body && { body: JSON.stringify(body) })
      });

      const data = await response.json();
      addResult(method, `/api${endpoint}`, response.status, data);
    } catch (error) {
      addResult(method, `/api${endpoint}`, 0, { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testCases = [
    {
      title: "차량 목록 조회",
      description: "GET /api/cars",
      action: () => testApi('GET', '/cars')
    },
    {
      title: "차량 등록",
      description: "POST /api/cars",
      action: () => testApi('POST', '/cars', {
        name: "테스트 차량",
        brand: "현대",
        model: "아반떼 CN7",
        year: 2023,
        licensePlate: "123테1234",
        mileage: 10000,
        fuelType: "가솔린",
        engineSize: "1.6L",
        color: "은색"
      })
    },
    {
      title: "특정 차량 조회",
      description: "GET /api/cars/1",
      action: () => testApi('GET', '/cars/1')
    },
    {
      title: "차량 정보 수정",
      description: "PUT /api/cars/1",
      action: () => testApi('PUT', '/cars/1', {
        name: "수정된 소나타",
        mileage: 36000
      })
    },
    {
      title: "정비 기록 목록 조회",
      description: "GET /api/maintenance",
      action: () => testApi('GET', '/maintenance')
    },
    {
      title: "특정 차량 정비 기록 조회",
      description: "GET /api/maintenance?carId=1",
      action: () => testApi('GET', '/maintenance?carId=1')
    },
    {
      title: "정비 기록 추가",
      description: "POST /api/maintenance",
      action: () => testApi('POST', '/maintenance', {
        carId: "1",
        date: "2024-08-10",
        type: "정기점검",
        description: "API 테스트용 정비 기록",
        cost: 150000,
        mileage: 36500,
        shopName: "테스트 정비소",
        shopAddress: "서울시 테스트구 테스트로 123"
      })
    },
    {
      title: "정비 기록 수정",
      description: "PUT /api/maintenance/1",
      action: () => testApi('PUT', '/maintenance/1', {
        cost: 130000,
        description: "수정된 정비 내용"
      })
    }
  ];

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge className="bg-green-100 text-green-800">성공 {status}</Badge>;
    } else if (status >= 400 && status < 500) {
      return <Badge className="bg-yellow-100 text-yellow-800">클라이언트 오류 {status}</Badge>;
    } else if (status >= 500) {
      return <Badge className="bg-red-100 text-red-800">서버 오류 {status}</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800">오류 {status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            API 테스트 페이지
          </h1>
          <p className="text-gray-600">
            차량 관리 및 정비 기록 API 엔드포인트를 테스트할 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API 테스트 버튼들 */}
          <div>
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle>API 테스트</CardTitle>
                <CardDescription>
                  아래 버튼을 클릭하여 각 API 엔드포인트를 테스트하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {testCases.map((testCase, index) => (
                  <div key={index} className="flex flex-col space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{testCase.title}</h4>
                        <p className="text-sm text-gray-500">{testCase.description}</p>
                      </div>
                      <Button
                        onClick={testCase.action}
                        disabled={loading}
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        {loading ? '테스트 중...' : '테스트'}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* API 결과 */}
          <div>
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>API 응답 결과</CardTitle>
                    <CardDescription>
                      최신 API 호출 결과가 표시됩니다.
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => setResults([])}
                    variant="outline"
                    size="sm"
                  >
                    결과 지우기
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    아직 테스트 결과가 없습니다.
                  </p>
                ) : (
                  results.map((result, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{result.method}</Badge>
                          {getStatusBadge(result.status)}
                        </div>
                        <span className="text-xs text-gray-500">{result.timestamp}</span>
                      </div>
                      <p className="text-sm font-mono mb-2">{result.url}</p>
                      <div className="bg-white p-2 rounded border text-xs">
                        <pre className="whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* API 문서 */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm mt-8">
          <CardHeader>
            <CardTitle>API 엔드포인트 문서</CardTitle>
            <CardDescription>
              사용 가능한 API 엔드포인트와 요청/응답 형식입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">차량 관리 API</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-4 gap-2 font-medium">
                  <span>메소드</span>
                  <span>엔드포인트</span>
                  <span>설명</span>
                  <span>인증</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code>/api/cars</code>
                  <span>사용자 차량 목록 조회</span>
                  <span>필요</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="outline">POST</Badge>
                  <code>/api/cars</code>
                  <span>새 차량 등록</span>
                  <span>필요</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code>/api/cars/[id]</code>
                  <span>특정 차량 조회</span>
                  <span>필요</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="outline">PUT</Badge>
                  <code>/api/cars/[id]</code>
                  <span>차량 정보 수정</span>
                  <span>필요</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="outline">DELETE</Badge>
                  <code>/api/cars/[id]</code>
                  <span>차량 삭제</span>
                  <span>필요</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">정비 기록 API</h3>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-4 gap-2 font-medium">
                  <span>메소드</span>
                  <span>엔드포인트</span>
                  <span>설명</span>
                  <span>인증</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code>/api/maintenance</code>
                  <span>정비 기록 목록 조회</span>
                  <span>필요</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="outline">POST</Badge>
                  <code>/api/maintenance</code>
                  <span>새 정비 기록 추가</span>
                  <span>필요</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="outline">GET</Badge>
                  <code>/api/maintenance/[id]</code>
                  <span>특정 정비 기록 조회</span>
                  <span>필요</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="outline">PUT</Badge>
                  <code>/api/maintenance/[id]</code>
                  <span>정비 기록 수정</span>
                  <span>필요</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Badge variant="outline">DELETE</Badge>
                  <code>/api/maintenance/[id]</code>
                  <span>정비 기록 삭제</span>
                  <span>필요</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}