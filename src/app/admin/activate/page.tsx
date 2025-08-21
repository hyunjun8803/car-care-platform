"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Mail } from "lucide-react";

export default function AdminActivatePage() {
  const [formData, setFormData] = useState({
    email: "hyunjun2@naver.com",
    password: ""
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

    if (!formData.password) {
      setError("패스워드를 입력해주세요.");
      return;
    }

    if (formData.password.length < 6) {
      setError("패스워드는 최소 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "계정 활성화에 실패했습니다.");
      }

      setSuccess(data.message);
      
      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push("/auth/signin?callbackUrl=/admin");
      }, 3000);

    } catch (error) {
      console.error("계정 활성화 오류:", error);
      setError(error instanceof Error ? error.message : "계정 활성화에 실패했습니다.");
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
              <div className="bg-red-600 p-3 rounded-full">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
              최고관리자 계정 활성화
            </CardTitle>
            <CardDescription>
              CarCare 플랫폼 최고관리자 계정을 설정합니다
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
                <Label htmlFor="email">관리자 이메일</Label>
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
                <p className="text-xs text-gray-500 mt-1">
                  승인된 관리자 이메일만 활성화 가능합니다
                </p>
              </div>

              <div>
                <Label htmlFor="password">관리자 패스워드</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="최소 6자 이상의 보안 패스워드"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !formData.password}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "활성화 중..." : "계정 활성화"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                이미 활성화된 계정이 있으신가요?{" "}
                <a href="/auth/signin" className="text-blue-600 hover:underline">
                  로그인하기
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            ⚠️ 최고관리자 계정은 시스템의 모든 권한을 가집니다
          </p>
        </div>
      </div>
    </div>
  );
}