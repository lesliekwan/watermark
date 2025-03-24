import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Editor from './pages/Editor';
import Templates from './pages/Templates';
import Profile from './pages/Profile';
import MyWorks from './pages/subpages/MyWorks';
import MyFavorites from './pages/subpages/MyFavorites';
import Settings from './pages/subpages/Settings';
import BottomNav from './components/BottomNav';
import TextEditor from './pages/subpages/TextEditor';
import StickerEditor from './pages/subpages/StickerEditor';
import DrawEditor from './pages/subpages/DrawEditor';
import MusicEditor from './pages/subpages/MusicEditor';
import TransitionEditor from './pages/subpages/TransitionEditor';
import PipEditor from './pages/subpages/PipEditor';
import { UserProvider } from './contexts/UserContext';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <UserProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-[#1a1c2e]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* 编辑器子路由 */}
            <Route path="/editor/text" element={<TextEditor />} />
            <Route path="/editor/sticker" element={<StickerEditor />} />
            <Route path="/editor/draw" element={<DrawEditor />} />
            <Route path="/editor/music" element={<MusicEditor />} />
            <Route path="/editor/transition" element={<TransitionEditor />} />
            <Route path="/editor/pip" element={<PipEditor />} />
            
            {/* 个人中心子路由 */}
            <Route path="/profile/works" element={<MyWorks />} />
            <Route path="/profile/favorites" element={<MyFavorites />} />
            <Route path="/profile/settings" element={<Settings />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App; 