import React from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('zh-CN', { month: 'long', year: 'numeric' });
  
  // Mock data
  const posts = [
    { day: 5, title: 'YSL 口红测评', status: 'published', type: '美妆' },
    { day: 12, title: '周末探店 Vlog', status: 'scheduled', type: '生活' },
    { day: 18, title: '春季穿搭指南', status: 'draft', type: '穿搭' },
    { day: 25, title: 'MacBook Pro 使用技巧', status: 'scheduled', type: '数码' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'published': return '已发布';
      case 'scheduled': return '待发布';
      case 'draft': return '草稿';
      default: return '';
    }
  };

  return (
    <div className="flex-1 h-full bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">发布日历</h1>
            <p className="text-gray-500 mt-1">规划你的内容发布时间表，保持持续更新。</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
            <Plus size={20} />
            新建计划
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">{currentMonth}</h2>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
              <button className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
            </div>
          </div>

          {/* Grid Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {days.map(day => (
              <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Grid Body */}
          <div className="grid grid-cols-7 auto-rows-[140px] divide-x divide-gray-200">
             {/* Empty start days logic skipped for simplicity, starting mock from day 1 */}
             {Array.from({ length: 30 }).map((_, i) => {
               const day = i + 1;
               const post = posts.find(p => p.day === day);
               const isToday = day === currentDate.getDate();

               return (
                 <div key={i} className={`p-2 relative group hover:bg-gray-50 transition-colors ${isToday ? 'bg-primary/5' : ''}`}>
                   <span className={`text-sm font-medium inline-block w-7 h-7 text-center leading-7 rounded-full ${isToday ? 'bg-primary text-white' : 'text-gray-700'}`}>
                     {day}
                   </span>
                   {post && (
                     <div className={`mt-2 p-2 rounded-lg border text-xs cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(post.status)}`}>
                       <div className="font-bold truncate">{post.title}</div>
                       <div className="flex justify-between items-center mt-1 opacity-80">
                         <span>{post.type}</span>
                         <span>{getStatusText(post.status)}</span>
                       </div>
                     </div>
                   )}
                   <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white rounded-full text-gray-400 hover:text-primary transition-all shadow-sm">
                     <Plus size={16} />
                   </button>
                 </div>
               );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};
