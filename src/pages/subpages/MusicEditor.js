import { Link } from 'react-router-dom';

function MusicEditor() {
  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <Link to="/editor" className="text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </Link>
        <h1 className="text-lg font-medium">添加音乐</h1>
        <button className="text-blue-400">完成</button>
      </div>

      {/* 搜索栏 */}
      <div className="p-4">
        <div className="flex items-center bg-white/10 rounded-full px-4 py-2">
          <i className="fas fa-search text-gray-400"></i>
          <input 
            type="search" 
            placeholder="搜索音乐" 
            className="ml-2 bg-transparent w-full outline-none text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* 音乐列表 */}
      <div className="flex-1">
        {[1,2,3,4,5].map(item => (
          <div key={item} className="flex items-center p-4 border-b border-white/10">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              <i className="fas fa-music text-gray-400"></i>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="font-medium">音乐标题 {item}</h3>
              <p className="text-sm text-gray-400 mt-1">音乐作者</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <i className="fas fa-play text-white"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MusicEditor; 