// Kiểm tra nếu đã đăng nhập thì chuyển thẳng vào chat
if (localStorage.getItem('token')) {
    window.location.href = '/chat.html';
}

// Hiệu ứng chào mừng
document.addEventListener('DOMContentLoaded', () => {
    const welcomeContent = document.querySelector('.welcome-content');

    // Fade in animation
    setTimeout(() => {
        welcomeContent.style.opacity = '1';
    }, 100);

    // Hiển thị thông tin server (nếu có API)
    checkServerStatus();
});

// Kiểm tra trạng thái server
async function checkServerStatus() {
    try {
        const response = await fetch('/api/status');
        if (response.ok) {
            const data = await response.json();
            console.log('Server status:', data);

            // Có thể hiển thị thêm thông tin server nếu muốn
            if (data.online_users !== undefined) {
                const infoSection = document.querySelector('.info-section ul');
                const li = document.createElement('li');
                li.innerHTML = `🟢 Người dùng online: <strong>${data.online_users}</strong>`;
                infoSection.appendChild(li);
            }
        }
    } catch (error) {
        console.log('Server status check failed:', error);
    }
}

// Smooth scroll cho các link nội bộ
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});