'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from '@/components/AppShell';
import TopBar from '@/components/TopBar';
import Form311Preview from '@/components/Form311Preview';
import SeverityChip from '@/components/SeverityChip';
import { speak } from '@/lib/tts';
import type { Category311 } from '@/lib/hamilton311Config';

type View = 'categories' | 'reports' | 'preview';

interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Form311Data {
  category: Category311;
  generatedForm: {
    category: string;
    subcategory: string;
    location: string;
    description: string;
    additionalDetails: string;
  };
  submissionSteps: string[];
  hamilton311Url: string;
  spokenSummary: string;
}

export default function AutoFilePage() {
  const [view, setView] = useState<View>('categories');
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryInfo | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [form311Data, setForm311Data] = useState<Form311Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/311-assist');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories);
        }
      } catch {
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  // Load eligible reports when category is selected
  const loadReportsForCategory = async (category: CategoryInfo) => {
    setSelectedCategory(category);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/reports?limit=50');
      if (res.ok) {
        const data = await res.json();
        // Filter reports that match this category and are eligible
        const eligible = data.reports.filter((r: any) => {
          const isEligible = ['critical', 'high'].includes(r.severity) &&
            ['new', 'acknowledged'].includes(r.status) &&
            !r.autoFiled311;

          // Match category loosely
          const categoryMatch = matchesCategory(r, category.id);
          return isEligible && categoryMatch;
        });
        setReports(eligible);
        setView('reports');
      }
    } catch {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Match report to 311 category
  const matchesCategory = (report: any, categoryId: string): boolean => {
    const combined = `${report.category} ${report.subcategory}`.toLowerCase();

    const categoryMappings: Record<string, string[]> = {
      'road-hazard': ['pothole', 'road hazard', 'road damage', 'debris', 'road'],
      'traffic': ['traffic', 'signal', 'sign', 'congestion'],
      'streetlight': ['light', 'streetlight', 'lamp'],
      'sidewalk': ['sidewalk', 'walkway', 'path'],
      'graffiti': ['graffiti', 'vandal', 'spray paint'],
      'litter': ['litter', 'garbage', 'dump', 'trash', 'waste'],
      'noise': ['noise', 'loud', 'music', 'disturbance'],
    };

    const keywords = categoryMappings[categoryId] || [];
    return keywords.some(kw => combined.includes(kw)) || report.category?.toLowerCase().includes(categoryId.replace('-', ' '));
  };

  // Generate 311 form for a report
  const generateForm = async (report: any) => {
    if (!selectedCategory) return;

    setGeneratingId(report._id);
    setError(null);

    try {
      const res = await fetch('/api/311-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report._id,
          categoryId: selectedCategory.id,
          location: report.locationApprox?.label,
          description: report.description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setForm311Data(data);
        setView('preview');

        // Speak the summary if TTS is available
        if (data.spokenSummary) {
          speak(data.spokenSummary);
        }
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to generate form');
      }
    } catch {
      setError('Failed to generate form');
    } finally {
      setGeneratingId(null);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (view === 'preview') {
      setForm311Data(null);
      setView('reports');
    } else if (view === 'reports') {
      setSelectedCategory(null);
      setReports([]);
      setView('categories');
    }
  };

  // Read aloud handler
  const handleReadAloud = (text: string) => {
    speak(text);
  };

  return (
    <AppShell>
      <div className="flex flex-col h-screen">
        <TopBar title="Assisted 311 Filing" showSearch={false} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6">
            <AnimatePresence mode="wait">
              {/* Category Selection View */}
              {view === 'categories' && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      Select Issue Type
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      Choose a category to find eligible reports for 311 filing
                    </p>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : error ? (
                    <div className="glass-card p-6 text-center">
                      <p className="text-red-400">{error}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((cat, i) => (
                        <motion.button
                          key={cat.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          onClick={() => loadReportsForCategory(cat)}
                          className="glass-card glass-card-hover p-4 text-left group"
                        >
                          <span className="text-2xl block mb-2">{cat.icon}</span>
                          <h3 className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                            {cat.name}
                          </h3>
                          <p className="text-xs text-[var(--text-secondary)] mt-1">
                            {cat.description}
                          </p>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Reports List View */}
              {view === 'reports' && (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleBack}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                        <span>{selectedCategory?.icon}</span>
                        {selectedCategory?.name}
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {reports.length} eligible report{reports.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : reports.length > 0 ? (
                    <div className="space-y-3">
                      {reports.map((report, i) => (
                        <motion.div
                          key={report._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="glass-card p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <SeverityChip severity={report.severity} />
                            <span className="text-xs text-[var(--text-secondary)]">
                              {report.category} &gt; {report.subcategory}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--text-primary)]">
                            {report.description?.substring(0, 150)}
                            {report.description?.length > 150 ? '...' : ''}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            📍 {report.locationApprox?.label || 'Location unknown'}
                          </p>
                          <button
                            onClick={() => generateForm(report)}
                            disabled={generatingId !== null}
                            className="btn-primary w-full py-2.5 text-sm disabled:opacity-50"
                          >
                            {generatingId === report._id ? (
                              <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Generating...
                              </span>
                            ) : (
                              'Generate 311 Form'
                            )}
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-card p-8 text-center space-y-3">
                      <p className="text-[var(--text-secondary)]">
                        No eligible reports found for {selectedCategory?.name}
                      </p>
                      <button
                        onClick={handleBack}
                        className="btn-secondary py-2 px-4 text-sm"
                      >
                        Try Another Category
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Form Preview View */}
              {view === 'preview' && form311Data && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Form311Preview
                    category={form311Data.category}
                    generatedForm={form311Data.generatedForm}
                    submissionSteps={form311Data.submissionSteps}
                    hamilton311Url={form311Data.hamilton311Url}
                    spokenSummary={form311Data.spokenSummary}
                    onBack={handleBack}
                    onReadAloud={handleReadAloud}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Display */}
            {error && view !== 'categories' && (
              <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </AppShell>
  );
}
