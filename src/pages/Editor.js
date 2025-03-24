import { useState } from 'react';
import { Link } from 'react-router-dom';

function Editor() {
  const [selectedTool, setSelectedTool] = useState(null);
  
  const tools = [
    { id: 'text', icon: 'fa-text', label: '文字', path: '/editor/text' },
    { id: 'sticker', icon: 'fa-images', label: '贴图', path: '/editor/sticker' },
    { id: 'draw', icon: 'fa-pencil', label: '涂鸦', path: '/editor/draw' },
    { id: 'music', icon: 'fa-music', label: '音乐', path: '/editor/music' },
    { id: 'transition', icon: 'fa-random', label: '转场', path: '/editor/transition' },
    { id: 'pip', icon: 'fa-clone', label: '画中画', path: '/editor/pip' }
  ];

  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white flex flex-col">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <Link to="/" className="text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </Link>
        <div className="flex space-x-3">
          <button className="px-4 py-1 bg-blue-500 rounded-full text-sm">
            预览
          </button>
          <button className="px-4 py-1 bg-green-500 rounded-full text-sm">
            保存
          </button>
        </div>
      </div>

      {/* 视频预览区 */}
      <div className="relative aspect-video bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <i className="fas fa-cloud-upload-alt text-3xl mb-2"></i>
            <p>点击上传视频</p>
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white/80 px-2 py-1 rounded text-xs">
          00:00 / 00:00
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-4 gap-4">
          {tools.map(tool => (
            <Link
              to={tool.path || '#'}
              key={tool.id}
              className={`aspect-square rounded-xl flex flex-col items-center justify-center ${
                selectedTool === tool.id ? 'bg-blue-500' : 'bg-white/5'
              }`}
            >
              <i className={`fas ${tool.icon} text-xl mb-2`}></i>
              <span className="text-xs">{tool.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* 时间轴 */}
      <div className="bg-black/30 backdrop-blur p-4">
        <div className="h-16 bg-white/5 rounded-xl relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
        </div>
      </div>
    </div>
  );
}

export default Editor; 