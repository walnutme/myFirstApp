"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [currentDateOffset, setCurrentDateOffset] = useState(0);
  const [minDays, setMinDays] = useState(0);
  const [maxDays, setMaxDays] = useState(6);
  const [selectedCity, setSelectedCity] = useState("");
  const [weatherDataCache, setWeatherDataCache] = useState(null);
  const [walkLogs, setWalkLogs] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUserStr = localStorage.getItem("user");
    if (storedUserStr) {
      const storedUser = JSON.parse(storedUserStr);
      const city = storedUser.city || "Seoul";
      setSelectedCity(city);

      const savedWalkLogs = JSON.parse(localStorage.getItem("walkLogs")) || {};
      setWalkLogs(savedWalkLogs);

      const cityMap = {
        Seoul: "서울", Busan: "부산", Incheon: "인천", Daegu: "대구",
        Daejeon: "대전", Gwangju: "광주", Ulsan: "울산", Jeju: "제주"
      };
      const cityName = cityMap[city] || city;

      const loadWeatherData = async () => {
        try {
          const coords = await fetchCoordinates(cityName);
          const cache = await fetchWeather(coords.lat, coords.lon);
          setWeatherDataCache(cache);

          if (cache.weather.daily && cache.weather.daily.time) {
            const todayStr = getSeoulDateString(0);
            const todayIndex = cache.weather.daily.time.indexOf(todayStr);
            if (todayIndex !== -1) {
              setMinDays(-todayIndex);
              setMaxDays(cache.weather.daily.time.length - 1 - todayIndex);
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      };

      loadWeatherData();
    } else {
      router.push("/login");
    }
  }, [router]);

  const getSeoulDateString = (offset) => {
    const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    date.setDate(date.getDate() + offset);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchCoordinates = async (city) => {
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ko&format=json`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return { lat: data.results[0].latitude, lon: data.results[0].longitude };
      }
    } catch (e) {
      console.error("Geocoding failed:", e);
    }
    return { lat: 37.5665, lon: 126.9780 };
  };

  const fetchWeather = async (lat, lon) => {
    const wUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code&timezone=Asia%2FSeoul&past_days=7`;
    const wRes = await fetch(wUrl);
    const wData = await wRes.json();

    const aUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,dust&timezone=Asia%2FSeoul&past_days=7`;
    const aRes = await fetch(aUrl);
    const aData = await aRes.json();

    return { weather: wData, aqi: aData };
  };

  const mapWMOCode = (code) => {
    if ([0].includes(code)) return "sunny";
    if ([1, 2, 3, 45, 48].includes(code)) return "cloudy";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return "rainy";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "snowy";
    return "sunny";
  };

  const getWeatherData = (offset) => {
    if (!weatherDataCache) return null;

    const wIcon = { sunny: "☀️", rainy: "🌧️", cloudy: "☁️", snowy: "❄️" };
    const wDesc = { sunny: "화창함", rainy: "비가 옴", cloudy: "흐림", snowy: "눈이 내림" };

    const targetDateStr = getSeoulDateString(offset);
    const dayIndex = weatherDataCache.weather.daily.time.indexOf(targetDateStr);
    if (dayIndex === -1) return null;

    const code = weatherDataCache.weather.daily.weather_code[dayIndex];
    const type = mapWMOCode(code);

    const targetHourStr = `${targetDateStr}T12:00`;
    const hourIndex = weatherDataCache.aqi.hourly.time.indexOf(targetHourStr);

    let misae = 0, choMisae = 0, dustVal = 0;
    if (hourIndex !== -1) {
      misae = weatherDataCache.aqi.hourly.pm10[hourIndex] || 0;
      choMisae = weatherDataCache.aqi.hourly.pm2_5[hourIndex] || 0;
      dustVal = weatherDataCache.aqi.hourly.dust[hourIndex] || 0;
    }

    const hwangsa = dustVal > 100;
    const date = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    date.setDate(date.getDate() + offset);

    const weekdayStr = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    const shortDateStr = `${date.getMonth() + 1}/${date.getDate()} (${weekdayStr})`;

    return {
      date: shortDateStr,
      type,
      icon: wIcon[type],
      desc: wDesc[type],
      misae: Math.round(misae),
      choMisae: Math.round(choMisae),
      hwangsa,
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    alert("로그아웃 되었습니다.");
    router.push("/login");
  };

  const data = getWeatherData(currentDateOffset);

  const toggleWalk = (e) => {
    const isChecked = e.target.checked;
    if (!data) return;

    const isBadWeather = data.type === "rainy" || data.type === "snowy" || data.hwangsa || data.choMisae > 40 || data.misae > 60;
    if (isBadWeather) return;

    const targetDateStr = getSeoulDateString(currentDateOffset);
    const newLogs = { ...walkLogs, [targetDateStr]: isChecked };
    setWalkLogs(newLogs);
    localStorage.setItem("walkLogs", JSON.stringify(newLogs));
  };

  if (!selectedCity) return null; // Wait for initial check

  let dayLabel = "로딩 중...";
  let isBadWeather = false;
  let isWalked = false;

  if (data) {
    if (currentDateOffset === 0) dayLabel = `오늘 (${data.date})`;
    else if (currentDateOffset === 1) dayLabel = `내일 (${data.date})`;
    else if (currentDateOffset === -1) dayLabel = `어제 (${data.date})`;
    else if (currentDateOffset < 0) dayLabel = `${Math.abs(currentDateOffset)}일 전 (${data.date})`;
    else dayLabel = `${currentDateOffset}일 후 (${data.date})`;

    isBadWeather = data.type === "rainy" || data.type === "snowy" || data.hwangsa || data.choMisae > 40 || data.misae > 60;
    const targetDateStr = getSeoulDateString(currentDateOffset);
    isWalked = walkLogs[targetDateStr] || false;
  }

  const weatherClass = data ? `weather-${data.type}` : "weather-sunny";

  return (
    <div className={`page-wrapper ${weatherClass}`}>
      {data && (
        <div
          style={{
            position: "fixed", top: "50%", right: "10%", transform: "translateY(-50%)",
            fontSize: "35vh", opacity: 0.6, pointerEvents: "none", zIndex: 0,
            lineHeight: 1, filter: "drop-shadow(0 0 30px rgba(255,255,255,0.4))",
            animation: "float 6s ease-in-out infinite", textAlign: "center"
          }}
        >
          {data.icon}
        </div>
      )}

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="glass-card" style={{ textAlign: "center", position: "relative" }}>
          <button onClick={() => setCurrentDateOffset(c => c - 1)} disabled={currentDateOffset <= minDays || isLoading} className="nav-arrow" title="전 날로 이동">▲</button>

          <div className="walk-header" style={{ textAlign: "center", margin: "15px 0 25px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontFamily: "'Gowun Dodum', 'Jua', sans-serif", fontSize: "3.2rem", fontWeight: "bold", position: "relative", marginBottom: "10px", lineHeight: 1.2, whiteSpace: "nowrap" }}>
              <span>산책 일지</span>
              {isBadWeather && (
                <svg style={{ position: "absolute", top: "-5%", left: "-5%", width: "110%", height: "110%", pointerEvents: "none", filter: "drop-shadow(2px 4px 5px rgba(0,0,0,0.4))" }} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 5,95 Q 45,50 95,5 M 95,5 Q 50,45 10,90" stroke="#ff4757" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
                  <path d="M 12,98 Q 50,55 90,10" stroke="#ff6b81" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
                  <path d="M 5,5 Q 50,50 95,95 M 95,95 Q 50,55 10,10" stroke="#ff4757" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
                  <path d="M 12,2 Q 55,50 90,90" stroke="#ff6b81" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.9" />
                </svg>
              )}
            </div>

            <img
              src={isBadWeather ? "/crying_poodle.png" : "/smiling_poodle.png"}
              alt="푸들 얼굴"
              style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", boxShadow: "0 8px 25px rgba(0,0,0,0.4)", border: "5px solid rgba(255,255,255,0.7)", background: "white" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "5px", flexWrap: "nowrap", whiteSpace: "nowrap" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", margin: 0 }}>{dayLabel}</h3>
            <label
              style={{
                display: "inline-flex", alignItems: "center", cursor: isBadWeather ? "not-allowed" : "pointer",
                padding: "4px 10px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold", transition: "all 0.3s",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                background: isBadWeather ? "rgba(255, 107, 129, 0.3)" : (isWalked ? "rgba(78, 205, 196, 0.4)" : "rgba(255,255,255,0.2)"),
                border: `2px solid ${isBadWeather ? "#ff6b81" : (isWalked ? "#4ecdc4" : "transparent")}`,
                pointerEvents: isBadWeather ? "none" : "auto", opacity: isBadWeather ? 0.8 : 1
              }}
            >
              <input type="checkbox" checked={isWalked} onChange={toggleWalk} disabled={isBadWeather} style={{ display: "none" }} />
              <span style={{ marginRight: "4px" }}>{isBadWeather ? "⛔" : (isWalked ? "🐾" : "🔲")}</span>
              <span>{isBadWeather ? "산책 불가 (날씨 나쁨)" : (isWalked ? "산책 완료!" : "산책 전")}</span>
            </label>
          </div>
          <p className="subtitle" style={{ marginBottom: "20px", opacity: 0.9 }}>
            📍 {selectedCity} {isLoading && "(날씨 불러오는 중...)"}
          </p>

          <div className="weather-info">
            <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "10px" }}>
              날씨: {data ? data.desc : "로딩 중..."}
            </p>

            {data && (
              <div style={{ fontSize: "0.95rem", marginTop: "15px", background: "rgba(0,0,0,0.2)", padding: "15px", borderRadius: "12px", textAlign: "left", display: "inline-block", width: "100%" }}>
                <p style={{ marginBottom: "8px", color: data.misae > 60 ? "#ff6b6b" : "#4ecdc4" }}>
                  미세먼지: <strong>{data.misae}</strong> ㎍/㎥
                </p>
                <p style={{ marginBottom: "8px", color: data.choMisae > 40 ? "#ff6b6b" : "#4ecdc4" }}>
                  초미세먼지: <strong>{data.choMisae}</strong> ㎍/㎥
                </p>
                <p>
                  황사: <strong>{data.hwangsa ? "발생 😷" : "없음 😊"}</strong>
                </p>
              </div>
            )}
          </div>

          <div style={{ marginTop: "10px" }}>
            <button onClick={() => setCurrentDateOffset(c => c + 1)} disabled={currentDateOffset >= maxDays || isLoading} className="nav-arrow" title="다음 날로 이동">▼</button>
          </div>

          <div className="options" style={{ justifyContent: "center", marginTop: "15px" }}>
            <button onClick={handleLogout} className="btn" style={{ width: "auto", padding: "8px 25px" }}>로그아웃</button>
          </div>
        </div>
      </div>
    </div>
  );
}
