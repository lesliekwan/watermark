import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { db } from '../db';

function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!form.username || !form.password) {
        throw new Error('请输入用户名和密码');
      }

      // 查询用户
      const user = await db.users
        .where('username')
        .equals(form.username)
        .first();

      if (!user || user.password !== form.password) {
        throw new Error('用户名或密码错误');
      }

      // 登录成功
      const { password, ...userWithoutPassword } = user;
      localStorage.setItem('token', JSON.stringify(user.id));
      setUser(userWithoutPassword);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1c2e] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/5 rounded-2xl p-6 backdrop-blur">
        <h1 className="text-2xl font-bold text-white text-center mb-8">登录</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              type="password"
              placeholder="密码"
              className="w-full bg-white/10 rounded-lg px-4 py-3 text-white outline-none"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white rounded-lg py-3 font-medium"
          >
            登录
          </button>
          <div className="text-center text-gray-400">
            没有账号？
            <Link to="/register" className="text-blue-400 ml-2">
              去注册
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login; 