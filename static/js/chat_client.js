// Chờ cho đến khi toàn bộ nội dung trang (DOM) được tải
document.addEventListener("DOMContentLoaded", () => {

    // --- Lấy các phần tử DOM ---
    const chatWindow = document.getElementById("chat-window");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const peerListElement = document.getElementById("peer-list");

    // --- Cấu hình ---
    // Giả sử backend WeApRous (start_sampleapp.py) chạy trên cổng 8000
    // Cổng này PHẢI KHỚP với cổng bạn chạy start_sampleapp.py.
    const API_BASE_URL = "http://localhost:8000";
    let username = "";

    // --- Các hàm trợ giúp ---

    /**
     * Hiển thị tin nhắn trong cửa sổ chat.
     * @param {string} user - Người dùng gửi tin nhắn.
     * @param {string} text - Nội dung tin nhắn.
     */
    function displayMessage(user, text) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.innerHTML = `<strong>${escapeHTML(user)}:</strong> ${escapeHTML(text)}`;
        chatWindow.appendChild(messageElement);
        // Tự động cuộn xuống dưới cùng
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    /**
     * Làm sạch HTML để chống tấn công XSS (Cross-Site Scripting).
     * @param {string} str - Chuỗi thô.
     * @returns {string} - Chuỗi đã được làm sạch.
     */
    function escapeHTML(str) {
        return str.replace(/[&<>"']/g, function (match) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    }

    // --- Định nghĩa các hàm gọi API ---

    /**
     * 1. GỌI API ĐĂNG KÝ (CLIENT -> BACKEND)
     * Yêu cầu backend *của chính mình* đăng ký peer này với Tracker trung tâm.
     */
    async function registerWithTracker() {
        try {
            // Gọi đến route /api/register trên start_sampleapp.py
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username })
            });

            if (!response.ok) {
                throw new Error("Không thể đăng ký với tracker.");
            }
            displayMessage("System", "Đăng ký với tracker thành công.");
        } catch (error) {
            console.error("Lỗi Đăng ký:", error);
            displayMessage("System", "Lỗi: " + error.message);
        }
    }

    /**
     * 2. GỌI API GỬI TIN NHẮN (CLIENT -> BACKEND)
     * Gửi tin nhắn đến backend *của chính mình*. Backend sẽ xử lý việc broadcast P2P.
     */
    async function sendMessage() {
        const messageText = messageInput.value.trim();
        if (messageText === "") return;

        // Hiển thị tin nhắn của chính mình ngay lập tức (cập nhật lạc quan)
        displayMessage(username, messageText);
        messageInput.value = ""; // Xóa ô nhập liệu

        try {
            // Gọi đến route /api/broadcast trên start_sampleapp.py
            await fetch(`${API_BASE_URL}/api/broadcast`, {
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
     * 3. GỌI API LẤY TIN NHẮN (CLIENT -> BACKEND)
     * Lấy (poll) tin nhắn mới từ backend *của chính mình* mà backend đã nhận từ các peer *khác*.
     */
    async function fetchNewMessages() {
        try {
            // Gọi đến route /api/get-messages trên start_sampleapp.py
            const response = await fetch(`${API_BASE_URL}/api/get-messages`);
            if (!response.ok) return;

            const messages = await response.json();
            messages.forEach(msg => {
                displayMessage(msg.user, msg.message);
            });
        } catch (error) {
            // Bỏ qua lỗi polling (ví dụ: mạng bị ngắt quãng)
            // console.warn("Lỗi polling:", error);
        }
    }

    /**
     * 4. GỌI API LẤY DANH SÁCH PEER (CLIENT -> BACKEND)
     * Lấy (poll) danh sách peer đang hoạt động từ backend *của chính mình*.
     */
    async function updatePeerList() {
        try {
            // Gọi đến route /api/get-peers trên start_sampleapp.py
            const response = await fetch(`${API_BASE_URL}/api/get-peers`);
            if (!response.ok) return;

            const peers = await response.json(); // Mong đợi một object như { "user1": {...}, "user2": {...} }

            peerListElement.innerHTML = ""; // Xóa danh sách cũ
            // Chúng ta chỉ cần tên (các key)
            Object.keys(peers).forEach(peerUsername => {
                const li = document.createElement("li");
                li.textContent = escapeHTML(peerUsername);
                // Không liệt kê chính mình
                if (peerUsername === username) {
                    li.textContent += " (Bạn)";
                }
                peerListElement.appendChild(li);
            });
        } catch (error) {
            // Bỏ qua lỗi polling
            // console.warn("Lỗi lấy danh sách peer:", error);
        }
    }


    // --- GẮN KẾT SỰ KIỆN VÀ KHỞI TẠO ---

    // Gắn sự kiện cho nút Gửi
    sendButton.addEventListener("click", sendMessage);

    // Gắn sự kiện nhấn phím Enter trong ô nhập liệu
    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

    // Hàm khởi tạo
    async function initialize() {
        // 1. Lấy tên người dùng
        username = prompt("Nhập tên của bạn:", "User" + Math.floor(Math.random() * 1000));
        if (!username) {
            username = "Anonymous";
        }
        document.title = `${username} - Hybrid Chat`;
        displayMessage("System", `Chào mừng, ${username}!`);

        // 2. Đăng ký với tracker (thông qua backend của chúng ta)
        await registerWithTracker();

        // 3. Bắt đầu polling (lấy thông tin định kỳ)
        setInterval(fetchNewMessages, 1000); // Lấy tin nhắn mới mỗi 1 giây
        setInterval(updatePeerList, 5000);   // Cập nhật danh sách peer mỗi 5 giây
    }

    // Chạy ứng dụng
    initialize();
});