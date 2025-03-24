import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

function Profile() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <div className="min-h-screen bg-[#1a1c2e] flex items-center justify-center">
      <div className="text-white">加载中...</div>
    </div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1a1c2e] flex flex-col items-center justify-center p-4">
        <div className="text-center text-white">
          <i className="fas fa-user-circle text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-xl mb-4">请先登录</h2>
          <Link 
            to="/login"
            className="inline-block px-8 py-3 bg-blue-500 text-white rounded-lg font-medium"
          >
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white pb-16">
      {/* 用户信息 */}
      <div className="p-4">
        <div className="flex items-start">
          <div className="relative">
            <img 
              src={user.avatar}
              alt="头像" 
              className="w-20 h-20 rounded-full object-cover border-2 border-white/10"
            />
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <i className="fas fa-camera text-xs"></i>
            </button>
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-xl font-medium">{user.name}</h2>
            <p className="text-gray-400 text-sm mt-1">ID: {user.id}</p>
            <button className="mt-2 px-3 py-1 bg-white/10 rounded-full text-sm">
              编辑资料
            </button>
          </div>
        </div>

        {/* 数据统计 */}
        <div className="mt-6 bg-white/5 rounded-xl p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-xl font-medium">{user.stats.works}</div>
            <div className="text-sm text-gray-400 mt-1">作品</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-medium">{user.stats.favorites}</div>
            <div className="text-sm text-gray-400 mt-1">收藏</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-medium">{user.stats.likes}</div>
            <div className="text-sm text-gray-400 mt-1">获赞</div>
          </div>
        </div>
      </div>

      {/* 功能列表 */}
      <div className="px-4 mt-6">
        <div className="bg-white/5 rounded-xl overflow-hidden">
          <div className="divide-y divide-white/5">
            <Link to="/profile/works" className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <i className="fas fa-video text-blue-400 w-6"></i>
                <span className="ml-3">我的作品</span>
              </div>
              <i className="fas fa-chevron-right text-gray-500"></i>
            </Link>
            <Link to="/profile/favorites" className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <i className="fas fa-heart text-red-400 w-6"></i>
                <span className="ml-3">我的收藏</span>
              </div>
              <i className="fas fa-chevron-right text-gray-500"></i>
            </Link>
            <Link to="/profile/settings" className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <i className="fas fa-cog text-gray-400 w-6"></i>
                <span className="ml-3">设置</span>
              </div>
              <i className="fas fa-chevron-right text-gray-500"></i>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 