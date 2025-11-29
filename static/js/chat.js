// Kiểm tra đăng nhập
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

if (!token || !username) {
    window.location.href = '/login.html';
}

document.getElementById('current-user').textContent = username;

// WebSocket connection
let ws = null;
let reconnectInterval = null;
let typingTimeout = null;
let isTyping = false;

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
        console.log('✅ WebSocket connected');

        ws.send(JSON.stringify({
            type: 'auth',
            token: token
        }));

        fetchMessages();

        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'message') {
            displayMessage(data);
        } else if (data.type === 'users') {
            updateUserList(data.users);
        } else if (data.type === 'typing') {
            showTypingIndicator(data.username, data.isTyping);
        } else if (data.type === 'error') {
            console.error('WebSocket error:', data.message);
            if (data.message.includes('token')) {
                logout();
            }
        }
    };

    ws.onclose = () => {
        console.log('❌ WebSocket disconnected');

        if (!reconnectInterval) {
            reconnectInterval = setInterval(() => {
                console.log('🔄 Attempting to reconnect...');
                connectWebSocket();
            }, 3000);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

connectWebSocket();

// Gửi tin nhắn
document.getElementById('messageForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();

    if (!content) return;

    try {
        const response = await fetch('/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            messageInput.value = '';
            sendTypingIndicator(false);
        } else {
            const data = await response.json();
            alert(data.error || 'Không thể gửi tin nhắn');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Lỗi kết nối đến server');
    }
});

// Xử lý typing indicator
document.getElementById('messageInput').addEventListener('input', (e) => {
    if (!isTyping && e.target.value.length > 0) {
        isTyping = true;
        sendTypingIndicator(true);
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        isTyping = false;
        sendTypingIndicator(false);
    }, 1000);
});

function sendTypingIndicator(typing) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'typing',
            isTyping: typing
        }));
    }
}

function showTypingIndicator(user, typing) {
    const indicator = document.getElementById('typing-indicator');
    const typingUsers = document.getElementById('typing-users');

    if (typing && user !== username) {
        typingUsers.textContent = `${user} đang nhập...`;
        indicator.style.display = 'flex';
    } else {
        indicator.style.display = 'none';
    }
}

// Lấy danh sách tin nhắn
async function fetchMessages() {
    try {
        const response = await fetch('/messages', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const messages = await response.json();
            const messagesDiv = document.getElementById('messages');
            messagesDiv.innerHTML = '';

            messages.forEach(msg => {
                displayMessage(msg);
            });

            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
}

// Hiển thị tin nhắn (Messenger style)
function displayMessage(msg) {
    const messagesDiv = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';

    // Kiểm tra nếu là tin nhắn của mình
    if (msg.username === username) {
        messageDiv.classList.add('own');
    }

    const timestamp = new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    });

    let contentHtml = '';

    // Kiểm tra nếu là hình ảnh (base64)
    if (msg.content.startsWith('data:image/')) {
        contentHtml = `<img src="${msg.content}" class="message-image" alt="image">`;
    } else {
        contentHtml = `<div class="message-content">${escapeHtml(msg.content)}</div>`;
    }

    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-user">${msg.username}</span>
            <span class="message-time">${timestamp}</span>
        </div>
        <div class="message-bubble">
            ${contentHtml}
        </div>
    `;

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Cập nhật danh sách người dùng online
function updateUserList(users) {
    const userList = document.getElementById('userList');
    const onlineCount = document.getElementById('online-count');

    userList.innerHTML = '';
    onlineCount.textContent = users.length;

    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user;
        if (user === username) {
            li.style.fontWeight = 'bold';
        }
        userList.appendChild(li);
    });
}

// Emoji picker
const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👍', '👎', '👏', '🙌', '👋', '🤝', '🙏', '💪', '🎉', '🎊', '🎈', '🎁', '🏆', '⭐', '✨', '💖', '💝', '💗', '💓', '💕', '💞', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍'];

const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const emojiGrid = document.querySelector('.emoji-grid');

// Tạo emoji grid
emojis.forEach(emoji => {
    const span = document.createElement('span');
    span.className = 'emoji-item';
    span.textContent = emoji;
    span.onclick = () => {
        const input = document.getElementById('messageInput');
        input.value += emoji;
        input.focus();
        emojiPicker.style.display = 'none';
    };
    emojiGrid.appendChild(span);
});

emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
});

// Đóng emoji picker khi click bên ngoài
document.addEventListener('click', (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.style.display = 'none';
    }
});

// Gửi hình ảnh
const imageBtn = document.getElementById('imageBtn');
const fileInput = document.getElementById('fileInput');

imageBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Kiểm tra kích thước file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB');
        return;
    }

    // Đọc file thành base64
    const reader = new FileReader();
    reader.onload = async (event) => {
        const base64Image = event.target.result;

        try {
            const response = await fetch('/send_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: base64Image })
            });

            if (!response.ok) {
                alert('Không thể gửi hình ảnh');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Lỗi kết nối đến server');
        }
    };

    reader.readAsDataURL(file);
    fileInput.value = '';
});

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Đăng xuất
document.getElementById('logoutBtn').addEventListener('click', logout);

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    if (ws) {
        ws.close();
    }

    window.location.href = '/login.html';
}

// Lấy danh sách người dùng online
async function fetchOnlineUsers() {
    try {
        const response = await fetch('/online_users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateUserList(data.users);
        }
    } catch (error) {
        console.error('Error fetching online users:', error);
    }
}

setInterval(fetchOnlineUsers, 5000);
fetchOnlineUsers();

// Enter để gửi, Shift+Enter để xuống dòng
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('messageForm').dispatchEvent(new Event('submit'));
    }
});