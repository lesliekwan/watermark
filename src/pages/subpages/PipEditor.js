import { Link } from 'react-router-dom';

function PipEditor() {
  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <Link to="/editor" className="text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </Link>
        <h1 className="text-lg font-medium">画中画</h1>
        <button className="text-blue-400">完成</button>
      </div>

      {/* 预览区域 */}
      <div className="relative aspect-video bg-black">
        <div className="absolute right-4 bottom-4 w-32 aspect-video bg-white/20 rounded-lg border-2 border-blue-500">
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="fas fa-plus text-white/50"></i>
          </div>
        </div>
      </div>

      {/* 控制面板 */}
      <div className="p-4">
        <div className="bg-white/5 rounded-xl p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400">大小调整</label>
            <input type="range" className="w-full mt-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">透明度</label>
            <input type="range" className="w-full mt-2" />
          </div>
          <div>
            <label className="text-sm text-gray-400">边框样式</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              <button className="aspect-square bg-white/10 rounded-lg"></button>
              <button className="aspect-square bg-white/10 rounded-lg border-2 border-white/30"></button>
              <button className="aspect-square bg-white/10 rounded-lg border-2 border-dashed border-white/30"></button>
              <button className="aspect-square bg-white/10 rounded-lg border-4 border-white/30"></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PipEditor; 