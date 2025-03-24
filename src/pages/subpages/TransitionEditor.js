import { Link } from 'react-router-dom';

function TransitionEditor() {
  const transitions = [
    { id: 1, name: '淡入淡出', icon: 'fa-fade' },
    { id: 2, name: '滑动', icon: 'fa-slide' },
    { id: 3, name: '缩放', icon: 'fa-expand' },
    { id: 4, name: '旋转', icon: 'fa-rotate' },
    { id: 5, name: '翻转', icon: 'fa-flip' }
  ];

  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <Link to="/editor" className="text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </Link>
        <h1 className="text-lg font-medium">转场效果</h1>
        <button className="text-blue-400">完成</button>
      </div>

      {/* 预览区域 */}
      <div className="relative aspect-video bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <i className="fas fa-random text-3xl text-gray-400"></i>
            <p className="mt-2 text-gray-400">预览转场效果</p>
          </div>
        </div>
      </div>

      {/* 转场效果列表 */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {transitions.map(transition => (
            <button 
              key={transition.id}
              className="aspect-square bg-white/10 rounded-xl flex flex-col items-center justify-center"
            >
              <i className={`fas ${transition.icon} text-2xl mb-2`}></i>
              <span className="text-sm">{transition.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TransitionEditor; 