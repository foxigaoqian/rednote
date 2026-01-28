import React, { useState } from 'react';
import { Search, Sparkles, Star, Clock, Heart, Edit3 } from 'lucide-react';
import { TEMPLATES, Template } from '../types';

interface HomeProps {
  onSelectTemplate: (template: Template) => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['全部', '美妆护肤', '数码科技', '美食餐饮', '旅游攻略', '知识科普', '生活方式'];

  const filteredTemplates = TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === '全部' || template.category === selectedCategory;
    const matchesSearch = template.title.includes(searchQuery) || template.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur-md px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
            <Sparkles size={24} />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">RedBook AI</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-600 transition-colors relative">
               <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white"></span>
               <span className="material-symbols-outlined">notifications</span>
            </button>
            <div 
              className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-gray-100" 
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA_gN2FIWF4V9ULs7VdZcqt-gbCL7UnEI8LJJTpsUlEtgwuNIWhS9U1nt8VeONENt-QJ19waC6Cjw9Q7MNpcNnAVj5YM3Xy_4X7t_Ni-Fh3aB-vZJ5ygyZEVK6cNi41agEnQsSNX1fQvfVDdkzUk32uGJjKg2j00IAKkVFgxpJ9EeGca9VbPEmO3aqhKBgE2j9lZ4Pu0GLXe10aEeixbAdYxgbUqTXjgRr6pYWKqtF-05jSLeTgDgAJTHHSz9yqIXAXujlEno0LE5k")' }}
            ></div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-10 max-w-7xl mx-auto w-full">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              创作小红书爆款内容
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
              选择高转化率的结构开启您的下一篇笔记。告别空白页面的焦虑。
            </p>
          </div>

          <div className="flex flex-col gap-6 mb-10">
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-slate-400" />
              </div>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm" 
                placeholder="搜索护肤、科技、旅行笔记模板..." 
                type="text" 
              />
            </div>
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat, idx) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-9 px-5 rounded-lg text-sm font-medium transition-colors active:scale-95 ${
                    selectedCategory === cat 
                      ? 'bg-slate-900 text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-slate-600 hover:border-primary/50 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {filteredTemplates.map((template) => (
              <div key={template.id} className="group flex flex-col rounded-xl bg-white border border-gray-200 p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="relative h-40 w-full rounded-lg bg-gray-100 mb-4 overflow-hidden">
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url("${template.imageUrl}")` }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded text-slate-900">
                    {template.category}
                  </div>
                </div>
                <div className="flex items-start justify-between mb-2">
                  {template.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-600/20">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{template.title}</h3>
                <p className="text-sm text-slate-500 mb-5 line-clamp-2">
                  {template.description}
                </p>
                <button 
                  onClick={() => onSelectTemplate(template)}
                  className="mt-auto w-full py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Edit3 size={18} />
                  立即使用
                </button>
              </div>
            ))}
            {filteredTemplates.length === 0 && (
              <div className="col-span-full py-20 text-center text-gray-400">
                没有找到匹配的模板
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
