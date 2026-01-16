import React, { useState } from 'react';
import { Sparkles, Video, Image as ImageIcon, FileText, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from '../hooks/use-toast';

const AIStudio = () => {
  const [productUrl, setProductUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [credits, setCredits] = useState(10);

  const handleGenerate = async () => {
    if (credits <= 0) {
      toast({
        title: "Insufficient Credits",
        description: "Please top up your credits to continue.",
        variant: "destructive"
      });
      return;
    }
    if (!productUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a product URL",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // In a real implementation, this would call the API Gateway we created earlier
      // For now, we simulate the process
      const response = await fetch('https://8000-iz6w8w490tqm21gwvi1m3-1e655f4f.sg1.manus.computer/create-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_user_id: "WEB_USER",
          product_name: "Product from Web",
          product_url: productUrl
        })
      });
      
      const data = await response.json();
      
      // Poll for results (simplified for demo)
      setTimeout(() => {
        setResult({
          script: "Hook: คุณกำลังมองหาสิ่งนี้อยู่ใช่ไหม? \nContent: นี่คือสินค้าที่จะเปลี่ยนชีวิตคุณ...",
          videoUrl: "https://8080-iz6w8w490tqm21gwvi1m3-1e655f4f.sg1.manus.computer/videos/sample.mp4",
          storyboard: [
            { type: "Hook", description: "เปิดตัวสินค้าด้วยความตื่นเต้น" },
            { type: "Feature", description: "แสดงคุณสมบัติหลัก" },
            { type: "CTA", description: "ปิดท้ายด้วยการเชิญชวนให้ซื้อ" }
          ]
        });
        setCredits(prev => prev - 1);
        setIsGenerating(false);
        toast({
          title: "Success",
          description: "AI has generated your content! (1 Credit used)",
        });
      }, 5000);

    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Error",
        description: "Failed to connect to AI Engine",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            <Sparkles className="text-orange-500" /> Creator360 AI Studio
          </h1>
          <p className="text-neutral-400 text-lg">
            Transform any product link into high-converting video content using Gemini AI.
          </p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center gap-6">
          <div>
            <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Your Credits</p>
            <p className="text-2xl font-black text-white">{credits}</p>
          </div>
          <Button 
            variant="outline" 
            className="border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-black rounded-xl"
            onClick={() => {
              setCredits(prev => prev + 10);
              toast({ title: "Top-up Success", description: "Added 10 credits to your account." });
            }}
          >
            Top Up
          </Button>
        </div>
      </div>

      <Card className="bg-neutral-900 border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Create New Content</CardTitle>
          <CardDescription className="text-neutral-400">
            Paste a Shopee, TikTok, or any product URL below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="https://shopee.co.th/product/..."
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className="bg-neutral-800 border-neutral-700 text-white flex-1"
            />
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="bg-gradient-to-r from-orange-500 to-purple-500 hover:opacity-90 text-white px-8"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-700">
          <Card className="bg-neutral-900 border-neutral-800 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="text-purple-500" /> Generated Video
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-[9/16] bg-black flex items-center justify-center relative group">
                <video 
                  src={result.videoUrl} 
                  controls 
                  className="h-full w-full object-contain"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Tabs defaultValue="script" className="w-full">
              <TabsList className="bg-neutral-800 border-neutral-700 w-full justify-start">
                <TabsTrigger value="script" className="data-[state=active]:bg-neutral-700 text-white">
                  <FileText className="mr-2 h-4 w-4" /> Script
                </TabsTrigger>
                <TabsTrigger value="storyboard" className="data-[state=active]:bg-neutral-700 text-white">
                  <ImageIcon className="mr-2 h-4 w-4" /> Storyboard
                </TabsTrigger>
              </TabsList>
              <TabsContent value="script" className="mt-4">
                <Card className="bg-neutral-900 border-neutral-800">
                  <CardContent className="pt-6">
                    <pre className="whitespace-pre-wrap text-neutral-300 font-sans leading-relaxed">
                      {result.script}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="storyboard" className="mt-4">
                <div className="space-y-4">
                  {result.storyboard.map((scene, idx) => (
                    <Card key={idx} className="bg-neutral-800 border-neutral-700">
                      <CardContent className="p-4 flex gap-4 items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">{scene.type}</h4>
                          <p className="text-neutral-400 text-sm">{scene.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStudio;
