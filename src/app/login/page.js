"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("로그인 성공!");
        router.push("/dashboard");
      } else {
        alert(data.error || "로그인 실패");
      }
    } catch (error) {
      console.error(error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="page-wrapper login-page">
      <div className="container">
        <div className="glass-card">
          <h2>Welcome Back</h2>
          <p className="subtitle">계정에 로그인하세요</p>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input 
                type="email" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <label htmlFor="email">이메일 (Email)</label>
            </div>
            <div className="input-group">
              <input 
                type="password" 
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <label htmlFor="password">비밀번호 (Password)</label>
            </div>
            <div className="options">
              <label className="remember">
                <input type="checkbox" /> 로그인 유지
              </label>
              <a href="#" className="forgot">비밀번호 찾기</a>
            </div>
            <button type="submit" className="btn">로그인</button>
          </form>
          <p className="footer-text">계정이 없으신가요? <Link href="/signup">회원가입</Link></p>
        </div>
      </div>
    </div>
  );
}
