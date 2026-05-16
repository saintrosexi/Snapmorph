import React, { useState, useEffect, useRef } from 'react';
import { Camera, Sparkles, User as UserIcon, Share2, Zap, LayoutGrid, Copy, History, Settings, ExternalLink, Upload, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Template {
  id: string;
  title: string;
  category: string;
  previewAfterUrl: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'refer' | 'profile'>('create');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [customPrompt, setCustomPrompt] = useState('');
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [tokens, setTokens] = useState(3);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTemplates([
      { id: '1', title: 'Анкета HH.ru', category: 'Полезное', previewAfterUrl: '/templates/hh_ru.png' },
      { id: '2', title: 'Cyberpunk 2077', category: 'Веселье', previewAfterUrl: '/templates/cyberpunk.png' },
      { id: '3', title: 'GTA VI Style', category: 'В тренде', previewAfterUrl: '/templates/gta_vi.png' },
      { id: '4', title: 'Кино-эффект', category: 'Полезное', previewAfterUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
    ]);
  }, []);

  const handleGenerate = async () => {
    if (!userPhoto && !customPrompt) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      alert("Магия началась! Вы можете закрыть приложение, бот пришлет фото прямо в чат.");
      setSelectedTemplate(null);
      setUserPhoto(null);
      setCustomPrompt('');
    }, 2000);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUserPhoto(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={onFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center border-b border-white/5 sticky top-0 bg-neutral-950/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <span className="font-bold text-lg tracking-tight">PicCreate</span>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <Zap size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-sm">{tokens} Токенов</span>
        </div>
      </header>

      <main className="px-6 py-8 pb-32 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'create' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                  Создай свой стиль
                </h1>
                <p className="text-neutral-400">Выберите шаблон или опишите свой образ.</p>
              </div>

              {/* Step 1: Template/Prompt */}
              <div className="mb-6 bg-white/5 p-4 rounded-2xl border border-white/10 focus-within:border-purple-500/50 transition-colors">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2 block">Свой запрос</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => {
                    setCustomPrompt(e.target.value);
                    if (e.target.value) setSelectedTemplate(null);
                  }}
                  placeholder="Например: 'Я в костюме космонавта на Марсе...'"
                  className="w-full bg-transparent border-none focus:ring-0 text-neutral-200 placeholder:text-neutral-600 resize-none h-20"
                />
              </div>

              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {['Все', 'В тренде', 'Полезное', 'Веселье'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full border transition-all text-sm font-medium whitespace-nowrap ${
                      selectedCategory === cat 
                      ? 'bg-purple-600 border-purple-500 text-white shadow-lg' 
                      : 'bg-white/5 border-white/10 text-neutral-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {templates
                  .filter(t => selectedCategory === 'Все' || t.category === selectedCategory)
                  .map((template) => (
                  <motion.div
                    key={template.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedTemplate(template);
                      setCustomPrompt('');
                    }}
                    className={`relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer border-2 transition-all duration-300 ${
                      selectedTemplate?.id === template.id ? 'border-purple-500 ring-4 ring-purple-500/20' : 'border-white/5'
                    }`}
                  >
                    <img src={template.previewAfterUrl} alt={template.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1 block">
                        {template.category}
                      </span>
                      <h3 className="font-semibold text-sm text-white/90">{template.title}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Step 2: Photo Upload (Only if template or prompt is selected) */}
              {(selectedTemplate || customPrompt) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 bg-purple-500/10 p-6 rounded-3xl border border-purple-500/20 text-center"
                >
                  <h3 className="font-bold text-lg mb-4">Шаг 2: Загрузи своё фото</h3>
                  {userPhoto ? (
                    <div className="flex items-center justify-center gap-3 text-green-400 bg-green-500/10 py-3 rounded-2xl border border-green-500/20">
                      <CheckCircle2 size={24} />
                      <span className="font-bold">Фото выбрано!</span>
                      <button onClick={() => setUserPhoto(null)} className="text-xs underline text-neutral-500 ml-2">Сбросить</button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-4 bg-white/10 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center gap-2 hover:bg-white/20 transition-all"
                    >
                      <Upload size={32} className="text-purple-500" />
                      <span className="font-semibold">Выбрать селфи</span>
                    </button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'refer' && (
            <motion.div key="refer" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="text-center">
              <div className="w-20 h-20 bg-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6"><Share2 size={40} className="text-purple-500" /></div>
              <h1 className="text-2xl font-bold mb-3">Приглашай друзей</h1>
              <p className="text-neutral-400 mb-8">Получай по <span className="text-white font-bold">+3 токена</span> за друга.</p>
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-8">
                <div className="text-sm text-neutral-500 mb-2">Твоя ссылка</div>
                <div className="flex items-center gap-3 bg-black/40 p-3 rounded-xl border border-white/5">
                  <code className="text-xs text-purple-300 overflow-hidden text-ellipsis whitespace-nowrap">t.me/PicCreateBot?start=ref_12345</code>
                  <button className="p-2 bg-purple-600 rounded-lg shrink-0"><Copy size={16} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10"><div className="text-neutral-500 text-xs font-bold uppercase mb-1">Приглашено</div><div className="text-2xl font-bold">12</div></div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10"><div className="text-neutral-500 text-xs font-bold uppercase mb-1">Заработано</div><div className="text-2xl font-bold text-yellow-400">36 ⚡</div></div>
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-neutral-800 flex items-center justify-center border border-white/10"><UserIcon size={32} className="text-neutral-500" /></div>
                <div><h1 className="text-xl font-bold">Александр</h1><p className="text-neutral-500 text-sm">@sanek_tg</p></div>
                <button className="ml-auto p-2 bg-white/5 rounded-xl border border-white/10"><Settings size={20} className="text-neutral-400" /></button>
              </div>
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><History size={18} className="text-purple-500" />История</h2>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 bg-neutral-800 rounded-lg flex items-center justify-center"><ExternalLink size={20} className="text-neutral-600" /></div>
                    <div className="flex-1"><div className="font-semibold text-sm">Анкета HH.ru</div><div className="text-neutral-500 text-xs">16 мая, 10:45</div></div>
                    <div className="text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded">Готово</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent z-50">
        <AnimatePresence mode="wait">
          {userPhoto && activeTab === 'create' ? (
            <motion.button
              key="action"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              onClick={handleGenerate}
              disabled={isUploading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_0_30px_-5px_rgba(147,51,234,0.5)] active:scale-[0.98] transition-all"
            >
              {isUploading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Sparkles size={24} /></motion.div>
              ) : (
                <Camera size={24} />
              )}
              {isUploading ? 'Генерируем...' : 'Создать шедевр'}
            </motion.button>
          ) : (
            <motion.div key="nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-around items-center bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl py-3 shadow-2xl">
              <button onClick={() => setActiveTab('create')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'create' ? 'text-purple-500' : 'text-neutral-500'}`}><LayoutGrid size={24} /><span className="text-[10px] font-bold uppercase tracking-widest">Создать</span></button>
              <button onClick={() => setActiveTab('refer')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'refer' ? 'text-purple-500' : 'text-neutral-500'}`}><Share2 size={24} /><span className="text-[10px] font-bold uppercase tracking-widest">Друзья</span></button>
              <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-purple-500' : 'text-neutral-500'}`}><UserIcon size={24} /><span className="text-[10px] font-bold uppercase tracking-widest">Профиль</span></button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
