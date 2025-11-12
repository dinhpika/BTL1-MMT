// Chờ cho đến khi toàn bộ nội dung trang (DOM) được tải
document.addEventListener("DOMContentLoaded", () => {

    // --- Lấy các phần tử DOM ---
    const chatWindow = document.getElementById("chat-window");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const peerListElement = document.getElementById("peer-list");

    // --- Cấu hình ---
    const API_BASE_URL = "http://localhost:8000"; // Giữ nguyên
    let username = "";

    // --- Các hàm trợ giúp ---

    function displayMessage(user, text) {
        // ... (Giữ nguyên hàm này)
    }

    function escapeHTML(str) {
        // ... (Giữ nguyên hàm này)
    }

    // --- Định nghĩa các hàm gọi API ---

    /**
     * 1. GỌI API ĐĂNG KÝ (ĐÃ SỬA)
     * Thay vì /api/register, gọi /submit-info/ [cite: 258]
     */
    async function registerWithTracker() {
        try {
            // SỬA ĐỔI: Thay đổi URL
            const response = await fetch(`${API_BASE_URL}/submit-info/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username })
            });

            if (!response.ok) {
                throw new Error("Không thể đăng ký với tracker (submit-info).");
            }
            displayMessage("System", "Đăng ký với tracker thành công.");
        } catch (error) {
            console.error("Lỗi Đăng ký:", error);
            displayMessage("System", "Lỗi: " + error.message);
        }
    }

    /**
     * 2. GỌI API GỬI TIN NHẮN (ĐÃ SỬA)
     * Thay vì /api/broadcast, gọi /broadcast-peer/ [cite: 261]
     */
    async function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText === "") return;

        displayMessage(username, messageText);
        messageInput.value = "";

        try {
            // SỬA ĐỔI: Thay đổi URL (Thêm dấu / dựa theo PDF [cite: 261])
            await fetch(`${API_BASE_URL}/broadcast-peer/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: messageText, user: username })
            });
        } catch (error) {
            console.error("Lỗi Gửi tin nhắn:", error);
            displayMessage("System", "Không thể gửi tin nhắn.");
        }
    }

    /**
     * 3. GỌI API LẤY TIN NHẮN (!! CẦN CHÚ Ý !!)
     * * Backend log của bạn KHÔNG CÓ API NÀY.
     * Bạn phải tự thêm một API (ví dụ: /get-messages/) vào file Python
     * để xử lý việc lấy tin nhắn đang chờ.
     */
    async function fetchNewMessages() {
        try {
            // CẢNH BÁO: Route này (/api/get-messages) không có trong log backend của bạn.
            // Bạn cần thêm nó vào Python.
            const response = await fetch(`${API_BASE_URL}/api/get-messages`);
            if (!response.ok) return;

            const messages = await response.json();
            messages.forEach(msg => {
                displayMessage(msg.user, msg.message);
            });
        } catch (error) {
            // Bỏ qua lỗi polling
        }
    }

    /**
     * 4. GỌI API LẤY DANH SÁCH PEER (ĐÃ SỬA)
     * Thay vì /api/get-peers, gọi /get-list/ [cite: 259]
     */
    async function updatePeerList() {
        try {
            // SỬA ĐỔI: Thay đổi URL
            const response = await fetch(`${API_BASE_URL}/get-list/`);
            if (!response.ok) return;

            const peers = await response.json();
            peerListElement.innerHTML = "";

            Object.keys(peers).forEach(peerUsername => {
                const li = document.createElement("li");
                li.textContent = escapeHTML(peerUsername);
                if (peerUsername === username) {
                    li.textContent += " (Bạn)";
                }
                peerListElement.appendChild(li);
            });
        } catch (error) {
            // Bỏ qua lỗi polling
        }
    }


    // --- GẮN KẾT SỰ KIỆN VÀ KHỞI TẠO ---

    sendButton.addEventListener("click", sendMessage);
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    // Hàm khởi tạo (Đã sửa để dùng localStorage từ login.html)
    async function initialize() {
        // 1. Lấy tên người dùng TỪ LOCALSTORAGE
        username = localStorage.getItem("username");

        if (!username) {
            alert("Bạn phải đăng nhập để chat!");
            window.location.href = "login.html";
            return;
        }

        document.title = `${username} - Hybrid Chat`;
        displayMessage("System", `Chào mừng, ${username}!`);

        // 2. Đăng ký với tracker (đã sửa URL)
        await registerWithTracker();

        // 3. Bắt đầu polling
        setInterval(fetchNewMessages, 1000);
        setInterval(updatePeerList, 5000);
    }

    // Chạy ứng dụng
    initialize();
});