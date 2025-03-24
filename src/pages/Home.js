import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white p-4">
      {/* 顶部标题 */}
      <h1 className="text-2xl font-medium bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4] bg-clip-text text-transparent py-4">
        视频编辑
      </h1>

      {/* 功能卡片区域 */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Link 
          to="/editor" 
          className="aspect-square flex flex-col items-center justify-center bg-[#1e2642] rounded-2xl p-6"
        >
          <div className="w-20 h-20 rounded-full bg-[#2a3366] flex items-center justify-center mb-4">
            <i className="fas fa-video text-blue-400 text-3xl"></i>
          </div>
          <span className="text-lg">开始创作</span>
        </Link>

        <Link 
          to="/templates" 
          className="aspect-square flex flex-col items-center justify-center bg-[#1e3642] rounded-2xl p-6"
        >
          <div className="w-20 h-20 rounded-full bg-[#2a4d66] flex items-center justify-center mb-4">
            <i className="fas fa-shapes text-green-400 text-3xl"></i>
          </div>
          <span className="text-lg">模板中心</span>
        </Link>
      </div>
    </div>
  );
}

export default Home; 