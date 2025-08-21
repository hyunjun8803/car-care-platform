"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pt-8 pb-6">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Car className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CarCare 로그인
            </CardTitle>
            <CardDescription className="text-gray-600 text-base mt-2">
              계정에 로그인하여 스마트 차량 관리를 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  이메일
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/70"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  비밀번호
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  className="h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-white/70"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm text-center font-medium">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    로그인 중...
                  </div>
                ) : (
                  "로그인"
                )}
              </Button>

              {/* 소셜 로그인 구분선 */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">또는</span>
                </div>
              </div>

              {/* OAuth 로그인 버튼들 */}
              <div className="space-y-3">
                {/* Google 로그인 */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="w-full h-12 text-base font-semibold border-2 border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google로 로그인
                </Button>

                {/* Kakao 로그인 */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signIn("kakao", { callbackUrl: "/dashboard" })}
                  className="w-full h-12 text-base font-semibold border-2 border-yellow-300 hover:border-yellow-400 bg-yellow-300 hover:bg-yellow-400 text-black shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11L7.485 21.5c-.39.39-.964.277-1.136-.226L5.73 19.77C3.616 18.244 1.5 15.251 1.5 11.185 1.5 6.664 6.201 3 12 3Z"/>
                  </svg>
                  카카오로 로그인
                </Button>

                {/* Naver 로그인 */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => signIn("naver", { callbackUrl: "/dashboard" })}
                  className="w-full h-12 text-base font-semibold border-2 border-green-500 hover:border-green-600 bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z"/>
                  </svg>
                  네이버로 로그인
                </Button>
              </div>

              <div className="text-center space-y-3">
                <div>
                  <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-purple-600 font-medium hover:underline transition-colors">
                    비밀번호를 잊으셨나요?
                  </Link>
                </div>
                <p className="text-gray-600">
                  계정이 없으신가요?{" "}
                  <Link href="/auth/signup" className="text-blue-600 hover:text-purple-600 font-semibold hover:underline transition-colors">
                    회원가입
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}