'use client';

import React, { useState, useEffect } from 'react';

interface Entry {
  id: string;
  title: string;
  value: string;
}

interface Workspace {
  id: string;
  name: string;
  entries: Entry[];
}

const STORAGE_KEY = 'zero_cms_blank_v3';

export default function Home() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    { id: '1', name: 'Default Project', entries: [] }
  ]);
  const [activeWsId, setActiveWsId] = useState<string>('1');
  const [newWsName, setNewWsName] = useState('');
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWorkspaces(parsed);
          setActiveWsId(parsed[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const save = (updated: Workspace[]) => {
    setWorkspaces(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const currentWs = workspaces.find(w => w.id === activeWsId) || workspaces[0];

  const handleAddWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    const ws: Workspace = {
      id: 'ws-' + Date.now(),
      name: newWsName.trim(),
      entries: []
    };
    save([...workspaces, ws]);
    setActiveWsId(ws.id);
    setNewWsName('');
    showToast(`Created project "${ws.name}"`);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const entry: Entry = {
      id: 'entry-' + Date.now(),
      title: title.trim(),
      value: value.trim()
    };
    const updated = workspaces.map(w => {
      if (w.id === currentWs.id) {
        return { ...w, entries: [entry, ...w.entries] };
      }
      return w;
    });
    save(updated);
    setTitle('');
    setValue('');
    showToast('Entry saved successfully');
  };

  const handleDeleteEntry = (entryId: string) => {
    const updated = workspaces.map(w => {
      if (w.id === currentWs.id) {
        return { ...w, entries: w.entries.filter(e => e.id !== entryId) };
      }
      return w;
    });
    save(updated);
    showToast('Entry deleted');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-bold">0</span>
              Zero CMS
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Blank Headless Multi-Project CMS</p>
          </div>

          <form onSubmit={handleAddWorkspace} className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="New project name..."
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition"
            >
              + Add Project
            </button>
          </form>
        </div>

        {/* Project Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold mr-2">Projects:</span>
          {workspaces.map(ws => (
            <button
              key={ws.id}
              onClick={() => setActiveWsId(ws.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                activeWsId === ws.id
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              {ws.name} ({ws.entries.length})
            </button>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Add Entry Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit space-y-4">
            <h2 className="text-lg font-bold">Add Entry to {currentWs.name}</h2>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Entry Title / Key</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. hero_heading"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">Value / Content</label>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. Welcome to our platform..."
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-blue-500 h-32 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm transition"
              >
                Save Entry
              </button>
            </form>
          </div>

          {/* Entries List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold">Entries ({currentWs.entries.length})</h2>
            {currentWs.entries.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">
                No entries yet. Add your first entry using the form.
              </div>
            ) : (
              <div className="space-y-4">
                {currentWs.entries.map(entry => (
                  <div key={entry.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <h3 className="font-bold text-sm text-zinc-200">{entry.title}</h3>
                      {entry.value && (
                        <p className="text-xs font-mono text-zinc-400 bg-black p-3 rounded-xl border border-zinc-800 whitespace-pre-wrap">
                          {entry.value}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900/60 text-rose-300 text-xs font-medium rounded-xl transition"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-950 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold z-50">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
