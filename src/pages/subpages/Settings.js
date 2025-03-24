import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

function Settings() {
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <Link to="/profile" className="text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </Link>
        <h1 className="text-lg font-medium">设置</h1>
        <div className="w-8"></div>
      </div>

      {/* 设置列表 */}
      <div className="p-4">
        <div className="bg-white/5 rounded-xl overflow-hidden">
          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <span>账号安全</span>
              <i className="fas fa-chevron-right text-gray-500"></i>
            </div>
            <div className="flex items-center justify-between p-4">
              <span>隐私设置</span>
              <i className="fas fa-chevron-right text-gray-500"></i>
            </div>
            <div className="flex items-center justify-between p-4">
              <span>消息通知</span>
              <i className="fas fa-chevron-right text-gray-500"></i>
            </div>
            <div className="flex items-center justify-between p-4">
              <span>清除缓存</span>
              <span className="text-sm text-gray-400">23.5MB</span>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white/5 rounded-xl overflow-hidden">
          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <span>关于我们</span>
              <i className="fas fa-chevron-right text-gray-500"></i>
            </div>
            <div className="flex items-center justify-between p-4">
              <span>帮助中心</span>
              <i className="fas fa-chevron-right text-gray-500"></i>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full mt-8 p-4 text-red-500 bg-white/5 rounded-xl"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}

export default Settings; 