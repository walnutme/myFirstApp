"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [city, setCity] = useState("Seoul");
  const [citySelectOpen, setCitySelectOpen] = useState(false);

  const cities = [
    { value: "Seoul", label: "서울 (Seoul)" },
    { value: "Busan", label: "부산 (Busan)" },
    { value: "Incheon", label: "인천 (Incheon)" },
    { value: "Daegu", label: "대구 (Daegu)" },
    { value: "Daejeon", label: "대전 (Daejeon)" },
    { value: "Gwangju", label: "광주 (Gwangju)" },
    { value: "Ulsan", label: "울산 (Ulsan)" },
    { value: "Jeju", label: "제주 (Jeju)" },
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, city }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("회원가입이 완료되었습니다! 로그인해주세요.");
        router.push("/login");
      } else {
        alert(data.error || "회원가입 실패");
      }
    } catch (error) {
      console.error(error);
      alert("회원가입 중 오류가 발생했습니다.");
    }
  };

  const selectedCityLabel = cities.find(c => c.value === city)?.label || "도시 선택";

  return (
    <div className="page-wrapper signup-page">
      <div className="container">
        <div className="glass-card">
          <h2>Create Account</h2>
          <p className="subtitle">새로운 계정을 만들어보세요</p>
          <form onSubmit={handleSignup}>
            <div className="input-group">
              <input 
                type="text" 
                id="username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
              <label htmlFor="username">사용자 이름 (Username)</label>
            </div>
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
            
            <div style={{ marginBottom: "25px", textAlign: "left" }}>
              <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", display: "block", marginBottom: "8px" }}>지역 선택 (날씨 정보용)</label>
              <div className={`custom-select-wrapper ${citySelectOpen ? "open" : ""}`} onClick={() => setCitySelectOpen(!citySelectOpen)}>
                <div className="custom-select-trigger">{selectedCityLabel}</div>
                <div className="custom-options">
                  <div className="optgroup-label">주요 도시</div>
                  {cities.map(c => (
                    <div 
                      key={c.value} 
                      className="custom-option" 
                      onClick={() => {
                        setCity(c.value);
                        setCitySelectOpen(false);
                      }}
                    >
                      {c.label}
                    </div>
                  ))}
                </div>
              </div>
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
            <div className="input-group">
              <input 
                type="password" 
                id="confirm_password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
              <label htmlFor="confirm_password">비밀번호 확인</label>
            </div>
            <button type="submit" className="btn">회원가입</button>
          </form>
          <p className="footer-text">이미 계정이 있으신가요? <Link href="/login">로그인</Link></p>
        </div>
      </div>
    </div>
  );
}
