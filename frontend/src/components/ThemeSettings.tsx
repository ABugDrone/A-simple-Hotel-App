import React, { useState } from "react";
import { X, Palette, Type, Check } from "lucide-react";

interface ThemeSettingsProps {
  currentTheme: string;
  currentFont: string;
  onApplyTheme: (theme: string, font: string) => void;
  onClose: () => void;
}

const themes = [
  { id: "default", name: "Classic Slate", desc: "Clean slate & emerald", colors: ["#0F172A", "#10B981"] },
  { id: "ocean", name: "Ocean Blue", desc: "Calm blue & teal", colors: ["#0F4C81", "#0EA5E9"] },
  { id: "sunset", name: "Warm Sunset", desc: "Amber & rose tones", colors: ["#7C2D12", "#F59E0B"] },
  { id: "forest", name: "Forest Green", desc: "Deep green & emerald", colors: ["#064E3B", "#10B981"] },
  { id: "midnight", name: "Midnight Purple", desc: "Dark indigo & lavender", colors: ["#1E1B4B", "#818CF8"] },
];

const fonts = [
  { id: "inter", name: "Inter", family: "'Inter', sans-serif", display: "'Space Grotesk', sans-serif" },
  { id: "jakarta", name: "Plus Jakarta Sans", family: "'Plus Jakarta Sans', sans-serif", display: "'Plus Jakarta Sans', sans-serif" },
  { id: "dmsans", name: "DM Sans", family: "'DM Sans', sans-serif", display: "'DM Sans', sans-serif" },
  { id: "outfit", name: "Outfit", family: "'Outfit', sans-serif", display: "'Outfit', sans-serif" },
];

export default function ThemeSettings({ currentTheme, currentFont, onApplyTheme, onClose }: ThemeSettingsProps) {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const [selectedFont, setSelectedFont] = useState(currentFont);

  const handleApply = () => {
    onApplyTheme(selectedTheme, selectedFont);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-slate-700" />
            <h2 className="text-lg font-display font-bold text-slate-900">Appearance Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-800">Color Theme</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {themes.map((t) => {
                const isActive = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isActive ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex gap-1.5 mb-2">
                      {t.colors.map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border border-slate-200" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                    <p className="text-[10px] text-slate-400">{t.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-bold text-slate-800">Font Style</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {fonts.map((f) => {
                const isActive = selectedFont === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFont(f.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isActive ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900" style={{ fontFamily: f.family }}>
                        {f.name}
                      </span>
                      {isActive && <Check className="w-4 h-4 text-slate-900" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 truncate" style={{ fontFamily: f.family }}>
                      The quick brown fox jumps over the lazy dog.
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 rounded-lg text-xs font-bold text-white cursor-pointer transition-colors"
            style={{ backgroundColor: "var(--theme-primary)" }}
          >
            Apply Settings
          </button>
        </div>
      </div>
    </div>
  );
}
