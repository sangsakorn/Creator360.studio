import React, { useState, useEffect } from 'react';
import { X, Upload, Palette, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from '../hooks/use-toast';

const ThemeCustomizer = ({ isOpen, onClose }) => {
  const [theme, setTheme] = useState({
    primaryColor: '#FF9D42',
    secondaryColor: '#B24FD6',
    accentColor: '#4FB4D6',
    backgroundColor: '#000000',
    backgroundImage: null,
    backgroundOpacity: 0.3,
  });

  const [previewImage, setPreviewImage] = useState(null);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('creator360_theme');
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      setTheme(parsed);
      if (parsed.backgroundImage) {
        setPreviewImage(parsed.backgroundImage);
      }
    }
  }, []);

  const handleColorChange = (key, value) => {
    setTheme(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result;
      setPreviewImage(base64);
      setTheme(prev => ({ ...prev, backgroundImage: base64 }));
      
      toast({
        title: 'Image uploaded',
        description: 'Background image updated.',
      });
    };
    reader.readAsDataURL(file);
  };

  const applyTheme = () => {
    // Save to localStorage
    localStorage.setItem('creator360_theme', JSON.stringify(theme));

    // Apply CSS variables
    document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
    document.documentElement.style.setProperty('--bg-color', theme.backgroundColor);
    
    // Apply background image
    if (theme.backgroundImage) {
      document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, ${1 - theme.backgroundOpacity}), rgba(0, 0, 0, ${1 - theme.backgroundOpacity})), url(${theme.backgroundImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = 'none';
    }

    toast({
      title: 'Theme applied!',
      description: 'Your custom theme has been saved.',
    });

    onClose();
  };

  const resetTheme = () => {
    const defaultTheme = {
      primaryColor: '#FF9D42',
      secondaryColor: '#B24FD6',
      accentColor: '#4FB4D6',
      backgroundColor: '#000000',
      backgroundImage: null,
      backgroundOpacity: 0.3,
    };

    setTheme(defaultTheme);
    setPreviewImage(null);
    localStorage.removeItem('creator360_theme');

    // Reset CSS
    document.documentElement.style.removeProperty('--primary-color');
    document.documentElement.style.removeProperty('--secondary-color');
    document.documentElement.style.removeProperty('--accent-color');
    document.documentElement.style.removeProperty('--bg-color');
    document.body.style.backgroundImage = 'none';

    toast({
      title: 'Theme reset',
      description: 'Restored default theme.',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Palette size={24} className="text-white" />
            <h2 className="text-2xl font-bold text-white">Theme Customizer</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Color Pickers */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Colors</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-neutral-300 mb-2 block">Primary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded border-neutral-700 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-neutral-300 mb-2 block">Secondary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded border-neutral-700 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-neutral-300 mb-2 block">Accent Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-12 h-10 rounded border-neutral-700 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-neutral-300 mb-2 block">Background Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 rounded border-neutral-700 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={theme.backgroundColor}
                    onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                    className="flex-1 bg-neutral-800 border-neutral-700 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Background Image */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Background Image</h3>
            
            {/* Upload Area */}
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-orange-500 transition-colors">
              <div className="flex flex-col items-center justify-center">
                {previewImage ? (
                  <img src={previewImage} alt="Background preview" className="h-32 object-cover rounded" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-neutral-400 mb-2" />
                    <p className="text-sm text-white">Click to upload background image</p>
                    <p className="text-xs text-neutral-400">PNG, JPG, WEBP</p>
                  </>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>

            {/* Opacity Slider */}
            {previewImage && (
              <div className="mt-4">
                <Label className="text-neutral-300 mb-2 block">
                  Background Opacity: {Math.round(theme.backgroundOpacity * 100)}%
                </Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={theme.backgroundOpacity}
                  onChange={(e) => handleColorChange('backgroundOpacity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            <div 
              className="p-6 rounded-lg"
              style={{
                background: theme.backgroundImage 
                  ? `linear-gradient(rgba(0, 0, 0, ${1 - theme.backgroundOpacity}), rgba(0, 0, 0, ${1 - theme.backgroundOpacity})), url(${theme.backgroundImage})`
                  : theme.backgroundColor,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <Button
                style={{
                  background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor}, ${theme.accentColor})`,
                  color: 'white',
                }}
                className="mb-3"
              >
                Sample Button
              </Button>
              <p className="text-white">This is how your theme will look!</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-3 p-6 border-t border-neutral-800">
          <Button
            onClick={resetTheme}
            variant="outline"
            className="border-neutral-700 text-white hover:bg-neutral-800"
          >
            <RotateCcw size={16} className="mr-2" />
            Reset to Default
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-neutral-700 text-white hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              onClick={applyTheme}
              style={{
                background: `linear-gradient(to right, ${theme.primaryColor}, ${theme.secondaryColor})`,
              }}
              className="text-white"
            >
              Apply Theme
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
