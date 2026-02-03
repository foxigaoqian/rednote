import React from 'react';
import { 
  LayoutDashboard, PenTool, Image as ImageIcon, Calendar, Settings, HelpCircle, Copy,
  MessageSquare, Newspaper, Feather, Globe
} from 'lucide-react';

export type ViewType = 'home' | 'editor' | 'image-gen' | 'calendar' | 'settings' | 'viral-copy' | 'wechat' | 'toutiao' | 'baijia' | 'sohu';

interface SidebarProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const menuItemClass = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
      isActive
        ? 'bg-primary/10 text-primary font-medium'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
    }`;

  const sectionHeaderClass = "px-3 mt-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between p-4 h-full shrink-0 z-20 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div 
            className="bg-center bg-no-repeat bg-cover rounded-full h-10 w-10 shrink-0 border border-gray-100" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDxFPLG3zdgt6rR8a109irnRreVMg8laolDC5uDziJYzpOtY3JISZ6rB8I1Pv3PIfnWXF3j3Sa1nT4PJdMwe3xsLjK57EG8RBP8iVUX63MM3USQ--l0ZkVVMmqMTE-bHLY70y0imiz4JY7oKLIjXkPc1EOa-SfLv3gCVwWEfww4pYgcGKKcv9g9Kq15Kz7eD8znwlGlJjMu20fcMnahqKlaVJdWSqCxJFoAPIyvE0WvTqxi_LYJsnYVBUJDigQ2W-KGpWhfjzDGA4Y")' }}
          ></div>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold leading-tight">创作工作室</h1>
            <p className="text-primary text-xs font-medium">全平台版</p>
          </div>
        </div>
        
        <nav className="flex flex-col gap-1">
          <div className={sectionHeaderClass}>核心功能</div>
          <div onClick={() => onNavigate('home')} className={menuItemClass(activeView === 'home')}>
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium">控制台</span>
          </div>
          <div onClick={() => onNavigate('editor')} className={menuItemClass(activeView === 'editor')}>
            <PenTool size={20} />
            <span className="text-sm font-medium">小红书创作</span>
          </div>
          <div onClick={() => onNavigate('viral-copy')} className={menuItemClass(activeView === 'viral-copy')}>
            <Copy size={20} />
            <span className="text-sm font-medium">爆款模仿</span>
          </div>

          <div className={sectionHeaderClass}>多平台矩阵</div>
          <div onClick={() => onNavigate('wechat')} className={menuItemClass(activeView === 'wechat')}>
            <MessageSquare size={20} />
            <span className="text-sm font-medium">公众号创作</span>
          </div>
          <div onClick={() => onNavigate('toutiao')} className={menuItemClass(activeView === 'toutiao')}>
            <Newspaper size={20} />
            <span className="text-sm font-medium">今日头条</span>
          </div>
          <div onClick={() => onNavigate('baijia')} className={menuItemClass(activeView === 'baijia')}>
            <Globe size={20} />
            <span className="text-sm font-medium">百家号</span>
          </div>
          <div onClick={() => onNavigate('sohu')} className={menuItemClass(activeView === 'sohu')}>
            <Feather size={20} />
            <span className="text-sm font-medium">搜狐号</span>
          </div>

          <div className={sectionHeaderClass}>工具 & 设置</div>
          <div onClick={() => onNavigate('image-gen')} className={menuItemClass(activeView === 'image-gen')}>
            <ImageIcon size={20} />
            <span className="text-sm font-medium">AI 配图</span>
          </div>
          <div onClick={() => onNavigate('calendar')} className={menuItemClass(activeView === 'calendar')}>
            <Calendar size={20} />
            <span className="text-sm font-medium">发布日历</span>
          </div>
          <div onClick={() => onNavigate('settings')} className={menuItemClass(activeView === 'settings')}>
            <Settings size={20} />
            <span className="text-sm font-medium">设置</span>
          </div>
        </nav>
      </div>
      <div className="px-2 mt-4">
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-3 cursor-pointer hover:bg-gray-100 transition-colors">
          <HelpCircle size={20} className="text-gray-500" />
          <span className="text-sm text-gray-600 font-medium">帮助中心</span>
        </div>
      </div>
    </aside>
  );
};