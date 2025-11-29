document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    errorMessage.textContent = '';

    // Kiểm tra nhanh phía client
    if (username !== 'admin' || password !== 'password') {
        errorMessage.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng!';
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Lưu thông tin đăng nhập
            localStorage.setItem('token', data.token);
            localStorage.setItem('username', username);

            // Chuyển hướng đến trang chat
            window.location.href = '/chat.html';
        } else {
            errorMessage.textContent = data.error || 'Đăng nhập thất bại';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'Lỗi kết nối đến server. Vui lòng kiểm tra lại!';
    }
});

// Kiểm tra nếu đã đăng nhập
if (localStorage.getItem('token')) {
    window.location.href = '/chat.html';
}