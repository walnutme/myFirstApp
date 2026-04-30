"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="page-wrapper home-page">
      <div className="container">
        <div className="glass-card">
          <h2>Welcome to My App</h2>
          <p className="subtitle">시작하기 위해 옵션을 선택하세요</p>
          <div className="home-buttons">
            <Link href="/login" className="btn" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>로그인</Link>
            <Link href="/signup" className="btn" style={{ textAlign: 'center', display: 'block', textDecoration: 'none' }}>회원가입</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
