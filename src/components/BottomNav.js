import { Link, useLocation } from 'react-router-dom';

function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1c2e] border-t border-gray-800">
      <div className="flex justify-around py-2">
        <Link 
          to="/" 
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/' ? 'text-blue-400' : 'text-gray-500'
          }`}
        >
          <i className="fas fa-home text-xl"></i>
          <span className="text-xs mt-1">首页</span>
        </Link>
        <Link 
          to="/templates" 
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/templates' ? 'text-blue-400' : 'text-gray-500'
          }`}
        >
          <i className="fas fa-shapes text-xl"></i>
          <span className="text-xs mt-1">模板</span>
        </Link>
        <Link 
          to="/editor" 
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/editor' ? 'text-blue-400' : 'text-gray-500'
          }`}
        >
          <i className="fas fa-plus text-xl"></i>
          <span className="text-xs mt-1">创作</span>
        </Link>
        <Link 
          to="/profile" 
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/profile' ? 'text-blue-400' : 'text-gray-500'
          }`}
        >
          <i className="fas fa-user text-xl"></i>
          <span className="text-xs mt-1">我的</span>
        </Link>
      </div>
    </div>
  );
}

export default BottomNav; 