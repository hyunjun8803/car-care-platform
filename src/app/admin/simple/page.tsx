"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Mail } from "lucide-react";

export default function SimpleAdminUpgradePage() {
  const [formData, setFormData] = useState({
    email: "hyunjun2@naver.com",
    newPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.newPassword) {
      setError("새 패스워드를 입력해주세요.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("패스워드는 최소 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/simple-upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "업그레이드에 실패했습니다.");
      }

      setSuccess(data.message);
      
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push("/auth/signin?callbackUrl=/admin");
      }, 3000);

    } catch (error) {
      console.error("업그레이드 오류:", error);
      setError(error instanceof Error ? error.message : "업그레이드에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-md">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-600 p-3 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              간단 관리자 설정
            </CardTitle>
            <CardDescription>
              Supabase 계정을 관리자로 변경합니다
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  {success}
                  <br />
                  <span className="text-sm">3초 후 로그인 페이지로 이동합니다...</span>
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">계정 이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-gray-100"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">새 관리자 패스워드</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="최소 6자 이상"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                <h4 className="font-semibold mb-1">변경 내용:</h4>
                <ul className="text-xs space-y-1">
                  <li>• userType: CUSTOMER → ADMIN</li>
                  <li>• name: 테스터 → 최고관리자</li>
                  <li>• password: 새 패스워드로 변경</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.newPassword}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "업그레이드 중..." : "간단 업그레이드"}
              </Button>
            </form>

            <div className="mt-6 space-y-2">
              <div className="text-center">
                <a 
                  href="/admin/debug" 
                  className="text-blue-600 hover:underline text-sm"
                >
                  디버그 페이지에서 상태 확인
                </a>
              </div>
              <div className="text-center">
                <a 
                  href="/auth/signin" 
                  className="text-gray-600 hover:underline text-sm"
                >
                  로그인 페이지로
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            🔧 Supabase 계정만 간단히 업데이트합니다
          </p>
        </div>
      </div>
    </div>
  );
}