import { Link } from 'react-router-dom';

function StickerEditor() {
  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <Link to="/editor" className="text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </Link>
        <h1 className="text-lg font-medium">添加贴图</h1>
        <button className="text-blue-400">完成</button>
      </div>

      {/* 预览区域 */}
      <div className="relative aspect-video bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center">
            <i className="fas fa-plus text-white/50 text-2xl"></i>
          </div>
        </div>
      </div>

      {/* 贴图分类 */}
      <div className="p-4">
        <div className="flex space-x-3 overflow-x-auto py-2">
          <button className="px-4 py-1 bg-blue-500 rounded-full text-sm whitespace-nowrap">热门</button>
          <button className="px-4 py-1 bg-white/10 rounded-full text-sm whitespace-nowrap">表情</button>
          <button className="px-4 py-1 bg-white/10 rounded-full text-sm whitespace-nowrap">装饰</button>
          <button className="px-4 py-1 bg-white/10 rounded-full text-sm whitespace-nowrap">节日</button>
        </div>

        {/* 贴图列表 */}
        <div className="mt-4 grid grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(item => (
            <button key={item} className="aspect-square bg-white/10 rounded-lg p-2">
              <img 
                src={`https://picsum.photos/100/100?random=${item}`}
                alt="贴图"
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StickerEditor; 