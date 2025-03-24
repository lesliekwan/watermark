import { Link } from 'react-router-dom';

function MyWorks() {
  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white pb-16">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <Link to="/profile" className="text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </Link>
        <h1 className="text-lg font-medium">我的作品</h1>
        <button className="w-8 h-8 flex items-center justify-center">
          <i className="fas fa-ellipsis-v text-white/80"></i>
        </button>
      </div>

      {/* 分类标签 */}
      <div className="px-4 py-2 flex space-x-4">
        <button className="px-4 py-1 bg-blue-500 text-white rounded-full">全部</button>
        <button className="px-4 py-1 bg-white/10 text-white/80 rounded-full">已发布</button>
        <button className="px-4 py-1 bg-white/10 text-white/80 rounded-full">草稿</button>
      </div>

      {/* 作品列表 */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {[1,2,3,4].map(item => (
          <div key={item} className="bg-white/5 rounded-xl overflow-hidden">
            <div className="aspect-video bg-black/30 relative">
              <img 
                src={`https://picsum.photos/300/200?random=${item}`}
                alt="作品预览"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-0.5 rounded text-xs">
                00:30
              </div>
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium">作品标题</h3>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                <span>2024-03-23</span>
                <div className="flex items-center space-x-2">
                  <i className="fas fa-eye"></i>
                  <span>1.2k</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyWorks; 