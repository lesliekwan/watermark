import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../db';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 验证表单
      if (!form.username || !form.password || !form.email) {
        throw new Error('请填写所有必填项');
      }
      if (form.password !== form.confirmPassword) {
        throw new Error('两次输入的密码不一致');
      }

      // 检查用户名是否已存在
      const existingUser = await db.users
        .where('username')
        .equals(form.username)
        .first();
      
      if (existingUser) {
        throw new Error('用户名已被注册');
      }

      // 创建新用户
      const userId = await db.users.add({
        username: form.username,
        password: form.password, // 实际应用中需要加密
        email: form.email,
        avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${form.username}`,
        stats: {
          works: 0,
          favorites: 0,
          likes: 0
        },
        createdAt: new Date()
      });

      // 注册成功，跳转到登录页
      alert('注册成功，请登录');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1c2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 rounded-2xl p-6 backdrop-blur">
        <h1 className="text-2xl font-bold text-white text-center mb-8">注册账号</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="用户名"
              className="w-full bg-white/10 rounded-lg px-4 py-3 text-white outline-none"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="邮箱"
              className="w-full bg-white/10 rounded-lg px-4 py-3 text-white outline-none"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="密码"
              className="w-full bg-white/10 rounded-lg px-4 py-3 text-white outline-none"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="确认密码"
              className="w-full bg-white/10 rounded-lg px-4 py-3 text-white outline-none"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg py-3 font-medium"
          >
            注册
          </button>
          <div className="text-center text-gray-400">
            已有账号？
            <Link to="/login" className="text-blue-400 ml-2">
              去登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register; 