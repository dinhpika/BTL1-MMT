// index.js
document.addEventListener("DOMContentLoaded", () => {
    const welcomeMessage = document.getElementById("welcome-message");
    const chatLink = document.getElementById("chat-link");
    const loginLink = document.getElementById("login-link");
    const logoutLink = document.getElementById("logout-link");

    // Kiểm tra xem đã đăng nhập chưa
    const username = localStorage.getItem("username");

    if (username) {
        // Đã đăng nhập
        welcomeMessage.textContent = `Chào mừng, ${username}!`;
        chatLink.style.display = "block";
        logoutLink.style.display = "inline-block";
    } else {
        // Chưa đăng nhập
        welcomeMessage.textContent = "Bạn cần đăng nhập để sử dụng chat.";
        loginLink.style.display = "block";
    }

    // Xử lý đăng xuất
    logoutLink.addEventListener("click", (e) => {
        e.preventDefault(); // Ngăn link tự chuyển trang

        // Xóa thông tin khỏi localStorage
        localStorage.removeItem("username");

        alert("Bạn đã đăng xuất.");
        // Tải lại trang
        window.location.reload();
    });
});