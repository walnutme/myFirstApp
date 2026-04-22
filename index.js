function goToLogin() {
    window.location.href = "login.html";
}

function goToSignup() {
    window.location.href = "signup.html";
}

function handleSignup(event) {
    event.preventDefault(); // 기본 form 제출 동작 방지 (페이지 새로고침 방지)

    // 각 항목 데이터 가져오기
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;
    const city = document.getElementById("city").value;

    // (선택) 비밀번호 일치 확인
    if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    if (!city) {
        alert("거주 도시를 선택해주세요.");
        return;
    }

    // 사용자 객체 생성
    const user = {
        username: username,
        email: email,
        password: password,
        city: city
    };

    // 객체를 JSON 문자열로 변환하여 LocalStorage에 한 번에 저장
    localStorage.setItem("user", JSON.stringify(user));

    alert("회원가입이 완료되었습니다! (로컬 스토리지 저장 완료)");

    // 로그인 페이지로 이동
    goToLogin();
}

function handleLogin(event) {
    event.preventDefault(); // 기본 form 제출 동작 방지

    // 입력받은 데이터 가져오기
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // LocalStorage에서 저장된 회원 정보 가져오기
    const storedUserStr = localStorage.getItem("user");

    if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);

        // 이메일과 비밀번호 일치하는지 확인
        if (storedUser.email === email && storedUser.password === password) {
            alert("로그인 성공!");
            window.location.href = "dashboard.html"; // 대시보드 화면으로 이동
        } else {
            alert("이메일 또는 비밀번호가 잘못되었습니다.");
        }
    } else {
        alert("가입된 정보가 없습니다. 회원가입을 먼저 진행해주세요.");
    }
}

function handleLogout() {
    alert("로그아웃 되었습니다.");
    window.location.href = "login.html";
}
