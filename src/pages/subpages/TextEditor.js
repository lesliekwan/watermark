import { useState } from 'react';
import { Link } from 'react-router-dom';

function TextEditor() {
  const [text, setText] = useState('点击编辑文字');

  const handleTextChange = (e) => {
    setText(e.target.innerText);
  };

  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/20">
        <Link to="/editor" className="text-white">
          <i className="fas fa-arrow-left text-xl"></i>
        </Link>
        <h1 className="text-lg font-medium">添加文字</h1>
        <button className="text-blue-400">完成</button>
      </div>

      {/* 预览区域 */}
      <div className="relative aspect-video bg-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            contentEditable
            onInput={handleTextChange}
            suppressContentEditableWarning={true}
            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-shadow outline-none"
          >
            {text}
          </div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="p-4">
        <div className="bg-white/5 rounded-xl p-4 space-y-4">
          {/* 字体选择 */}
          <div>
            <label className="text-sm text-gray-400">字体</label>
            <select className="mt-2 w-full bg-white/10 rounded-lg p-3 text-white">
              <option>默认字体</option>
              <option>黑体</option>
              <option>楷体</option>
            </select>
          </div>

          {/* 字号调整 */}
          <div>
            <label className="text-sm text-gray-400">字号</label>
            <input 
              type="range" 
              min="12" 
              max="72" 
              className="w-full mt-2"
            />
          </div>

          {/* 颜色选择 */}
          <div>
            <label className="text-sm text-gray-400">颜色</label>
            <div className="mt-2 flex space-x-2">
              <button className="w-8 h-8 rounded-full bg-white"></button>
              <button className="w-8 h-8 rounded-full bg-blue-500"></button>
              <button className="w-8 h-8 rounded-full bg-green-500"></button>
              <button className="w-8 h-8 rounded-full bg-yellow-500"></button>
              <button className="w-8 h-8 rounded-full bg-red-500"></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextEditor; 