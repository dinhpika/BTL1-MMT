// login.js
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-button");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const API_BASE_URL = "http://localhost:8000";

    loginButton.addEventListener("click", async () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password: password })
            });

            if (response.ok) { // 200 OK
                const data = await response.json();

                // !! QUAN TRỌNG: Lưu tên người dùng vào bộ nhớ trình duyệt
                localStorage.setItem("username", data.username);

                alert("Đăng nhập thành công!");
                // Chuyển hướng về trang chủ
                window.location.href = "index.html";
            } else {
                // Xử lý lỗi (ví dụ: 401 Unauthorized)
                const data = await response.json();
                alert(`Đăng nhập thất bại: ${data.message || 'Sai tên đăng nhập hoặc mật khẩu'}`);
            }
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            alert("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
        }
    });
});