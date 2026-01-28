import React from 'react';
import { User, Bell, Lock, Globe, Moon } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="flex-1 h-full bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">设置</h1>
        
        <div className="flex flex-col gap-6">
          {/* Profile Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <User size={18} /> 个人资料
              </h2>
            </div>
            <div className="p-6 flex items-center gap-6">
              <div 
                className="w-20 h-20 rounded-full bg-gray-200 bg-cover bg-center border-4 border-white shadow-sm"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDxFPLG3zdgt6rR8a109irnRreVMg8laolDC5uDziJYzpOtY3JISZ6rB8I1Pv3PIfnWXF3j3Sa1nT4PJdMwe3xsLjK57EG8RBP8iVUX63MM3USQ--l0ZkVVMmqMTE-bHLY70y0imiz4JY7oKLIjXkPc1EOa-SfLv3gCVwWEfww4pYgcGKKcv9g9Kq15Kz7eD8znwlGlJjMu20fcMnahqKlaVJdWSqCxJFoAPIyvE0WvTqxi_LYJsnYVBUJDigQ2W-KGpWhfjzDGA4Y")' }}
              ></div>
              <div className="flex-1">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                    <input type="text" defaultValue="小红书创作达人" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
                    <input type="email" defaultValue="creator@example.com" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50" disabled />
                  </div>
                </div>
                <button className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:opacity-90">保存更改</button>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Globe size={18} /> 偏好设置
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">默认语气风格</p>
                  <p className="text-xs text-gray-500">新建笔记时的默认语气</p>
                </div>
                <select className="rounded-lg border border-gray-300 text-sm px-3 py-1.5 outline-none">
                  <option>种草风</option>
                  <option>专业风</option>
                  <option>随性风</option>
                </select>
              </div>
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">自动深色模式</p>
                  <p className="text-xs text-gray-500">跟随系统设置自动切换</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
