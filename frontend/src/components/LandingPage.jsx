import React from 'react';
import { Sparkles, Zap, Shield, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-orange-500/30">
      {/* Hero Section */}
      <header className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-orange-500 text-sm font-medium mb-8 animate-bounce">
            <Sparkles size={16} />
            <span>The Future of Content Creation is Here</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
            Creator360 <br /> AI Studio
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            เปลี่ยนลิงก์สินค้าให้เป็นวิดีโอรีวิวระดับมืออาชีพภายในไม่กี่วินาที ด้วยพลังของ Gemini AI และระบบอัตโนมัติที่สมบูรณ์แบบที่สุด
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={onGetStarted}
              className="bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-90 text-white px-10 py-7 text-lg rounded-full group"
            >
              เริ่มต้นใช้งานฟรี
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" className="border-neutral-800 text-white px-10 py-7 text-lg rounded-full hover:bg-neutral-900">
              ดูตัวอย่างวิดีโอ
            </Button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 bg-neutral-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="text-orange-500" />,
                title: "รวดเร็วทันใจ",
                desc: "สร้างสคริปต์และวิดีโอได้ในคลิกเดียว ไม่ต้องเสียเวลาตัดต่อเอง"
              },
              {
                icon: <BarChart3 className="text-purple-500" />,
                title: "เน้นยอดขาย",
                desc: "AI วิเคราะห์จุดขายของสินค้าและสร้าง Hook ที่หยุดนิ้วคนดูได้จริง"
              },
              {
                icon: <Shield className="text-blue-500" />,
                title: "ระบบอัตโนมัติ",
                desc: "เชื่อมต่อ LINE OA แจ้งเตือนและส่งงานให้คุณได้ทุกที่ทุกเวลา"
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-16">เลือกแผนที่เหมาะกับคุณ</h2>
          <div className="p-12 rounded-[2.5rem] bg-gradient-to-b from-neutral-900 to-black border border-orange-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-black px-6 py-1 rounded-bl-2xl font-bold text-sm">
              POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Creator Pro</h3>
            <div className="text-5xl font-black mb-8">฿990 <span className="text-lg text-neutral-500 font-normal">/เดือน</span></div>
            <ul className="text-left space-y-4 mb-12">
              {[
                "สร้างวิดีโอไม่จำกัด",
                "เชื่อมต่อ LINE OA ส่วนตัว",
                "วิเคราะห์สินค้าเชิงลึกด้วย Gemini 2.0",
                "Support ระดับ VIP 24/7"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-neutral-300">
                  <CheckCircle2 className="text-orange-500" size={20} />
                  {item}
                </li>
              ))}
            </ul>
            <Button 
              onClick={onGetStarted}
              className="w-full bg-white text-black hover:bg-neutral-200 py-6 text-lg font-bold rounded-2xl"
            >
              สมัครสมาชิกตอนนี้
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-900 text-center text-neutral-500 text-sm">
        <p>© 2026 Creator360.Studio - All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
