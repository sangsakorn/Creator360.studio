import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Video, History, Settings, LogOut, Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import AIStudio from './AIStudio';

const Dashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalVideos: 12,
    creditsUsed: 45,
    activeProjects: 2
  });

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Total Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.totalVideos}</div>
            <p className="text-xs text-green-500 mt-1">+2 from last week</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Credits Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.creditsUsed}</div>
            <p className="text-xs text-neutral-500 mt-1">Next reset in 12 days</p>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-400">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats.activeProjects}</div>
            <p className="text-xs text-orange-500 mt-1">Processing...</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Recent Projects</h2>
        <Button variant="outline" className="border-neutral-800 text-white">View All</Button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-neutral-800/50 text-neutral-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Project Name</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {[
              { name: "Shopee Flash Sale Video", status: "Completed", date: "2026-01-15" },
              { name: "TikTok Review - Gadget X", status: "Processing", date: "2026-01-16" },
              { name: "Facebook Ad - Beauty Pro", status: "Completed", date: "2026-01-14" }
            ].map((project, i) => (
              <tr key={i} className="hover:bg-neutral-800/30 transition-colors">
                <td className="px-6 py-4 text-white font-medium">{project.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    project.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                  }`}>
                    {project.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-neutral-400 text-sm">{project.date}</td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">Details</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-purple-600 rounded-lg" />
          <span className="font-bold text-xl tracking-tight">Creator360</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'studio', icon: Video, label: 'AI Studio' },
            { id: 'history', icon: History, label: 'History' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-orange-500 text-black font-bold shadow-lg shadow-orange-500/20' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-800">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neutral-900/50 via-black to-black">
        <header className="h-20 border-b border-neutral-800 flex items-center justify-between px-8 sticky top-0 bg-black/80 backdrop-blur-md z-10">
          <h1 className="text-xl font-bold capitalize">{activeTab}</h1>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="bg-neutral-900 border-neutral-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-orange-500/50 w-64"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700" />
          </div>
        </header>

        <div className="p-8 max-w-6xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'studio' && <AIStudio />}
          {activeTab === 'history' && <div className="text-neutral-500 text-center py-20">History feature coming soon...</div>}
          {activeTab === 'settings' && <div className="text-neutral-500 text-center py-20">Settings feature coming soon...</div>}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
