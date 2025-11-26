import React, { useState, useEffect } from 'react';
import { Bot, Zap, Target, TrendingUp, Users, MessageCircle, Clock, Shield, Sparkles, ChevronRight, Play, Check, Star } from 'lucide-react';

export default function FBAIBotLanding() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const industries = [
    { icon: '🏠', name: '房仲', growth: '+243%', color: 'from-blue-500 to-cyan-500' },
    { icon: '🚗', name: '車仲', growth: '+156%', color: 'from-purple-500 to-pink-500' },
    { icon: '💰', name: '貸款', growth: '+189%', color: 'from-yellow-500 to-orange-500' },
    { icon: '🎮', name: '遊戲', growth: '+892%', color: 'from-green-500 to-emerald-500' }
  ];

  const features = [
    { icon: <Zap className="w-8 h-8" />, title: '閃電發文', desc: '1秒發送100+社團' },
    { icon: <Target className="w-8 h-8" />, title: '精準投放', desc: 'AI智慧鎖定目標' },
    { icon: <Shield className="w-8 h-8" />, title: '防封技術', desc: '99.9%帳號安全' },
    { icon: <Clock className="w-8 h-8" />, title: '24/7運作', desc: '睡覺也在賺錢' }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite'
        }} />
        
        {/* Glowing Orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Mouse Follow Effect */}
        <div 
          className="absolute w-96 h-96 bg-gradient-radial from-cyan-500/20 to-transparent rounded-full blur-2xl transition-all duration-300"
          style={{
            left: mousePos.x - 192,
            top: mousePos.y - 192,
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full mb-8 backdrop-blur-xl">
            <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="text-sm font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI驅動 · 台灣首創 · 5000+企業使用
            </span>
          </div>

          {/* Main Title with 3D Effect */}
          <h1 className="text-7xl md:text-9xl font-black mb-6 relative">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              蓋好賣 AI
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent blur-2xl opacity-50 -z-10">
              蓋好賣 AI
            </div>
          </h1>

          {/* AI Bot Animation */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center animate-float shadow-2xl shadow-blue-500/50">
                <Bot className="w-16 h-16 text-white animate-pulse" />
              </div>
              {/* Orbiting Icons */}
              {[0, 120, 240].map((deg, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6"
                  style={{
                    animation: `orbit 3s linear infinite`,
                    animationDelay: `${i * 1}s`
                  }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-2xl md:text-4xl font-bold text-gray-300 mb-12 max-w-4xl mx-auto">
            FB自動發文機器人
            <br />
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              讓業績暴增 243%
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
              onClick={() => setShowForm(true)}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                免費試用 3 天
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="group px-8 py-4 border-2 border-blue-500/50 rounded-full font-bold text-lg backdrop-blur-xl hover:bg-blue-500/10 transition-all flex items-center gap-2"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              觀看實戰影片
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { num: '5000+', label: '使用企業', icon: <Users /> },
              { num: '24/7', label: '全天運作', icon: <Clock /> },
              { num: '99.9%', label: '安全率', icon: <Shield /> },
              { num: '243%', label: '業績成長', icon: <TrendingUp /> }
            ].map((stat, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/60 transition-all">
                  <div className="text-blue-400 mb-2 flex justify-center">
                    {React.cloneElement(stat.icon, { className: 'w-8 h-8' })}
                  </div>
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.num}
                  </div>
                  <div className="text-gray-400 text-sm font-semibold">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-center mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              超能力功能
            </span>
          </h2>
          <p className="text-xl text-gray-400 text-center mb-16">AI驅動的自動化行銷系統</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-black/60 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-8 hover:border-blue-500 transition-all hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {React.cloneElement(feature.icon, { className: 'text-white' })}
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-center mb-16">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              適用產業
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry, i) => (
              <div 
                key={i}
                className="group relative cursor-pointer"
                onClick={() => setActiveTab(i)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${industry.color} rounded-3xl blur-xl opacity-50 group-hover:opacity-100 transition-all`} />
                <div className="relative bg-black/80 backdrop-blur-xl border-2 border-transparent group-hover:border-white/50 rounded-3xl p-8 transition-all hover:-translate-y-2">
                  <div className="text-6xl mb-4">{industry.icon}</div>
                  <h3 className="text-2xl font-bold mb-2">{industry.name}</h3>
                  <div className={`text-4xl font-black bg-gradient-to-r ${industry.color} bg-clip-text text-transparent`}>
                    {industry.growth}
                  </div>
                  <p className="text-gray-400 mt-2">業績成長</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-center mb-16">
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              真實見證
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: '林經理', role: '房仲業', rating: 5, text: '3個月成交量從5件到9件！24小時自動工作太強大了！' },
              { name: '陳老闆', role: '中古車商', rating: 5, text: '詢問量暴增156%，每天都有客戶主動來看車！' },
              { name: '王顧問', role: '貸款業務', rating: 5, text: '一個月軟體費用，一筆單就賺回來了！' }
            ].map((testimonial, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-black/60 backdrop-blur-xl border border-pink-500/30 rounded-3xl p-8 hover:border-pink-500 transition-all">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                      {testimonial.name[0]}
                    </div>
                    <div>
                      <div className="font-bold">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-3xl opacity-50" />
            <div className="relative bg-black/80 backdrop-blur-xl border-2 border-blue-500/50 rounded-3xl p-16">
              <h2 className="text-5xl md:text-6xl font-black mb-6">
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  限時優惠
                </span>
              </h2>
              <p className="text-2xl text-gray-300 mb-8">
                現在註冊立即享有 <span className="text-yellow-400 font-bold">3天免費試用</span>
                <br />
                首月 <span className="text-yellow-400 font-bold">5折優惠</span>
              </p>
              
              <button 
                onClick={() => setShowForm(true)}
                className="group relative px-12 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full font-black text-2xl text-black overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/50"
              >
                <span className="relative z-10 flex items-center gap-3 justify-center">
                  <Sparkles className="w-7 h-7" />
                  立即免費試用
                  <ChevronRight className="w-7 h-7 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>

              <p className="text-gray-400 mt-8">
                ✓ 無需綁卡 ✓ 隨時取消 ✓ 專人指導
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <div className="relative max-w-2xl w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-3xl blur-2xl" />
            <div className="relative bg-black/90 backdrop-blur-xl border-2 border-blue-500/50 rounded-3xl p-8 md:p-12">
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
              >
                ✕
              </button>
              
              <h3 className="text-4xl font-black mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                開始免費試用
              </h3>
              
              <div className="space-y-6">
                <input 
                  type="text" 
                  placeholder="姓名"
                  className="w-full px-6 py-4 bg-white/5 border-2 border-blue-500/30 rounded-2xl focus:border-blue-500 focus:outline-none transition-all backdrop-blur-xl"
                />
                <input 
                  type="tel" 
                  placeholder="手機號碼"
                  className="w-full px-6 py-4 bg-white/5 border-2 border-blue-500/30 rounded-2xl focus:border-blue-500 focus:outline-none transition-all backdrop-blur-xl"
                />
                <input 
                  type="email" 
                  placeholder="電子信箱"
                  className="w-full px-6 py-4 bg-white/5 border-2 border-blue-500/30 rounded-2xl focus:border-blue-500 focus:outline-none transition-all backdrop-blur-xl"
                />
                <select 
                  className="w-full px-6 py-4 bg-white/5 border-2 border-blue-500/30 rounded-2xl focus:border-blue-500 focus:outline-none transition-all backdrop-blur-xl"
                >
                  <option value="">選擇產業</option>
                  <option value="房仲">🏠 房仲業</option>
                  <option value="車仲">🚗 車仲業</option>
                  <option value="貸款">💰 貸款業</option>
                  <option value="遊戲">🎮 遊戲私服</option>
                  <option value="其他">📋 其他</option>
                </select>
                
                <button 
                  onClick={() => {
                    alert('註冊成功！試用帳號將於5分鐘內寄送至您的信箱 ✅');
                    setShowForm(false);
                  }}
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-xl hover:scale-105 transition-all hover:shadow-2xl hover:shadow-blue-500/50"
                >
                  立即開始 🚀
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(80px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
        }
        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </div>
  );
}