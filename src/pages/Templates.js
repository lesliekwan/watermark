import { useState } from 'react';
import { Link } from 'react-router-dom';

function Templates() {
  const [activeCategory, setActiveCategory] = useState('商务');
  
  // 分类数据
  const categories = [
    { id: 'business', name: '商务' },
    { id: 'travel', name: '旅行' },
    { id: 'entertainment', name: '娱乐' },
    { id: 'education', name: '教育' },
    { id: 'social', name: '社交' }
  ];

  // 模板数据
  const templates = [
    {
      id: 1,
      category: 'business',
      title: '商务简报',
      cover: 'https://picsum.photos/300/200?random=1',
      uses: '2.3k',
      likes: '458'
    },
    {
      id: 2,
      category: 'travel',
      title: '旅行日记',
      cover: 'https://picsum.photos/300/200?random=2',
      uses: '1.8k',
      likes: '326'
    },
    // 更多模板数据...
  ];

  return (
    <div className="min-h-screen bg-[#1a1c2e] text-white pb-16">
      {/* 顶部导航 */}
      <div className="px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-medium bg-gradient-to-r from-[#ff6b6b] to-[#4ecdc4] bg-clip-text text-transparent">
          模板中心
        </h1>
        <button className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">
          <i className="fas fa-search text-white/80"></i>
        </button>
      </div>

      {/* 分类标签栏 */}
      <div className="px-4 overflow-x-auto">
        <div className="flex space-x-3 py-4">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                activeCategory === category.name 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/10 text-white/80'
              }`}
              onClick={() => setActiveCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* 模板列表 */}
      <div className="px-4 grid grid-cols-2 gap-4">
        {templates
          .filter(template => template.category === activeCategory.toLowerCase())
          .map(template => (
            <Link 
              to={`/templates/${template.id}`} 
              key={template.id} 
              className="bg-[#1e2642] rounded-xl overflow-hidden"
            >
              <div className="aspect-video bg-black/30 relative">
                <img 
                  src={template.cover}
                  alt={template.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fas fa-play-circle text-white/80 text-3xl"></i>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium">{template.title}</h3>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span>使用 {template.uses}</span>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-heart"></i>
                    <span>{template.likes}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>

      {/* 空状态提示 */}
      {templates.filter(template => template.category === activeCategory.toLowerCase()).length === 0 && (
        <div className="px-4 py-8 text-center text-gray-400">
          <i className="fas fa-inbox text-3xl mb-2"></i>
          <p>该分类暂无模板</p>
        </div>
      )}
    </div>
  );
}

export default Templates; 