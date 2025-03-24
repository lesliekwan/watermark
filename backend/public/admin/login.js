document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginButton = document.getElementById('login-button');
        const errorMessage = document.getElementById('error-message');
        
        loginButton.textContent = '登录中...';
        loginButton.disabled = true;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                if (data.data.is_admin) {
                    // 登录成功，跳转到管理页面
                    window.location.href = '/admin/dashboard.html';
                } else {
                    errorMessage.textContent = '您没有管理员权限';
                    errorMessage.style.display = 'block';
                }
            } else {
                errorMessage.textContent = data.message || '登录失败';
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            errorMessage.textContent = '登录失败，请稍后重试';
            errorMessage.style.display = 'block';
            console.error(error);
        }
        
        loginButton.textContent = '登录';
        loginButton.disabled = false;
    });
}); 