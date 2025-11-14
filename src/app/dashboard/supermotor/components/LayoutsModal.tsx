'use client';

import { useState } from 'react';
import { useUIStore } from '../state/ui';
import { X, Save, Trash2, Edit2, Check, Layers, Sparkles } from 'lucide-react';
import type { SavedLayout } from '../state/ui';

interface LayoutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LayoutsModal({ isOpen, onClose }: LayoutsModalProps) {
  const { savedLayouts, currentLayoutId, activeIndicators, saveCurrentLayout, loadLayout, deleteLayout, renameLayout } = useUIStore();
  const [saveMode, setSaveMode] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!isOpen) return null;

  const templates = savedLayouts.filter((l) => l.isTemplate);
  const userLayouts = savedLayouts.filter((l) => !l.isTemplate);

  const handleSave = () => {
    if (newLayoutName.trim()) {
      saveCurrentLayout(newLayoutName.trim());
      setNewLayoutName('');
      setSaveMode(false);
    }
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameLayout(id, editName.trim());
      setEditingId(null);
      setEditName('');
    }
  };

  const startEditing = (layout: SavedLayout) => {
    setEditingId(layout.id);
    setEditName(layout.name);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-[#1e222d] rounded-lg shadow-2xl border border-[#2a2e39] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2a2e39]">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-[#2962ff]" />
            <h2 className="text-xl font-semibold text-white">Chart Layouts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#2a2e39] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Save New Layout */}
          <div className="mb-6">
            {!saveMode ? (
              <button
                onClick={() => setSaveMode(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2962ff] hover:bg-[#1e53e5] rounded-lg transition-colors"
              >
                <Save className="w-5 h-5" />
                <span className="font-medium">Save Current Layout</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                  placeholder="Enter layout name..."
                  className="flex-1 px-4 py-3 bg-[#131722] border border-[#2a2e39] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2962ff]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') setSaveMode(false);
                  }}
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-3 bg-[#00c853] hover:bg-[#00b347] rounded-lg transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSaveMode(false)}
                  className="px-4 py-3 bg-[#2a2e39] hover:bg-[#363a45] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Templates Section */}
          {templates.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#2962ff]" />
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Templates</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {templates.map((layout) => (
                  <button
                    key={layout.id}
                    onClick={() => {
                      loadLayout(layout.id);
                      onClose();
                    }}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      currentLayoutId === layout.id
                        ? 'border-[#2962ff] bg-[#2962ff]/10'
                        : 'border-[#2a2e39] bg-[#131722] hover:border-[#2962ff]/50'
                    }`}
                  >
                    <div className="font-medium text-white mb-2">{layout.name}</div>
                    <div className="space-y-1 text-xs text-gray-400">
                      <div>Chart: {layout.chartType}</div>
                      <div>VP: {layout.volumeProfile.enabled ? 'On' : 'Off'}</div>
                      <div>{layout.activeIndicators.length} indicators</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Layouts Section */}
          {userLayouts.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                My Layouts ({userLayouts.length})
              </h3>
              <div className="space-y-2">
                {userLayouts.map((layout) => (
                  <div
                    key={layout.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-all ${
                      currentLayoutId === layout.id
                        ? 'border-[#2962ff] bg-[#2962ff]/10'
                        : 'border-[#2a2e39] bg-[#131722] hover:border-[#2962ff]/50'
                    }`}
                  >
                    {editingId === layout.id ? (
                      <>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-2 bg-[#2a2e39] border border-[#363a45] rounded text-white focus:outline-none focus:border-[#2962ff]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(layout.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          onClick={() => handleRename(layout.id)}
                          className="p-2 bg-[#00c853] hover:bg-[#00b347] rounded transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 bg-[#2a2e39] hover:bg-[#363a45] rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            loadLayout(layout.id);
                            onClose();
                          }}
                          className="flex-1 text-left"
                        >
                          <div className="font-medium text-white mb-1">{layout.name}</div>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>Chart: {layout.chartType}</span>
                            <span>VP: {layout.volumeProfile.enabled ? 'On' : 'Off'}</span>
                            <span>{layout.activeIndicators.length} indicators</span>
                            <span className="ml-auto">{formatDate(layout.createdAt)}</span>
                          </div>
                        </button>
                        <button
                          onClick={() => startEditing(layout)}
                          className="p-2 hover:bg-[#2a2e39] rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete layout "${layout.name}"?`)) {
                              deleteLayout(layout.id);
                            }
                          }}
                          className="p-2 hover:bg-[#ef5350] rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {userLayouts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Layers className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No saved layouts yet</p>
              <p className="text-xs mt-1">Save your first layout to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
