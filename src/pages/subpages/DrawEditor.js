import { Link } from 'react-router-dom';

function DrawEditor() {
  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <Link to="/editor" className="text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </Link>
        <h1 className="text-lg font-medium">涂鸦</h1>
        <button className="text-blue-400">完成</button>
      </div>

      {/* 预览区域 */}
      <div className="relative aspect-video bg-black">
        <canvas className="w-full h-full"></canvas>
      </div>

      {/* 工具栏 */}
      <div className="p-4">
        <div className="bg-white/5 rounded-xl p-4">
          {/* 画笔设置 */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400">画笔粗细</label>
              <input type="range" className="w-full mt-2" min="1" max="20" />
            </div>
            <div>
              <label className="text-sm text-gray-400">画笔颜色</label>
              <div className="mt-2 flex space-x-2">
                <button className="w-8 h-8 rounded-full bg-white"></button>
                <button className="w-8 h-8 rounded-full bg-red-500"></button>
                <button className="w-8 h-8 rounded-full bg-yellow-500"></button>
                <button className="w-8 h-8 rounded-full bg-green-500"></button>
                <button className="w-8 h-8 rounded-full bg-blue-500"></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrawEditor; 