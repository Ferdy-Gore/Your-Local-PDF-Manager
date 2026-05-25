import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Image as ImageIcon, Plus, Trash, Download, Copy, Check, 
  Terminal, Sparkles, MoveLeft, MoveRight, HelpCircle, 
  ArrowRight, ShieldCheck, RefreshCw, Layers, Sliders, Menu, X, Info,
  RotateCw, Sun, Moon, Star, CheckSquare, Search, ZoomIn, LayoutGrid, List, Grid, Crop, Scissors, Undo
} from 'lucide-react';
import { PDFDocument, degrees } from 'pdf-lib';
import { WorkspaceItem, AppView, SavedPDFBundle } from './types';
import { 
  getFavorites as loadFavoritesFromDb, 
  setFavorites as saveFavoritesToDb, 
  getBundles as loadBundlesFromDb, 
  setBundles as saveBundlesToDb,
  getWorkspaceItems as loadWorkspaceFromDb,
  setWorkspaceItems as saveWorkspaceToDb
} from './db';

// Predefined theme presets mapping all primary highlight elements, gradients, and panels
const THEMES = {
  violet: {
    id: 'violet',
    name: 'Violet Glow',
    primary: '#BD1D8C',
    secondary: '#1A0E30',
    accent: '#9333EA',
    bgHeader: 'bg-[#141221]/90',
    borderHeader: 'border-[#24213B]/80',
    bgBody: 'from-[#0C0B12] via-[#120F21] to-[#0D0B13]',
    bgCard: 'bg-[#141221]',
    bgInner: 'bg-[#1C1A2D]',
    borderCard: 'border-[#2D2A43]',
    textAccent: 'text-purple-400',
    titleGradient: 'from-[#BD1D8C] via-slate-100 to-[#671D9D]',
    pillGradient: 'from-[#BD1D8C] via-[#9333EA] to-[#671D9D]',
    shadowGlow: 'shadow-[0_0_20px_rgba(189,29,140,0.35)] hover:shadow-[0_0_25px_rgba(189,29,140,0.50)]',
    badgeBg: 'bg-[#24203F] text-purple-300',
    dots: ['#BD1D8C', '#9333EA']
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Mint',
    primary: '#00F2FE',
    secondary: '#07162C',
    accent: '#10B981',
    bgHeader: 'bg-[#0A0D1A]/95',
    borderHeader: 'border-[#1E3A5F]',
    bgBody: 'from-[#030712] via-[#080E1C] to-[#040815]',
    bgCard: 'bg-[#0A0D1A]',
    bgInner: 'bg-[#11162A]',
    borderCard: 'border-[#1E3A5F]/70',
    textAccent: 'text-cyan-400',
    titleGradient: 'from-[#00F2FE] via-slate-100 to-[#10B981]',
    pillGradient: 'from-[#00F2FE] via-[#10B981] to-[#059669]',
    shadowGlow: 'shadow-[0_0_20px_rgba(0,242,254,0.35)] hover:shadow-[0_0_25px_rgba(0,242,254,0.5)]',
    badgeBg: 'bg-cyan-950/80 text-cyan-300',
    dots: ['#00F2FE', '#10B981']
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic Slate',
    primary: '#3B82F6',
    secondary: '#111827',
    accent: '#6366F1',
    bgHeader: 'bg-[#1E293B]/95',
    borderHeader: 'border-[#334155]',
    bgBody: 'from-[#0F172A] via-[#1E293B] to-[#0F172A]',
    bgCard: 'bg-[#1E293B]',
    bgInner: 'bg-[#334155]',
    borderCard: 'border-[#475569]',
    textAccent: 'text-indigo-400',
    titleGradient: 'from-[#3B82F6] via-slate-100 to-[#6366F1]',
    pillGradient: 'from-[#3B82F6] via-[#4F46E5] to-[#6366F1]',
    shadowGlow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    badgeBg: 'bg-slate-700 text-sky-200',
    dots: ['#3B82F6', '#6366F1']
  },
  amber: {
    id: 'amber',
    name: 'Cosmic Amber',
    primary: '#F59E0B',
    secondary: '#1C0D02',
    accent: '#EF4444',
    bgHeader: 'bg-[#1B110B]/95',
    borderHeader: 'border-[#452715]',
    bgBody: 'from-[#110A05] via-[#1D1007] to-[#120B05]',
    bgCard: 'bg-[#1B110B]',
    bgInner: 'bg-[#291A10]',
    borderCard: 'border-[#452715]/80',
    textAccent: 'text-amber-400',
    titleGradient: 'from-[#F59E0B] via-slate-200 to-[#EF4444]',
    pillGradient: 'from-[#F59E0B] via-[#D97706] to-[#EF4444]',
    shadowGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_25px_rgba(245,158,11,0.50)]',
    badgeBg: 'bg-amber-950/80 text-amber-300',
    dots: ['#F59E0B', '#EF4444']
  }
};

const THEME_ACCENTS = {
  violet: {
    text: 'text-purple-400',
    borderSelected: 'border-purple-500',
    bgSelectedLight: 'bg-purple-50',
    bgSelectedDark: 'bg-purple-950/20',
    ringSelected: 'ring-purple-500/30',
    focusBorder: 'focus:border-purple-500',
    accentCheckbox: 'accent-purple-600 text-purple-600 focus:ring-purple-500',
    hoverBorderLight: 'hover:border-purple-500/35',
    hoverBorderDark: 'hover:border-purple-500/35',
    hoverBg: 'hover:bg-purple-600',
    sparkles: 'text-purple-400',
    badgeText: 'text-purple-450',
    bgBadge: 'bg-purple-500/10 border-purple-500/20',
    bgSaveWorkspaceGradient: 'from-purple-950/20 to-indigo-950/20 border-purple-800/40 hover:border-purple-500 text-purple-400'
  },
  cyberpunk: {
    text: 'text-cyan-400',
    borderSelected: 'border-emerald-500',
    bgSelectedLight: 'bg-emerald-50',
    bgSelectedDark: 'bg-emerald-950/20',
    ringSelected: 'ring-emerald-500/30',
    focusBorder: 'focus:border-emerald-500',
    accentCheckbox: 'accent-emerald-650 text-emerald-600 focus:ring-emerald-550',
    hoverBorderLight: 'hover:border-[#10B981]/35',
    hoverBorderDark: 'hover:border-[#10B981]/35',
    hoverBg: 'hover:bg-emerald-600',
    sparkles: 'text-emerald-400',
    badgeText: 'text-emerald-400',
    bgBadge: 'bg-emerald-500/10 border-emerald-500/20',
    bgSaveWorkspaceGradient: 'from-emerald-950/20 to-teal-950/20 border-emerald-800/40 hover:border-emerald-500 text-emerald-450'
  },
  nordic: {
    text: 'text-blue-450',
    borderSelected: 'border-blue-500',
    bgSelectedLight: 'bg-blue-50',
    bgSelectedDark: 'bg-blue-950/20',
    ringSelected: 'ring-blue-500/30',
    focusBorder: 'focus:border-blue-500',
    accentCheckbox: 'accent-blue-600 text-blue-600 focus:ring-blue-500',
    hoverBorderLight: 'hover:border-blue-500/35',
    hoverBorderDark: 'hover:border-blue-500/35',
    hoverBg: 'hover:bg-blue-600',
    sparkles: 'text-[#3B82F6]',
    badgeText: 'text-indigo-400',
    bgBadge: 'bg-blue-300/10 border-blue-500/20',
    bgSaveWorkspaceGradient: 'from-blue-950/20 to-indigo-950/20 border-blue-800/40 hover:border-blue-500 text-blue-450'
  },
  amber: {
    text: 'text-amber-400',
    borderSelected: 'border-amber-500',
    bgSelectedLight: 'bg-amber-50',
    bgSelectedDark: 'bg-amber-950/20',
    ringSelected: 'ring-amber-500/30',
    focusBorder: 'focus:border-amber-500',
    accentCheckbox: 'accent-amber-600 text-amber-600 focus:ring-amber-500',
    hoverBorderLight: 'hover:border-amber-500/35',
    hoverBorderDark: 'hover:border-amber-500/35',
    hoverBg: 'hover:bg-amber-600',
    sparkles: 'text-[#F59E0B]',
    badgeText: 'text-amber-400',
    bgBadge: 'bg-amber-500/10 border-amber-500/20',
    bgSaveWorkspaceGradient: 'from-amber-950/20 to-orange-950/20 border-amber-800/40 hover:border-amber-505 text-amber-400'
  }
};

// Predefined modern SVG vector page templates to allow instant, delightful interactions
const makeSampleSvgUrl = (title: string, color1: string, color2: string, textLines: string[], isPNG = false) => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400" width="300" height="400">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="300" height="400" rx="12" fill="#14121E" stroke="#2D2A43" stroke-width="2" />
      <rect width="280" height="380" x="10" y="10" rx="8" fill="url(#grad)" opacity="0.15" />
      
      <!-- Top banner ribbon -->
      <path d="M 10 10 L 150 10 L 140 30 L 10 30 Z" fill="${color1}" opacity="0.8" />
      <text x="20" y="24" fill="#FFFFFF" font-family="'Space Grotesk', sans-serif" font-size="10" font-weight="bold" letter-spacing="1">
        ${isPNG ? 'IMAGE WORKSPACE' : 'DOCUMENT PAGE'}
      </text>
      
      <!-- Inside graphics -->
      <circle cx="150" cy="120" r="45" fill="#1E1C2E" stroke="#2D2A43" stroke-width="1.5" />
      <polygon points="150,90 180,140 120,140" fill="${color1}" opacity="0.5" />
      <circle cx="150" cy="115" r="12" fill="${color2}" opacity="0.6" />
      
      <!-- Content title -->
      <text x="150" y="200" fill="#FFFFFF" font-family="'Space Grotesk', sans-serif" font-size="14" font-weight="bold" text-anchor="middle">
        ${title}
      </text>
      
      <!-- Text details mockup -->
      <line x1="40" y1="230" x2="260" y2="230" stroke="#2D2A43" stroke-width="2" />
      ${textLines.map((line, idx) => `
        <text x="150" y="${255 + idx * 18}" fill="#A6A3C0" font-family="'Inter', sans-serif" font-size="10" text-anchor="middle">
          ${line}
        </text>
      `).join('')}
      
      <!-- Footer details -->
      <rect width="280" height="30" x="10" y="360" rx="0" fill="#191724" />
      <text x="20" y="378" fill="#585675" font-family="monospace" font-size="8">LocalPDFManager Sandbox Tool</text>
      <text x="280" y="378" fill="${color1}" font-family="monospace" font-size="8" font-weight="bold" text-anchor="end">SECURE LOCAL</text>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

const getAspectRatio = (width: number, height: number): string => {
  if (!width || !height) return "N/A";
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const divisor = gcd(width, height);
  const wRatio = width / divisor;
  const hRatio = height / divisor;
  
  const decimal = width / height;
  if (Math.abs(decimal - 1.777) < 0.02) return '16:9';
  if (Math.abs(decimal - 0.562) < 0.02) return '9:16';
  if (Math.abs(decimal - 1.333) < 0.02) return '4:3';
  if (Math.abs(decimal - 0.75) < 0.02) return '3:4';
  if (Math.abs(decimal - 1.5) < 0.02) return '3:2';
  if (Math.abs(decimal - 0.666) < 0.02) return '2:3';
  if (Math.abs(decimal - 1) < 0.02) return '1:1';
  
  return `${wRatio}:${hRatio}`;
};

const formatBytesToSize = (bytes: number): string => {
  const kb = bytes / 1024;
  if (kb >= 1000) {
    return `${(kb / 1024).toFixed(2)} MB`;
  }
  return `${Math.round(kb)} KB`;
};

const normalizeFileSize = (sizeInput: string | number | undefined): string => {
  if (sizeInput === undefined) return 'N/A';
  if (typeof sizeInput === 'number') {
    return formatBytesToSize(sizeInput);
  }
  if (!sizeInput) return 'N/A';
  if (sizeInput === 'Custom') return 'Custom';
  const match = sizeInput.match(/([\d\.,]+)\s*KB/i);
  if (match) {
    const kb = parseFloat(match[1].replace(/,/g, ''));
    if (kb >= 1000) {
      return `${(kb / 1024).toFixed(2)} MB`;
    }
    return `${Math.round(kb)} KB`;
  }
  return sizeInput;
};

const convertSvgToPngDataUrl = (svgDataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 300;
        canvas.height = img.naturalHeight || 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not supported'));
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      reject(new Error('Failed to render core graphics vector page'));
    };
    img.src = svgDataUrl;
  });
};

const compressImageToJpegDataUrl = (srcDataUrl: string, qualityPercent: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 800;
        canvas.height = img.naturalHeight || 1100;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not supported'));
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Paint white background to prevent black background transparency issues in JPEGs
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        // Quality factor must be between 0.01 and 1.0
        const quality = Math.max(0.01, Math.min(1.0, qualityPercent / 100));
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for quality compression'));
    };
    img.src = srcDataUrl;
  });
};

const getDemoDocItems = (themeId: string) => {
  const cfg = THEMES[themeId as keyof typeof THEMES] || THEMES.violet;
  return [
    {
      id: 'demo-p1',
      name: 'Executive_Brief_Q1.pdf',
      type: 'pdf',
      pageIndex: 0,
      dataUrl: makeSampleSvgUrl('Executive Briefing', cfg.primary, cfg.accent, [
        '• Projected performance expansion of +14.2%',
        '• Internal security auditing results: 100% robust',
        '• Standardized client-side pipeline validated'
      ]),
      fileSize: '142 KB',
      width: 300,
      height: 400,
      aspectRatio: '3:4'
    },
    {
      id: 'demo-p2',
      name: 'Executive_Brief_Q1.pdf',
      type: 'pdf',
      pageIndex: 1,
      dataUrl: makeSampleSvgUrl('Operational Metrics', cfg.primary, cfg.secondary === '#111827' ? '#1E3A8A' : cfg.accent, [
        '• Local offline compile mechanism validated',
        '• Seamless browser state drag synchronization',
        '• Encrypted compilation memory layers'
      ]),
      fileSize: '142 KB',
      width: 300,
      height: 400,
      aspectRatio: '3:4'
    },
    {
      id: 'demo-p3',
      name: 'Marketing_Visual_Final.png',
      type: 'png',
      pageIndex: 0,
      dataUrl: makeSampleSvgUrl('Brand Launch Asset', '#10B981', '#064E3B', [
        '• High-resolution PNG workspace raster',
        '• Verified color density standard: RGB888',
        '• Dynamic conversion pipeline compatible'
      ], true),
      fileSize: '89 KB',
      width: 300,
      height: 400,
      aspectRatio: '3:4'
    },
  ];
};

export default function App() {
  const [currentTheme, setCurrentTheme] = useState<string>('violet');
  const [items, setItems] = useState<WorkspaceItem[]>(() => getDemoDocItems('violet'));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('workspace');
  const [status, setStatus] = useState<string>('Ready with 3 preloaded workspace pages.');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [pdfjsLoaded, setPdfjsLoaded] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedDocDetails, setSelectedDocDetails] = useState<WorkspaceItem | null>(null);
  const [pythonCodeCopied, setPythonCodeCopied] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportFilename, setExportFilename] = useState<string>('LocalPDFManager_Compiled');
  const [exportOnlySelected, setExportOnlySelected] = useState<boolean>(false);
  const [listThemeMode, setListThemeMode] = useState<'dark' | 'light'>('dark');
  const [workspaceSearch, setWorkspaceSearch] = useState<string>('');
  const [librarySearch, setLibrarySearch] = useState<string>('');
  const [zoomedItem, setZoomedItem] = useState<WorkspaceItem | null>(null);

  // Automatically opt-in to compile selected pages when some pages are selected on modal open
  useEffect(() => {
    if (showExportModal) {
      setExportOnlySelected(selectedIds.length > 0);
    }
  }, [showExportModal, selectedIds.length]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const favFileInputRef = useRef<HTMLInputElement>(null);
  const bundleFileInputRef = useRef<HTMLInputElement>(null);

  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'pdf' | 'png' | 'jpeg'>('all');
  const [sizeSortActive, setSizeSortActive] = useState<'none' | 'biggest'>('none');
  const [viewLayout, setViewLayout] = useState<'full' | 'list' | 'mini'>('full');
  const [jpegQuality, setJpegQuality] = useState<number>(85);
  const [libraryTab, setLibraryTab] = useState<'pages' | 'pdfs'>('pages');

  // Cropping Tool States
  const [isCropping, setIsCropping] = useState<boolean>(false);
  const [cropLeft, setCropLeft] = useState<number>(0);
  const [cropRight, setCropRight] = useState<number>(0);
  const [cropTop, setCropTop] = useState<number>(0);
  const [cropBottom, setCropBottom] = useState<number>(0);

  const [favorites, setFavorites] = useState<WorkspaceItem[]>([]);
  const [savedPDFBundles, setSavedPDFBundles] = useState<SavedPDFBundle[]>([]);
  const [dbLoaded, setDbLoaded] = useState<boolean>(false);

  // Load and migrate state from localStorage to persistent high-capacity IndexedDB store
  useEffect(() => {
    async function initDatabase() {
      try {
        const localFavs = localStorage.getItem('local_pdf_manager_favorites');
        const localBundles = localStorage.getItem('local_pdf_manager_bundles');

        let favsToLoad: WorkspaceItem[] = [];
        let bundlesToLoad: SavedPDFBundle[] = [];

        // 1. Core migration/load for Favorite templates
        if (localFavs) {
          try {
            favsToLoad = JSON.parse(localFavs);
            await saveFavoritesToDb(favsToLoad);
            localStorage.removeItem('local_pdf_manager_favorites');
          } catch {
            favsToLoad = await loadFavoritesFromDb();
          }
        } else {
          favsToLoad = await loadFavoritesFromDb();
        }

        // 2. Core migration/load for Whole PDF document packages
        if (localBundles) {
          try {
            bundlesToLoad = JSON.parse(localBundles);
            await saveBundlesToDb(bundlesToLoad);
            localStorage.removeItem('local_pdf_manager_bundles');
          } catch {
            bundlesToLoad = await loadBundlesFromDb();
          }
        } else {
          bundlesToLoad = await loadBundlesFromDb();
        }

        setFavorites(favsToLoad);
        setSavedPDFBundles(bundlesToLoad);

        // 3. Core load for Workspace state (Auto-save recover)
        const workspaceToLoad = await loadWorkspaceFromDb();
        if (workspaceToLoad && workspaceToLoad.length > 0) {
          setItems(workspaceToLoad);
          setStatus(`Restored ${workspaceToLoad.length} pages from your saved workspace state.`);
        }

        setDbLoaded(true);
      } catch (err) {
        console.error('Failed to initialize local IndexedDB database:', err);
        setDbLoaded(true);
      }
    }
    initDatabase();
  }, []);

  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (!showClearConfirm) return;
    const timer = setTimeout(() => {
      setShowClearConfirm(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [showClearConfirm]);

  // Asynchronously synchronize changes to Favorites state
  useEffect(() => {
    if (!dbLoaded) return;
    saveFavoritesToDb(favorites).catch(err => {
      console.error('Failed to preserve favorites:', err);
    });
  }, [favorites, dbLoaded]);

  // Asynchronously synchronize changes to PDF Bundles list
  useEffect(() => {
    if (!dbLoaded) return;
    saveBundlesToDb(savedPDFBundles).catch(err => {
      console.error('Failed to preserve bundles:', err);
      setStatus(`Storage limit reached for local cache: ${err.message || err}. Consider removing unused library templates.`);
    });
  }, [savedPDFBundles, dbLoaded]);

  // Asynchronously synchronize changes to Workspace state (Auto-save)
  useEffect(() => {
    if (!dbLoaded) return;
    saveWorkspaceToDb(items).catch(err => {
      console.error('Failed to auto-save workspace:', err);
    });
  }, [items, dbLoaded]);

  const t = THEMES[currentTheme as keyof typeof THEMES] || THEMES.violet;
  const ta = THEME_ACCENTS[currentTheme as keyof typeof THEME_ACCENTS] || THEME_ACCENTS.violet;

  const parsedSizeInKB = (sizeStr?: string): number => {
    if (!sizeStr) return 0;
    const match = sizeStr.match(/(\d+)\s*KB/i);
    if (match) return parseInt(match[1]);
    const mbMatch = sizeStr.match(/([\d\.]+)\s*MB/i);
    if (mbMatch) return parseFloat(mbMatch[1]) * 1024;
    return 0;
  };

  const displayedItems = [...items]
    .filter(item => {
      if (fileTypeFilter !== 'all') {
        const typeLower = item.type.toLowerCase();
        if (fileTypeFilter === 'pdf' && typeLower !== 'pdf') return false;
        if (fileTypeFilter === 'png' && typeLower !== 'png') return false;
        if (fileTypeFilter === 'jpeg' && typeLower !== 'jpeg' && typeLower !== 'jpg') return false;
      }
      if (workspaceSearch.trim() !== '') {
        return item.name.toLowerCase().includes(workspaceSearch.toLowerCase());
      }
      return true;
    });

  if (sizeSortActive === 'biggest') {
    displayedItems.sort((a, b) => parsedSizeInKB(b.fileSize) - parsedSizeInKB(a.fileSize));
  }

  // Sync selected details with initial state loading
  useEffect(() => {
    if (items.length > 0 && !selectedDocDetails) {
      setSelectedDocDetails(items[0]);
    }
  }, [items]);

  // Dynamic script injection for PDF.js - 100% robust way of rendering actual PDF page uploads in-browser
  useEffect(() => {
    if (typeof window !== 'undefined' && !(window as any).pdfjsLib) {
      setStatus('Loading PDF client parser engine...');
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        const workerScript = document.createElement('script');
        workerScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        workerScript.onload = () => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          setPdfjsLoaded(true);
          setStatus('Ready. 100% Offline client-side engine fully online.');
        };
        document.head.appendChild(workerScript);
      };
      document.head.appendChild(script);
    } else {
      setPdfjsLoaded(true);
    }
  }, []);

  // Update selected details when workspace list changes
  useEffect(() => {
    if (items.length > 0) {
      // Keep selected item valid
      if (!selectedDocDetails || !items.some(i => i.id === selectedDocDetails.id)) {
        setSelectedDocDetails(items[0]);
      }
    } else {
      setSelectedDocDetails(null);
    }
  }, [items]);

  // Unified Local file processing via HTML5 Canvas and FileReader supporting workspace, favorites, or whole PDF document bundles
  const readAndProcessFiles = async (files: FileList | File[], target: 'workspace' | 'favorites' | 'bundle') => {
    if (!files || files.length === 0) return;

    setStatus(`Processing ${files.length} file(s) for ${target}...`);

    for (let f = 0; f < files.length; f++) {
      const file = files[f];
      
      if (file.type === 'application/pdf') {
        if (!pdfjsLoaded) {
          alert('PDF client parser engine is loading. Try again in a brief second.');
          continue;
        }

        try {
          setStatus(`Analyzing PDF lines: ${file.name}...`);
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = (window as any).pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          const totalPages = pdf.numPages;

          setStatus(`Rendering ${totalPages} PDF pages...`);
          const filePages: WorkspaceItem[] = [];
          
          for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            setStatus(`Rendering Page ${pageNum}/${totalPages} of ${file.name}...`);
            const page = await pdf.getPage(pageNum);
            
            const scale = 1.3;
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (context) {
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              
              await page.render({
                canvasContext: context,
                viewport: viewport
              }).promise;
              
              const dataUrl = canvas.toDataURL('image/png');
              const newItem: WorkspaceItem = {
                id: `${target === 'favorites' ? 'fav' : target === 'bundle' ? 'bun-page' : 'pdf'}-${Date.now()}-${pageNum}-${Math.random().toString(36).substr(2, 5)}`,
                name: file.name,
                type: 'pdf',
                pageIndex: pageNum - 1,
                dataUrl,
                fileSize: formatBytesToSize(file.size),
                width: Math.round(viewport.width),
                height: Math.round(viewport.height),
                aspectRatio: getAspectRatio(Math.round(viewport.width), Math.round(viewport.height)),
                rotation: 0
              };
              
              if (target === 'bundle') {
                filePages.push(newItem);
              } else if (target === 'favorites') {
                setFavorites(prev => [...prev, newItem]);
              } else {
                setItems(prev => [...prev, newItem]);
              }
            }
          }

          if (target === 'bundle' && filePages.length > 0) {
            const newBundle: SavedPDFBundle = {
              id: `bundle-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              name: file.name,
              fileSize: formatBytesToSize(file.size),
              pages: filePages
            };
            setSavedPDFBundles(prev => [...prev, newBundle]);
            setStatus(`Successfully imported whole PDF document: ${file.name} (${totalPages} pages) into Saved Library.`);
          } else {
            setStatus(`Successfully loaded ${totalPages} pages from ${file.name} to ${target}`);
          }
        } catch (err: any) {
          console.error(err);
          setStatus(`Error parsing PDF document: ${err.message}`);
        }
      } 
      else if (file.type.startsWith('image/')) {
        try {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              const dataUrl = event.target.result as string;
              
              const img = new Image();
              img.onload = () => {
                const width = img.naturalWidth;
                const height = img.naturalHeight;
                const computedAspect = getAspectRatio(width, height);
                const ext = file.name.split('.').pop()?.toLowerCase() || file.type.split('/')[1] || 'png';
                
                const newItem: WorkspaceItem = {
                  id: `${target === 'favorites' ? 'fav' : target === 'bundle' ? 'bun-page' : 'img'}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  name: file.name,
                  type: ext === 'jpg' ? 'jpeg' : ext,
                  pageIndex: 0,
                  dataUrl,
                  fileSize: formatBytesToSize(file.size),
                  width,
                  height,
                  aspectRatio: computedAspect,
                  rotation: 0
                };
                
                if (target === 'bundle') {
                  const newBundle: SavedPDFBundle = {
                    id: `bundle-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    name: file.name,
                    fileSize: formatBytesToSize(file.size),
                    pages: [newItem]
                  };
                  setSavedPDFBundles(prev => [...prev, newBundle]);
                  setStatus(`Successfully imported image "${file.name}" as template bundle.`);
                } else if (target === 'favorites') {
                  setFavorites(prev => [...prev, newItem]);
                  setStatus(`Successfully imported "${file.name}" to Saved Library.`);
                } else {
                  setItems(prev => [...prev, newItem]);
                  setStatus(`Successfully loaded image: ${file.name} (${width}x${height}, Aspect Ratio ${computedAspect})`);
                }
              };
              img.onerror = () => {
                setStatus(`Error parsing image dimensions for file: ${file.name}`);
              };
              img.src = dataUrl;
            }
          };
          reader.readAsDataURL(file);
        } catch (err: any) {
          setStatus(`Error loading image: ${err.message}`);
        }
      } else {
        setStatus(`Skipped unsupported file type: ${file.name}. (Supports PDF and standard Image files)`);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await readAndProcessFiles(files, 'workspace');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFavFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await readAndProcessFiles(files, 'favorites');
    }
    if (favFileInputRef.current) {
      favFileInputRef.current.value = '';
    }
  };

  const handleBundleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await readAndProcessFiles(files, 'bundle');
    }
    if (bundleFileInputRef.current) {
      bundleFileInputRef.current.value = '';
    }
  };

  // Toggle item in Favorite list
  const handleToggleFavorite = (item: WorkspaceItem) => {
    const exists = favorites.some(fav => fav.dataUrl === item.dataUrl);
    if (exists) {
      setFavorites(prev => prev.filter(fav => fav.dataUrl !== item.dataUrl));
      setStatus(`Removed "${item.name}" from Saved Library.`);
    } else {
      const favItem: WorkspaceItem = {
        ...item,
        id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      };
      setFavorites(prev => [...prev, favItem]);
      setStatus(`Saved "${item.name}" into persistent Saved Library sidebar.`);
    }
  };

  // Add a favorite item to the workspace
  const handleAddFavoriteToWorkspace = (item: WorkspaceItem) => {
    const newItem: WorkspaceItem = {
      ...item,
      id: `${item.type === 'pdf' ? 'pdf' : 'img'}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      rotation: item.rotation || 0
    };
    setItems(prev => [...prev, newItem]);
    setStatus(`Added custom asset "${item.name}" to workspace.`);
  };

  // Add all pages from a saved whole PDF bundle to the active workspace
  const handleAddBundleToWorkspace = (bundle: SavedPDFBundle) => {
    const newItems = bundle.pages.map((p, idx) => ({
      ...p,
      id: `${p.type === 'pdf' ? 'pdf' : 'img'}-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      rotation: p.rotation || 0
    }));
    setItems(prev => [...prev, ...newItems]);
    setStatus(`Added all ${newItems.length} pages from whole PDF template "${bundle.name}" to workspace.`);
  };

  // Save the complete current workspace design layout as a PDF bundle template helper
  const handleSaveActiveWorkspaceAsBundle = () => {
    if (items.length === 0) {
      alert("No active workspace items exist to save as template.");
      return;
    }
    const customName = prompt("Enter a name for this customized template layout:", `My Saved PDF Layout (${items.length} pgs)`);
    if (customName === null) return; // cancelled
    
    const newBundle: SavedPDFBundle = {
      id: `bundle-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: customName || `Untitled Custom Layout`,
      fileSize: 'Custom',
      pages: [...items]
    };
    setSavedPDFBundles(prev => [...prev, newBundle]);
    setStatus(`Successfully backed up entire active layout to Saved PDF Library.`);
  };

  // Handle local workspace file drops from the sidebar library
  const handleWorkspaceDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data && data.pages && Array.isArray(data.pages)) {
          handleAddBundleToWorkspace(data as SavedPDFBundle);
        } else if (data && data.dataUrl) {
          handleAddFavoriteToWorkspace(data as WorkspaceItem);
        }
      }
    } catch (err) {
      console.error("Drop parsed failed:", err);
    }
  };

  // Toggle item selection
  const handleItemSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = items.find(i => i.id === id);
    if (item) {
      setSelectedDocDetails(item);
    }

    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(itemId => itemId !== id));
    } else {
      if (e.shiftKey) {
        setSelectedIds(prev => [...prev, id]);
      } else {
        setSelectedIds([id]);
      }
    }
  };

  // Toggle item selection accumulatively through checkbox
  const toggleCheckboxSelection = (id: string) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setSelectedDocDetails(item);
    }
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Rotate item 90 degrees clockwise
  const handleRotateItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const currentRotation = item.rotation || 0;
        const nextRotation = (currentRotation + 90) % 360;
        return { 
          ...item, 
          rotation: nextRotation 
        };
      }
      return item;
    }));
    
    // Also update selectedDocDetails if it is the rotated item
    setSelectedDocDetails(prev => {
      if (prev && prev.id === id) {
        const currentRotation = prev.rotation || 0;
        const nextRotation = (currentRotation + 90) % 360;
        return { ...prev, rotation: nextRotation };
      }
      return prev;
    });
    
    setStatus('Rotated workspace page 90 degrees clockwise.');
  };

  // Apply visual cropping region to the specific item
  const handleApplyCrop = async (id: string) => {
    const itemToCrop = items.find(i => i.id === id);
    if (!itemToCrop) return;

    try {
      setStatus("Cropping image...");
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const loaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image for cropping"));
      });
      img.src = itemToCrop.dataUrl;
      await loaded;

      const originalWidth = img.naturalWidth || 800;
      const originalHeight = img.naturalHeight || 1100;

      // Map percentages to actual pixels
      const x = Math.round((cropLeft / 100) * originalWidth);
      const y = Math.round((cropTop / 100) * originalHeight);
      const targetWidth = Math.round((1 - (cropLeft + cropRight) / 100) * originalWidth);
      const targetHeight = Math.round((1 - (cropTop + cropBottom) / 100) * originalHeight);

      if (targetWidth <= 0 || targetHeight <= 0) {
        setStatus("Crop box cannot be empty.");
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error("Unable to create canvas context");
      }

      // Draw the sub-rectangle of the original image
      ctx.drawImage(img, x, y, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);

      // Convert to same format as previous
      const format = itemToCrop.type.toLowerCase().includes('pdf') ? 'image/jpeg' : `image/${itemToCrop.type}`;
      const newBase64 = canvas.toDataURL(format, 0.92);

      // Estimate cropped file size
      const estimatedSize = Math.round((newBase64.length - newBase64.indexOf(',') - 1) * 3 / 4);

      setItems(prev => prev.map(item => {
        if (item.id === id) {
          return {
            ...item,
            originalDataUrl: item.originalDataUrl || item.dataUrl, // save original if first time
            dataUrl: newBase64,
            width: targetWidth,
            height: targetHeight,
            aspectRatio: getAspectRatio(targetWidth, targetHeight),
            fileSize: estimatedSize // update size in bytes
          };
        }
        return item;
      }));

      // Exit crop mode
      setIsCropping(false);
      setCropLeft(0);
      setCropRight(0);
      setCropTop(0);
      setCropBottom(0);
      setStatus("Cropped document page successfully.");
    } catch (err) {
      console.error(err);
      setStatus("Cropping failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Undo cropping if originalDataUrl is stored
  const handleUndoCrop = (id: string) => {
    const itemToReset = items.find(item => item.id === id);
    if (!itemToReset || !itemToReset.originalDataUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setItems(current => current.map(c => {
        if (c.id === id) {
          const estimatedSize = Math.round((c.originalDataUrl!.length - c.originalDataUrl!.indexOf(',') - 1) * 3 / 4);
          return {
            ...c,
            dataUrl: c.originalDataUrl!,
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: getAspectRatio(img.naturalWidth, img.naturalHeight),
            fileSize: estimatedSize,
            originalDataUrl: undefined // consume it
          };
        }
        return c;
      }));
      setStatus("Restored original uncropped document.");
    };
    img.onerror = () => {
      setStatus("Failed to measure uncropped original dimensions.");
    };
    img.src = itemToReset.originalDataUrl;

    setIsCropping(false);
    setCropLeft(0);
    setCropRight(0);
    setCropTop(0);
    setCropBottom(0);
  };

  // Toggle selection for all workspace elements
  const handleToggleSelectAll = () => {
    if (items.length === 0) return;
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
      setStatus('Cleared selection for all workspace pages.');
    } else {
      setSelectedIds(items.map(item => item.id));
      setStatus(`Selected all ${items.length} workspace pages.`);
    }
  };

  // Delete designated elements from workspace list
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      setStatus('No pages selected to delete. Click a thumbnail to select or Shift+Click for multiple.');
      return;
    }
    
    setItems(prev => prev.filter(item => !selectedIds.includes(item.id)));
    setStatus(`Deleted ${selectedIds.length} element(s) from workspace.`);
    setSelectedIds([]);
  };

  // Bulk flush (Wipes workspace clean, backed by safe confirmation logic)
  const handleClearWorkspace = () => {
    if (items.length === 0) return;
    if (showClearConfirm) {
      setItems([]);
      setSelectedIds([]);
      setShowClearConfirm(false);
      setStatus('Erase successful: Workspace has been reset.');
    } else {
      setShowClearConfirm(true);
      setStatus('Verification required. Click Clear Workspace again to confirm erasing ALL pages.');
    }
  };

  // Reordering array utility via manual quick controls
  const moveItem = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItems(updated);
    setStatus(`Reordered sequence. Changed position ${index + 1} to ${targetIndex + 1}.`);
  };

  // Drag and drop mechanics for tile grid rearrangement using stable ID lookup
  const handleDragStart = (e: React.DragEvent, id: string) => {
    const idx = items.findIndex(item => item.id === id);
    if (idx !== -1) {
      setDraggedIndex(idx);
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const idx = items.findIndex(item => item.id === id);
    if (idx !== -1 && draggedIndex !== idx) {
      // Smooth dynamic state update during dragging
      const updated = [...items];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(idx, 0, moved);
      setDraggedIndex(idx);
      setItems(updated);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setStatus('Rearranged workspace item sequence via drag-and-drop.');
  };

  // Compile full list (or selected subset) into a brand new PDF locally on the computer
  const handleExportToPdf = async () => {
    const itemsToExport = exportOnlySelected 
      ? items.filter(it => selectedIds.includes(it.id))
      : items;

    if (itemsToExport.length === 0) {
      if (exportOnlySelected) {
        alert('No pages are currently selected to compile! Please select page(s) or toggle compile entire workspace.');
      } else {
        alert('Workspace is currently empty! Please load PNGs or PDFs before compiling.');
      }
      return;
    }

    try {
      setIsExporting(true);
      setExportProgress(10);
      setStatus('Initializing PDF Document Builder...');

      // 100% Client-Side merging using pdf-lib
      const pdfDoc = await PDFDocument.create();
      
      for (let i = 0; i < itemsToExport.length; i++) {
        const percent = Math.round(10 + ((i + 1) / itemsToExport.length) * 80);
        setExportProgress(percent);
        setStatus(`Compiling page ${i + 1} of ${itemsToExport.length} [${itemsToExport[i].name}]...`);

        const item = itemsToExport[i];
        
        let imageBytes: ArrayBuffer;
        let isPng = true;

        try {
          if (jpegQuality < 100) {
            let srcUrl = item.dataUrl;
            if (item.dataUrl.startsWith('data:image/svg+xml')) {
              srcUrl = await convertSvgToPngDataUrl(item.dataUrl);
            }
            try {
              const compressedDataUrl = await compressImageToJpegDataUrl(srcUrl, jpegQuality);
              const res = await fetch(compressedDataUrl);
              imageBytes = await res.arrayBuffer();
              isPng = false; // It has now been transformed into a compressed JPEG!
            } catch (compressErr) {
              console.warn('Interactive quality compressor failed, falling back to original logic:', compressErr);
              const res = await fetch(srcUrl);
              imageBytes = await res.arrayBuffer();
              isPng = srcUrl.includes('image/png') || !srcUrl.includes('image/jpeg');
            }
          } else {
            if (item.dataUrl.startsWith('data:image/svg+xml')) {
              // Render SVG to PNG raster representation in-browser before compiling
              const pngDataUrl = await convertSvgToPngDataUrl(item.dataUrl);
              const res = await fetch(pngDataUrl);
              imageBytes = await res.arrayBuffer();
              isPng = true;
            } else {
              const res = await fetch(item.dataUrl);
              imageBytes = await res.arrayBuffer();
              isPng = item.dataUrl.includes('image/png') || !item.dataUrl.includes('image/jpeg');
            }
          }
        } catch (fetchErr: any) {
          console.error('DataUrl decode failure:', fetchErr);
          throw new Error(`Failed to decode page data URL: ${fetchErr.message}`);
        }
        
        // Embed image inside new PDF page object
        let embeddedImage;
        try {
          if (isPng) {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
          } else {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          }
        } catch (embedErr) {
          console.warn('Embedding issue, forcing fallback try:', embedErr);
          try {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
          } catch {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          }
        }
        
        // Add A4 or exact scaled page dimensions
        const page = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
        
        // Apply rotation if any
        if (item.rotation) {
          page.setRotation(degrees(item.rotation));
        }
      }

      setStatus('Finalizing file layers and metadata compression...');
      setExportProgress(95);

      const pdfBytes = await pdfDoc.save();
      
      // Determine elegant output filename chosen by user
      let cleanFilename = exportFilename.trim();
      if (!cleanFilename) {
        cleanFilename = 'LocalPDFManager_Compiled';
      }
      if (!cleanFilename.toLowerCase().endsWith('.pdf')) {
        cleanFilename += '.pdf';
      }

      // Trigger native client side browser download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = cleanFilename;
      link.target = '_self';
      link.setAttribute('download', cleanFilename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setExportProgress(100);
      setStatus(`Export completed! Successfully compiled ${itemsToExport.length} pages into a unified output PDF.`);
      setTimeout(() => {
        setIsExporting(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus(`Compilation failed: ${err.message}`);
      setIsExporting(false);
    }
  };

  // Copy python source script
  const handleCopyPythonCode = () => {
    const code = getRawPythonCode(currentTheme);
    navigator.clipboard.writeText(code).then(() => {
      setPythonCodeCopied(true);
      setTimeout(() => setPythonCodeCopied(false), 2000);
    });
  };

  // Trigger download of python script
  const handleDownloadPythonFile = () => {
    const code = getRawPythonCode(currentTheme);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'main.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-gradient-to-tr ${t.bgBody} text-slate-100 min-h-screen font-sans overflow-x-hidden selection:bg-purple-600 selection:text-white pb-6`}>
      
      {/* GLOW ATMOSPHERE ACCENTS (Reflecting visual graphics of physical image container) */}
      <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[24rem] h-[24rem] bg-fuchsia-900/10 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP SAAS NAVBAR */}
      <header className={`border-b ${t.borderHeader} ${t.bgHeader} backdrop-blur-md sticky top-0 z-40 px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${t.pillGradient} flex items-center justify-center ${t.shadowGlow}`}>
              <span className="font-extrabold text-[18px] text-white font-mono">LP</span>
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${t.titleGradient}`}>
                LocalPDFManager
              </h1>
              <p className="text-[10px] text-slate-400/80 font-mono tracking-wider flex items-center gap-1 uppercase">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Secure Local Processor (Zero Server Connection)
              </p>
            </div>
          </div>

          {/* DUAL VIEW BUTTON PILL - Matches the "Auto / Manual" segmented control in the design image */}
          <div className={`flex ${t.bgInner} p-1 rounded-full border ${t.borderCard} items-center`}>
            <button 
              onClick={() => setCurrentView('workspace')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 ${
                currentView === 'workspace' 
                  ? `bg-gradient-to-r ${t.pillGradient} text-white shadow-lg` 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Web App Sandbox
            </button>
            <button 
              onClick={() => setCurrentView('python-code')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 ${
                currentView === 'python-code' 
                  ? `bg-gradient-to-r ${t.pillGradient} text-white shadow-lg` 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Source Desktop Code
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">

        {/* ======================= VIEW MODE 1: THE INTERACTIVE WORKSPACE ======================= */}
        {currentView === 'workspace' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* SAVED LIBRARY COLUMN (Persistent Drag & Drop assets repository sidebar) */}
            <section className="lg:col-span-3 flex flex-col space-y-6">
              <div className={`${t.bgCard} border border-dashed ${t.borderCard} rounded-[24px] p-5 shadow-2xl relative flex flex-col h-full`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

                <div className="flex items-center justify-between pb-3 border-b border-[#232035]/85">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                    <h3 className="text-sm font-extrabold text-white">Saved Library</h3>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-mono font-bold px-2 py-0.5 rounded-md">
                    {libraryTab === 'pages' ? `${favorites.length} Page${favorites.length === 1 ? '' : 's'}` : `${savedPDFBundles.length} PDF${savedPDFBundles.length === 1 ? '' : 's'}`}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed mt-3">
                  {libraryTab === 'pages' 
                    ? "Store single template forms, brand headers, or signatures. Drag onto Workspace board or click '+'." 
                    : "Store entire multi-page document templates or design layouts. Drag document to load all pages at once!"}
                </p>

                {/* Tab Switcher */}
                <div className="flex bg-[#1C1A2D] p-1 rounded-xl border border-slate-800/80 mt-3 items-center matches-glow">
                  <button
                    onClick={() => setLibraryTab('pages')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      libraryTab === 'pages'
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    Single Pages ({favorites.length})
                  </button>
                  <button
                    onClick={() => setLibraryTab('pdfs')}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      libraryTab === 'pdfs'
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3 h-3" />
                    Whole PDFs ({savedPDFBundles.length})
                  </button>
                </div>

                {/* Search Bar for Library -- Filters displayed thumbnails by file names */}
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={`Search ${libraryTab === 'pages' ? 'single pages' : 'whole PDFs'}...`}
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#1C1A2D] hover:bg-[#25223A] focus:bg-[#25223A] text-white border border-slate-800 focus:border-amber-500 rounded-xl focus:outline-none transition-all placeholder:text-slate-550"
                  />
                  {librarySearch && (
                    <button
                      onClick={() => setLibrarySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Import Buttons according to active tab */}
                <div className="mt-3">
                  {libraryTab === 'pages' ? (
                    <>
                      <button 
                        onClick={() => favFileInputRef.current?.click()}
                        className={`w-full py-2 px-3 bg-[#1C1A2D] hover:bg-slate-850 border border-dashed ${t.borderCard} hover:border-amber-400 text-amber-300 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Import Single Page
                      </button>
                      <input 
                        type="file"
                        ref={favFileInputRef}
                        onChange={handleFavFileUpload}
                        multiple
                        accept="image/*, application/pdf"
                        className="hidden"
                      />
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => bundleFileInputRef.current?.click()}
                        className={`w-full py-2 px-3 bg-[#1C1A2D] hover:bg-slate-850 border border-dashed ${t.borderCard} hover:border-amber-400 text-amber-300 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Import Whole PDF
                      </button>
                      <input 
                        type="file"
                        ref={bundleFileInputRef}
                        onChange={handleBundleFileUpload}
                        multiple
                        accept="application/pdf, image/*"
                        className="hidden"
                      />
                    </>
                  )}
                </div>

                {/* Vertical Assets Scroll Stack */}
                <div className="flex-1 mt-4 overflow-y-auto max-h-[520px] pr-1 space-y-2.5 custom-scrollbar">
                  {libraryTab === 'pages' ? (
                    favorites.length === 0 ? (
                      <div className="h-full py-12 px-4 rounded-xl border border-dashed border-slate-850 bg-slate-900/10 flex flex-col items-center justify-center text-center">
                        <Star className="w-6 h-6 text-slate-600 mb-2 stroke-1" />
                        <p className="text-[11px] text-slate-500 font-medium">Pages list is empty</p>
                        <p className="text-[9px] text-slate-600 mt-0.5">Click star on any active workspace page or upload files above to speed up layout reuse!</p>
                      </div>
                    ) : favorites.filter(fav => fav.name.toLowerCase().includes(librarySearch.toLowerCase())).length === 0 ? (
                      <div className="h-full py-12 px-4 rounded-xl border border-dashed border-slate-850 bg-slate-900/10 flex flex-col items-center justify-center text-center animate-fade-in">
                        <Info className="w-6 h-6 text-slate-600 mb-2 stroke-1" />
                        <p className="text-[11px] text-slate-400 font-semibold text-slate-300">No matching pages found</p>
                        <p className="text-[9px] text-slate-505 mt-0.5">Try adjusting your keyword parser</p>
                        <button
                          onClick={() => setLibrarySearch('')}
                          className="mt-2 text-[10px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                        >
                          Reset search
                        </button>
                      </div>
                    ) : (
                      favorites
                        .filter(fav => fav.name.toLowerCase().includes(librarySearch.toLowerCase()))
                        .map((fav) => (
                        <div
                          key={fav.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify(fav));
                            e.dataTransfer.effectAllowed = 'copy';
                          }}
                          className={`group relative flex items-center gap-2.5 p-2 bg-[#1C1A2D] hover:bg-[#25223A] border border-slate-800/70 ${ta.hoverBorderDark} rounded-xl transition-all shadow-sm select-none cursor-grab`}
                          title="Drag this item onto Workspace Grid or click + to activate it"
                        >
                          {/* Thumbnail */}
                          <div className="w-12 h-12 bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center p-1 shrink-0 relative border border-slate-900">
                            <img 
                              src={fav.dataUrl} 
                              alt={fav.name}
                              style={{ transform: `rotate(${fav.rotation || 0}deg)` }}
                              className="max-w-full max-h-full object-contain pointer-events-none rounded animate-fade-in" 
                            />
                          </div>

                          {/* Title details */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold text-slate-200 truncate group-hover:${ta.text} transition-colors`} title={fav.name}>
                              {fav.name}
                            </p>
                            <span className="text-[9px] font-mono text-slate-500 block uppercase mt-0.5">
                              {fav.type} • {fav.fileSize || 'N/A'}
                            </span>
                          </div>

                          {/* Quick controls */}
                          <div className="flex flex-col gap-1 items-center shrink-0">
                            {/* Apply copy to workspace */}
                            <button
                              onClick={() => handleAddFavoriteToWorkspace(fav)}
                              className="p-1 hover:bg-emerald-950 hover:text-emerald-300 text-emerald-400 rounded transition-colors cursor-pointer flex items-center justify-center"
                              title="Add to Interactive Workspace"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            {/* Delete from library */}
                            <button
                              onClick={() => {
                                setFavorites(prev => prev.filter(f => f.id !== fav.id));
                                setStatus(`Deleted template element "${fav.name}" from Saved Library.`);
                              }}
                              className="p-1 hover:bg-slate-805 hover:text-rose-400 text-slate-500 rounded transition-colors cursor-pointer flex items-center justify-center"
                              title="Delete template"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    savedPDFBundles.length === 0 ? (
                      <div className="h-full py-12 px-4 rounded-xl border border-dashed border-slate-850 bg-slate-900/10 flex flex-col items-center justify-center text-center">
                        <FileText className="w-6 h-6 text-slate-600 mb-2 stroke-1" />
                        <p className="text-[11px] text-slate-500 font-medium">No PDF templates saved</p>
                        <p className="text-[9px] text-zinc-400 mt-1">
                          Export entire multi-page documents to load all pages sequential or take an instant snapshot!
                        </p>
                        <button
                          onClick={handleSaveActiveWorkspaceAsBundle}
                          className={`mt-3 px-3 py-1.5 ${t.bgInner} ${ta.text} hover:opacity-85 border border-current/20 text-[10px] font-bold rounded-lg transition-colors cursor-pointer`}
                        >
                          Snapshot Workspace
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <button
                          onClick={handleSaveActiveWorkspaceAsBundle}
                          className={`w-full py-2 bg-gradient-to-r ${ta.bgSaveWorkspaceGradient} text-[10px] font-bold rounded-lg border border-dashed transition-all cursor-pointer flex items-center justify-center gap-1.5`}
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Save Workspace as Template
                        </button>

                        {savedPDFBundles.filter(b => b.name.toLowerCase().includes(librarySearch.toLowerCase())).length === 0 ? (
                          <div className="py-12 px-4 rounded-xl border border-dashed border-slate-850 bg-slate-900/10 flex flex-col items-center justify-center text-center animate-fade-in">
                            <Info className="w-6 h-6 text-slate-605 mb-2 stroke-1" />
                            <p className="text-[11px] text-slate-450 font-semibold">No PDFs match "{librarySearch}"</p>
                            <button
                              onClick={() => setLibrarySearch('')}
                              className={`mt-2 text-[10px] ${ta.text} hover:opacity-90 font-bold underline cursor-pointer`}
                            >
                              Reset search
                            </button>
                          </div>
                        ) : (
                          savedPDFBundles
                            .filter(bundle => bundle.name.toLowerCase().includes(librarySearch.toLowerCase()))
                            .map((bundle) => (
                              <div
                                key={bundle.id}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('application/json', JSON.stringify(bundle));
                                  e.dataTransfer.effectAllowed = 'copy';
                                }}
                                className={`group relative flex items-center gap-2.5 p-2 bg-[#171426] hover:bg-[#201C35] border border-[#2D2A43] ${ta.hoverBorderDark} rounded-xl transition-all shadow-sm select-none cursor-grab`}
                                title="Drag PDF template to board or click + to load all pages sequentially"
                              >
                                {/* Stack Visual Icon */}
                                <div className="w-12 h-12 bg-[#2D2A43]/50 rounded-lg flex items-center justify-center p-1 shrink-0 border border-[#3E3A61]/30">
                                  <div className="relative">
                                    {/* Simulated Stack of Multi Documents */}
                                    <div className="absolute -top-1 -left-1 w-6 h-7 bg-slate-850 rounded border border-slate-700" style={{ opacity: 0.6 }} />
                                    <div className="absolute -top-0.5 -left-0.5 w-6 h-7 bg-slate-800 rounded border border-slate-600" style={{ opacity: 0.8 }} />
                                    <div className="w-6 h-7 bg-slate-900 rounded border flex items-center justify-center" style={{ borderColor: t.primary }}>
                                      <span className="text-[8px] font-extrabold font-mono" style={{ color: t.primary }}>{bundle.pages.length}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Details of whole doc */}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs font-semibold text-slate-200 truncate group-hover:${ta.text} transition-colors`} title={bundle.name}>
                                    {bundle.name}
                                  </p>
                                  <span className="text-[9px] font-mono text-slate-500 block uppercase mt-0.5">
                                    Entire PDF • {bundle.pages.length} Page{bundle.pages.length === 1 ? '' : 's'}
                                  </span>
                                </div>

                                {/* Actions Bundle */}
                                <div className="flex flex-col gap-1 items-center shrink-0">
                                  {/* Apply entire PDF bundle pages to workspace */}
                                  <button
                                    onClick={() => handleAddBundleToWorkspace(bundle)}
                                    className="p-1 hover:bg-emerald-950 hover:text-emerald-300 text-emerald-400 rounded transition-colors cursor-pointer flex items-center justify-center"
                                    title="Add entire PDF pages to board"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  {/* Delete PDF template bundle */}
                                  <button
                                    onClick={() => {
                                      setSavedPDFBundles(prev => prev.filter(b => b.id !== bundle.id));
                                      setStatus(`Deleted PDF whole document template "${bundle.name}" from Saved Library.`);
                                    }}
                                    className="p-1 hover:bg-slate-805 hover:text-rose-400 text-slate-500 rounded transition-colors cursor-pointer flex items-center justify-center"
                                    title="Delete PDF Template"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* MAIN WORKSPACE WRAPPER (9 columns width) containing both top controls grid and workspace list below */}
            <div className="lg:col-span-9 flex flex-col space-y-6">
              
              {/* TOP ROW: Theme, Document Details, and Command Center side-by-side exactly like image */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
                
                {/* 1. APP THEME PRESETS */}
                <div className="xl:col-span-3 flex flex-col">
                  <div className={`${t.bgCard} border border-solid ${t.borderCard} rounded-[24px] p-5 shadow-xl flex flex-col h-full justify-between space-y-4`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 tracking-wider uppercase font-mono flex items-center gap-1.5">
                        <Sparkles className={`w-3.5 h-3.5 ${ta.sparkles}`} />
                        App Theme Presets
                      </h4>
                      <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded border border-slate-700/50">LOCAL</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Select a visual interface style preset. This transforms both the Web workspace and the compiled standalone PySide desktop executable.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                       {Object.values(THEMES).map(themeItem => {
                         const active = currentTheme === themeItem.id;
                         return (
                           <button
                             key={themeItem.id}
                             onClick={() => {
                               setCurrentTheme(themeItem.id);
                               const isDemoCurrently = items.length === 3 && items[0].id.startsWith('demo-');
                               if (isDemoCurrently) {
                                 setItems(getDemoDocItems(themeItem.id));
                                }
                               setStatus(`Applied theme layout: ${themeItem.name}`);
                             }}
                             className={`px-2 transition-all duration-300 text-left flex flex-col h-14 cursor-pointer rounded-xl border-2 p-1.5 justify-between select-none ${
                               active 
                                 ? 'text-white shadow-md' 
                                 : 'border-[#2D2A43] bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                             }`}
                             style={active ? { borderColor: themeItem.primary, backgroundColor: `${themeItem.primary}15` } : {}}
                           >
                             <span className="truncate text-[10px] font-bold">{themeItem.name}</span>
                             <div className="flex gap-1 items-center">
                               {themeItem.dots.map((dotColor, idx) => (
                                 <span key={idx} className="w-2 h-2 rounded-full border border-black/35" style={{ backgroundColor: dotColor }} />
                               ))}
                             </div>
                           </button>
                         );
                       })}
                    </div>
                  </div>
                </div>

                {/* 2. DOCUMENT PROPERTIES */}
                <div className="xl:col-span-4 flex flex-col">
                  <div className={`${t.bgCard} border border-solid ${t.borderCard} rounded-[24px] p-5 shadow-xl flex flex-col h-full justify-between space-y-4`}>
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase font-mono font-bold">Document Properties</h4>
                      <Layers className="w-4 h-4" style={{ color: t.primary }} />
                    </div>

                    {selectedDocDetails ? (
                      <div className={`space-y-2.5 ${t.bgInner} p-4 rounded-xl border border-solid border-slate-800/40 flex-1 flex flex-col justify-center text-xs mt-auto`}>
                        <div>
                          <label className="text-[9px] text-slate-500 font-bold uppercase font-mono block">Original Name</label>
                          <p className="text-xs text-slate-100 font-semibold truncate flex items-center gap-2 mt-0.5" title={selectedDocDetails.name}>
                            {selectedDocDetails.type === 'pdf' ? (
                               <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            ) : (
                               <ImageIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                            {selectedDocDetails.name}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="text-[10px] text-slate-450 font-bold uppercase font-mono block">Scope Type</label>
                            <p className="font-bold text-white uppercase mt-0.5 font-mono text-[13px]">{selectedDocDetails.type}</p>
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-450 font-bold uppercase font-mono block">File Weight</label>
                            <p className="font-bold text-white mt-0.5 font-mono text-[13px]">{normalizeFileSize(selectedDocDetails.fileSize)}</p>
                          </div>
                        </div>

                        {(selectedDocDetails.width && selectedDocDetails.height) && (
                          <div className="grid grid-cols-2 gap-2 text-xs pt-2.5 border-t border-slate-700/30">
                            <div>
                              <label className="text-[10px] text-slate-450 font-bold uppercase font-mono block">Resolution</label>
                              <p className="font-bold text-white mt-0.5 font-mono text-[13px]">{selectedDocDetails.width} × {selectedDocDetails.height}</p>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-450 font-bold uppercase font-mono block">Aspect Ratio</label>
                              <p className={`font-bold mt-0.5 font-mono text-[13px] ${t.textAccent} ${ta.bgBadge} border px-1.5 py-0.5 rounded w-max inline-block`}>{selectedDocDetails.aspectRatio || 'N/A'}</p>
                            </div>
                          </div>
                        )}

                        {selectedDocDetails.type === 'pdf' && (
                          <div className="pt-2 border-t border-slate-700/30 text-[10px]">
                            <span className="text-slate-400 font-mono">Source PDF index: </span>
                            <span className={`font-bold font-mono ${t.textAccent}`}>Page {selectedDocDetails.pageIndex !== undefined ? selectedDocDetails.pageIndex + 1 : '1'}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`text-center py-6 text-slate-500 text-[11px] leading-relaxed ${t.bgInner} rounded-xl border border-dashed border-slate-800/60 flex-1 flex items-center justify-center`}>
                        Select a page thumbnail in the grid below to inspect file properties.
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. COMMAND CENTER WITH HORIZONTAL CARDS + COMPILE ON FOOTER */}
                <div className="xl:col-span-5 flex flex-col">
                  <div className={`${t.bgCard} border border-solid ${t.borderCard} rounded-[24px] p-5 shadow-xl flex flex-col h-full justify-between space-y-4`}>
                    
                    {/* Centered Title */}
                    <div className="text-center pb-2 border-b border-slate-700/30">
                      <h4 className="text-xs font-black text-slate-200 tracking-widest uppercase font-mono">
                        Command Center
                      </h4>
                    </div>

                    {/* File Uploader Input */}
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      multiple 
                      accept="image/*, application/pdf" 
                      className="hidden" 
                    />

                    {/* Left stack, middle extract, right drag-drop */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-stretch flex-1">
                      
                      {/* Vertical stack with 3 actions */}
                      <div className="flex flex-col gap-1.5 justify-center">
                        <button 
                          onClick={handleToggleSelectAll}
                          disabled={items.length === 0}
                          className={`w-full py-1.5 px-2 ${t.bgInner} hover:bg-slate-800/80 disabled:opacity-40 text-slate-300 text-[9px] font-bold rounded-xl border border-slate-700/40 hover:border-current/30 flex items-center justify-center gap-1 transition-all cursor-pointer`}
                          title="Select or deselect all pages in workspace"
                        >
                          <CheckSquare className={`w-3 h-3 ${ta.text} shrink-0`} />
                          <span className="truncate">{selectedIds.length === items.length ? 'Deselect All' : 'Select All'}</span>
                        </button>

                        <button 
                          onClick={handleDeleteSelected}
                          disabled={selectedIds.length === 0}
                          className={`w-full py-1.5 px-2 ${t.bgInner} hover:bg-rose-950/20 disabled:opacity-40 text-rose-400 text-[9px] font-bold rounded-xl border border-rose-950/40 hover:border-rose-800/45 flex items-center justify-center gap-1 transition-all cursor-pointer`}
                        >
                          <Trash className="w-3 h-3 shrink-0" />
                          <span className="truncate">Delete ({selectedIds.length})</span>
                        </button>

                        <button 
                          onClick={handleClearWorkspace}
                          disabled={items.length === 0}
                          className={`w-full py-1.5 px-2 transition-all flex items-center justify-center gap-1 text-[9px] font-bold rounded-xl border cursor-pointer ${
                            showClearConfirm
                              ? 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-slate-950 font-black animate-pulse'
                              : `${t.bgInner} hover:bg-amber-950/20 disabled:opacity-40 text-amber-400 border-amber-950/40 hover:border-amber-800/40`
                          }`}
                        >
                          <RefreshCw className={`w-3 h-3 shrink-0 ${showClearConfirm ? 'animate-spin' : ''}`} />
                          <span className="truncate">{showClearConfirm ? 'Erase?' : 'Clear All'}</span>
                        </button>
                      </div>

                      {/* PDF Extraction */}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center p-2 ${t.bgInner} hover:opacity-100 active:scale-95 border-2 border-dashed border-white/40 hover:border-white rounded-xl transition-all group pointer-events-auto min-h-[90px] cursor-pointer`}
                      >
                        <Plus className={`w-4.5 h-4.5 ${ta.text} group-hover:scale-110 transition-transform mb-1 shrink-0`} />
                        <span className="text-[10px] font-bold text-white text-center">Import PDF</span>
                        <span className="text-[8px] text-[#71717A] font-mono text-center mt-0.5">Page extract</span>
                      </button>

                      {/* Image uploader */}
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center p-2 ${t.bgInner} hover:opacity-100 active:scale-95 border-2 border-dashed border-white/40 hover:border-white rounded-xl transition-all group pointer-events-auto min-h-[90px] cursor-pointer`}
                      >
                        <Plus className={`w-4.5 h-4.5 ${ta.text} group-hover:scale-110 transition-transform mb-1 shrink-0`} />
                        <span className="text-[10px] font-bold text-white text-center">Import Image</span>
                        <span className="text-[8px] text-[#71717A] font-mono text-center mt-0.5">PNG, JPEG, etc.</span>
                      </button>

                    </div>

                    {/* COMPILE STITCH BUTTON FOOTER */}
                    <div className="pt-2.5 border-t border-slate-700/40">
                      <button 
                        onClick={() => setShowExportModal(true)}
                        disabled={items.length === 0}
                        className={`w-full py-2.5 px-4 bg-gradient-to-r ${t.pillGradient} text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 ${t.shadowGlow} transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer pointer-events-auto disabled:opacity-30`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Stitch & Export to PDF
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            {/* INTERACTIVE WORKSPACE VIEW (Fits elegantly below command center) */}
            <div className="flex flex-col space-y-6">

              {/* Workspace Board Container */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleWorkspaceDrop}
                className={`${listThemeMode === 'light' ? 'bg-gradient-to-b from-slate-50 to-white' : t.bgCard} border border-dashed ${listThemeMode === 'light' ? 'border-slate-300/85' : t.borderCard} rounded-[24px] p-6 shadow-2xl flex-1 flex flex-col transition-all duration-300`}
              >
                
                <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b ${listThemeMode === 'light' ? 'border-slate-200' : t.borderHeader} mb-6`}>
                  <div className="flex-1 min-w-0">
                    <h2 className={`text-lg font-bold ${listThemeMode === 'light' ? 'text-slate-1000' : 'text-white'} flex items-center gap-2`}>
                      <span className={listThemeMode === 'light' ? 'text-slate-800' : 'text-white'}>Interactive Local Workspace</span>
                      <span className={`text-xs ${listThemeMode === 'light' ? 'bg-slate-200 text-slate-700' : t.badgeBg} font-mono px-2 py-0.5 rounded-md font-bold`}>
                        {items.length} Page{items.length === 1 ? '' : 's'}
                      </span>
                    </h2>
                    <p className={`text-xs ${listThemeMode === 'light' ? 'text-slate-500' : 'text-slate-400'} mt-0.5`}>
                      Rearrange files by dragging cards or using the movement buttons. Click checkbox to select.
                    </p>
                  </div>

                  {/* List Theme Switcher: Dark Mode & Light Mode */}
                  <div className={`flex items-center gap-1.5 self-start sm:self-center p-1 rounded-xl border transition-all ${
                    listThemeMode === 'light' 
                      ? 'bg-slate-200/95 border-slate-300/80' 
                      : 'bg-[#1C1A2D]/85 border-slate-700/50'
                  }`}>
                    <button
                      onClick={() => setListThemeMode('dark')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        listThemeMode === 'dark'
                          ? `bg-gradient-to-r ${t.pillGradient} text-white shadow-sm`
                          : listThemeMode === 'light'
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                      title="Workspace list in Dark mode"
                    >
                      <Moon className="w-3.5 h-3.5" />
                      Dark List
                    </button>
                    <button
                      onClick={() => setListThemeMode('light')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                        listThemeMode === 'light'
                          ? `bg-gradient-to-r ${t.pillGradient} text-white shadow-sm`
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                      title="Workspace list in Light mode"
                    >
                      <Sun className="w-3.5 h-3.5" />
                      Light List
                    </button>
                  </div>
                  
                  {/* Active Loading progress tag */}
                  {!pdfjsLoaded && (
                    <div className="flex items-center gap-2 bg-indigo-950/50 px-3 py-1.5 rounded-lg border border-indigo-800/40 text-[10px] text-indigo-300 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      WASM parser loading
                    </div>
                  )}
                </div>

                {/* Secondary Filters & Sorting Actions Row */}
                {items.length > 0 && (
                  <div className={`p-5 mb-6 rounded-2xl border transition-all ${
                    listThemeMode === 'light' 
                      ? 'bg-slate-50 border-slate-200/80 text-slate-800' 
                      : 'bg-[#141221]/90 border-[#24213B]/80 text-slate-100'
                  }`}>
                    {/* Top Row: Workspace Search Inputs */}
                    <div className="relative w-full mb-4">
                      <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${listThemeMode === 'light' ? 'text-slate-400' : 'text-slate-500'}`} />
                      <input
                        type="text"
                        placeholder="Search workspace pages..."
                        value={workspaceSearch}
                        onChange={(e) => setWorkspaceSearch(e.target.value)}
                        className={`w-full pl-10 pr-9 py-2 text-xs rounded-xl focus:outline-none transition-all ${
                          listThemeMode === 'light'
                            ? `bg-white text-slate-950 border border-slate-200 placeholder:text-slate-450 ${ta.focusBorder} focus:bg-white shadow-sm`
                            : `bg-slate-950 text-white border border-[#2D2A43]/80 placeholder:text-slate-550 ${ta.focusBorder} focus:bg-slate-950 shadow-inner`
                        }`}
                      />
                      {workspaceSearch && (
                        <button
                          onClick={() => setWorkspaceSearch('')}
                          className={`absolute right-3.5 top-1/2 -translate-y-1/2 hover:scale-105 active:scale-95 transition-transform cursor-pointer ${listThemeMode === 'light' ? 'text-slate-400 hover:text-slate-800' : 'text-slate-550 hover:text-white'}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Bottom Row: 3 Options Side by side */}
                    <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-end justify-between">
                      {/* Show Format Selector (Pills style) */}
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <label className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">Show Format:</label>
                        <div className="flex flex-wrap items-center gap-1.5 matches-glow">
                          <button
                            onClick={() => setFileTypeFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              fileTypeFilter === 'all'
                                ? 'text-white shadow-sm font-bold'
                                : listThemeMode === 'light'
                                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                  : 'bg-slate-800/80 text-slate-350 hover:bg-slate-700'
                            }`}
                            style={fileTypeFilter === 'all' ? { backgroundColor: t.primary } : {}}
                          >
                            All ({items.length})
                          </button>
                          <button
                            onClick={() => setFileTypeFilter('pdf')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              fileTypeFilter === 'pdf'
                                ? 'text-white shadow-sm font-bold'
                                : listThemeMode === 'light'
                                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                  : 'bg-slate-800/80 text-slate-350 hover:bg-slate-700'
                            }`}
                            style={fileTypeFilter === 'pdf' ? { backgroundColor: t.primary } : {}}
                          >
                            PDFs ({items.filter(i => i.type === 'pdf').length})
                          </button>
                          <button
                            onClick={() => setFileTypeFilter('png')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              fileTypeFilter === 'png'
                                ? 'text-white shadow-sm font-bold'
                                : listThemeMode === 'light'
                                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                  : 'bg-slate-800/80 text-slate-350 hover:bg-slate-700'
                            }`}
                            style={fileTypeFilter === 'png' ? { backgroundColor: t.primary } : {}}
                          >
                            PNG ({items.filter(i => i.type.toLowerCase() === 'png').length})
                          </button>
                          <button
                            onClick={() => setFileTypeFilter('jpeg')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                              fileTypeFilter === 'jpeg'
                                ? 'text-white shadow-sm font-bold'
                                : listThemeMode === 'light'
                                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                  : 'bg-slate-800/80 text-slate-350 hover:bg-slate-700'
                            }`}
                            style={fileTypeFilter === 'jpeg' ? { backgroundColor: t.primary } : {}}
                          >
                            JPEG ({items.filter(i => i.type.toLowerCase() === 'jpeg' || i.type.toLowerCase() === 'jpg').length})
                          </button>
                        </div>
                      </div>

                      {/* Sort Selector */}
                      <div className="flex flex-col gap-1.5 shrink-0 w-full lg:w-auto lg:min-w-[185px]">
                        <label className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">Sort Arrangement:</label>
                        <select
                          value={sizeSortActive}
                          onChange={(e) => setSizeSortActive(e.target.value as 'none' | 'biggest')}
                          className={`w-full px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer border ${
                            listThemeMode === 'light'
                              ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
                              : 'bg-slate-900 border-[#24213B] text-slate-300 shadow-inner'
                          } focus:outline-none focus:ring-1`}
                          style={{ focusRingColor: t.primary }}
                        >
                          <option value="none" className="text-xs">Original Arrangement</option>
                          <option value="biggest" className="text-xs">File Size: Largest First</option>
                        </select>
                      </div>

                      {/* Layout Mode Selector (Icon buttons switcher) */}
                      <div className="flex flex-col gap-1.5 shrink-0 w-full lg:w-auto">
                        <label className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">View Layout:</label>
                        <div className={`flex items-center gap-1 p-1 rounded-xl border ${
                          listThemeMode === 'light'
                            ? 'bg-slate-100 border-slate-200'
                            : 'bg-slate-950 border-[#24213B]'
                        }`}>
                          <button
                            onClick={() => setViewLayout('full')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
                              viewLayout === 'full'
                                ? 'text-white shadow-sm font-bold'
                                : listThemeMode === 'light'
                                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                            style={viewLayout === 'full' ? { backgroundColor: t.primary } : {}}
                            title="Full Layout: Thumbnail & metadata grid"
                          >
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <span>Full</span>
                          </button>
                          <button
                            onClick={() => setViewLayout('list')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
                              viewLayout === 'list'
                                ? 'text-white shadow-sm font-bold'
                                : listThemeMode === 'light'
                                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                            style={viewLayout === 'list' ? { backgroundColor: t.primary } : {}}
                            title="List Layout: Vertical rows (compact)"
                          >
                            <List className="w-3.5 h-3.5" />
                            <span>List</span>
                          </button>
                          <button
                            onClick={() => setViewLayout('mini')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-all ${
                              viewLayout === 'mini'
                                ? 'text-white shadow-sm font-bold'
                                : listThemeMode === 'light'
                                  ? 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                            style={viewLayout === 'mini' ? { backgroundColor: t.primary } : {}}
                            title="Mini Blocks: Filename-only flow grid"
                          >
                            <Grid className="w-3.5 h-3.5" />
                            <span>Mini</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* GRID WORKSPACE */}
                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-24 px-6 border-2 border-dashed border-[#2D2A43]/50 rounded-2xl bg-[#0F0D17]">
                    <div className="w-16 h-16 rounded-full bg-[#1C1930] border flex items-center justify-center mb-4" style={{ color: t.primary, borderColor: t.primary }}>
                      <Plus className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-100">Your Workspace is Empty</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1.5">
                      Import some local documents (PDF pages or PNG images) mapping them into a unified list to compiler.
                    </p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-6 px-5 py-2.5 bg-[#25223D] hover:bg-[#322E54] hover:shadow-md transition-all text-white text-xs font-bold rounded-xl border border-[#3E3A61]/70 flex items-center gap-2"
                      style={{ hoverBorderColor: t.primary }}
                    >
                      <Plus className="w-4 h-4" /> Import First Asset
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto max-h-[660px] pr-2 custom-scrollbar">
                    {displayedItems.length === 0 ? (
                      <div className="py-24 text-center border-2 border-dashed border-[#2D2A43]/50 rounded-2xl bg-[#0F0D17] flex flex-col items-center justify-center p-6 mt-2">
                        <Info className="w-10 h-10 text-slate-500 mb-3" />
                        <h4 className="text-sm font-bold text-slate-200">No matching items found</h4>
                        <p className="text-xs text-slate-400 max-w-sm mt-1">
                          No workspace documents match your current format filter. Click clear to see all files.
                        </p>
                        <button
                          onClick={() => { setFileTypeFilter('all'); setSizeSortActive('none'); }}
                          className={`mt-4 px-4 py-2 bg-gradient-to-r ${t.pillGradient} text-white text-xs font-bold rounded-xl`}
                        >
                          Reset Filters & Sort
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Full View (Cards view with thumbnail and detailed metadata) */}
                        {viewLayout === 'full' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 xl:gap-5 animate-fadeIn">
                            {displayedItems.map((item) => {
                              const isSelected = selectedIds.includes(item.id);
                              const originalIndex = items.findIndex(i => i.id === item.id);
                              return (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item.id)}
                                  onDragOver={(e) => handleDragOver(e, item.id)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(e) => handleItemSelect(item.id, e)}
                                  className={`relative rounded-2xl ${listThemeMode === 'light' ? 'bg-white' : t.bgInner} p-3 border-2 transition-all cursor-move group select-none ${
                                    listThemeMode === 'light'
                                      ? isSelected 
                                        ? `${ta.borderSelected} ${ta.bgSelectedLight} shadow-lg ring-1 ${ta.ringSelected}` 
                                        : `bg-white border-slate-200 ${ta.hoverBorderLight} hover:bg-slate-50 shadow-md`
                                      : isSelected 
                                        ? `${ta.borderSelected} ${ta.bgSelectedDark} shadow-lg ring-1 ${ta.ringSelected}` 
                                        : `${t.borderCard} ${ta.hoverBorderDark} hover:bg-slate-800/10 shadow-md`
                                  }`}
                                >
                                  {/* Top-left cluster: Selection Checkbox, Rotate Page, and Position badge */}
                                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 matches-glow">
                                    <input 
                                      type="checkbox" 
                                      checked={isSelected}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={() => toggleCheckboxSelection(item.id)}
                                      className={`w-4 h-4 rounded bg-slate-950 border-slate-700 ${ta.accentCheckbox} focus:ring-offset-0 cursor-pointer pointer-events-auto`}
                                      title="Toggle selection tag"
                                    />
                                    
                                    <button 
                                      onClick={(e) => handleRotateItem(item.id, e)}
                                      className={`p-1.5 bg-slate-900/90 ${ta.hoverBg} hover:text-white text-slate-300 rounded-md transition-colors pointer-events-auto border border-slate-800/60 flex items-center justify-center cursor-pointer`}
                                      title="Rotate 90° Clockwise"
                                    >
                                      <RotateCw className="w-3.5 h-3.5" />
                                    </button>
        
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleFavorite(item);
                                      }}
                                      className={`p-1.5 rounded-md transition-colors pointer-events-auto border flex items-center justify-center cursor-pointer ${
                                        favorites.some(fav => fav.dataUrl === item.dataUrl)
                                          ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                                          : 'bg-slate-900/90 hover:bg-amber-550 hover:text-slate-950 text-slate-300 border-slate-800/60'
                                      }`}
                                      title={favorites.some(fav => fav.dataUrl === item.dataUrl) ? "Remove from Saved Library" : "Save to Favorites Sidebar"}
                                    >
                                      <Star className={`w-3.5 h-3.5 ${favorites.some(fav => fav.dataUrl === item.dataUrl) ? 'fill-current' : ''}`} />
                                    </button>
        
                                    <div className={`bg-slate-900/80 px-2 py-0.5 rounded text-[10px] ${ta.text} font-bold font-mono`}>
                                      POS {originalIndex + 1}
                                    </div>
                                  </div>
        
                                  {/* Thumbnail Display Wrapper */}
                                  <div className={`w-full h-44 rounded-xl overflow-hidden flex items-center justify-center p-2 relative ${
                                    listThemeMode === 'light' ? 'bg-slate-100 border border-slate-200/80' : 'bg-slate-950/90'
                                  }`}>
                                    <img 
                                      src={item.dataUrl} 
                                      alt={item.name} 
                                      referrerPolicy="no-referrer"
                                      style={{ 
                                        transform: `rotate(${item.rotation || 0}deg)`, 
                                        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                                      }}
                                      className="max-w-full max-h-full object-contain rounded-md shadow-sm pointer-events-none" 
                                    />
                                    
                                    {/* Zoom In button on the bottom left corner of thumbnail */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setZoomedItem(item);
                                      }}
                                      className={`absolute bottom-1.5 left-1.5 p-1.5 bg-slate-900/90 ${ta.hoverBg} hover:text-white text-slate-300 rounded-md transition-colors pointer-events-auto border border-slate-800/60 flex items-center justify-center cursor-pointer shadow-md z-15 active:scale-90`}
                                      title="Zoom In Page"
                                    >
                                      <ZoomIn className="w-3.5 h-3.5" />
                                    </button>
        
                                    {/* Document Type Watermark Overlay */}
                                    <div className="absolute bottom-1 right-1 opacity-25">
                                      {item.type === 'pdf' ? (
                                        <FileText className={`w-8 h-8 ${listThemeMode === 'light' ? 'text-slate-400' : 'text-white'}`} />
                                      ) : (
                                        <ImageIcon className={`w-8 h-8 ${listThemeMode === 'light' ? 'text-slate-400' : 'text-white'}`} />
                                      )}
                                    </div>
                                  </div>
        
                                  {/* Meta Information Footer */}
                                  <div className="mt-3">
                                    <p className={`text-xs font-semibold truncate pr-6 ${
                                      listThemeMode === 'light' ? 'text-slate-800 font-bold' : 'text-slate-200'
                                    }`} title={item.name}>
                                      {item.name}
                                    </p>
                                    
                                    <div className={`flex items-center justify-between mt-1 text-[10px] font-mono ${
                                      listThemeMode === 'light' ? 'text-slate-500' : 'text-slate-400'
                                    }`}>
                                      <span className="flex items-center gap-1">
                                        {item.type === 'pdf' ? (
                                          <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                            PDF P.{item.pageIndex !== undefined ? item.pageIndex + 1 : '1'}
                                          </>
                                        ) : (
                                          <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            {item.type.toUpperCase()} IMAGE
                                          </>
                                        )}
                                      </span>
                                      <span className={`text-[12px] font-black ${ta.text}`}>{normalizeFileSize(item.fileSize)}</span>
                                    </div>
        
                                    {(item.width && item.height) && (
                                      <div className={`flex items-center justify-between mt-2 pt-2 border-t text-[10.5px] font-mono ${
                                        listThemeMode === 'light' ? 'border-slate-200 text-slate-500' : 'border-slate-800/30 text-slate-500'
                                      }`}>
                                        <span className="flex items-center gap-1 text-[11px]">
                                          <span>Res:</span>
                                          <span className={`${listThemeMode === 'light' ? 'text-slate-900' : 'text-slate-100'} font-bold text-[11.5px]`}>
                                            {item.rotation === 90 || item.rotation === 270 ? `${item.height}×${item.width}` : `${item.width}×${item.height}`}
                                          </span>
                                        </span>
                                        {item.aspectRatio && (
                                          <span className={`${
                                            listThemeMode === 'light' 
                                              ? `${ta.bgSelectedLight} border ${ta.borderSelected} ${ta.text}` 
                                              : `${ta.bgBadge} border ${ta.badgeText}`
                                            } px-2.5 py-0.5 rounded text-[10.5px] font-black`}>
                                            {item.rotation === 90 || item.rotation === 270 
                                              ? (item.aspectRatio.includes(':') 
                                                ? item.aspectRatio.split(':').reverse().join(':') 
                                                : item.aspectRatio)
                                              : item.aspectRatio}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
        
                                  {/* Selected Glow Ring indicators */}
                                  {isSelected && (
                                    <div className="absolute -top-1 -right-1 z-20 w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center shadow-lg animate-bounce" style={{ backgroundColor: t.primary }}>
                                      <Check className="w-2.5 h-2.5 text-white stroke-[4px]" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* List Layout (Detailed list rows vertical re-ordering) */}
                        {viewLayout === 'list' && (
                          <div className="flex flex-col gap-2.5 animate-fadeIn">
                            {displayedItems.map((item) => {
                              const isSelected = selectedIds.includes(item.id);
                              const originalIndex = items.findIndex(i => i.id === item.id);
                              return (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item.id)}
                                  onDragOver={(e) => handleDragOver(e, item.id)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(e) => handleItemSelect(item.id, e)}
                                  className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl border-2 transition-all cursor-move group select-none gap-3 ${
                                    listThemeMode === 'light'
                                      ? isSelected
                                        ? `${ta.borderSelected} ${ta.bgSelectedLight} shadow-md`
                                        : `bg-white border-slate-200 ${ta.hoverBorderLight} hover:bg-slate-50`
                                      : isSelected
                                        ? `${ta.borderSelected} ${ta.bgSelectedDark} shadow-md`
                                        : `${t.borderCard} ${ta.hoverBorderDark} hover:bg-slate-800/10`
                                  }`}
                                >
                                  {/* Left details row info */}
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="flex items-center gap-2 shrink-0 matches-glow" onClick={(e) => e.stopPropagation()}>
                                      <input 
                                        type="checkbox" 
                                        checked={isSelected}
                                        onChange={() => toggleCheckboxSelection(item.id)}
                                        className={`w-4 h-4 rounded bg-slate-950 border-slate-700 ${ta.accentCheckbox} cursor-pointer`}
                                      />
                                      
                                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${listThemeMode === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-slate-900/80 text-slate-400'}`}>
                                        #{originalIndex + 1}
                                      </span>
                                    </div>
                                    
                                    {/* Image Thumbnail Preview */}
                                    <div className={`w-10 h-10 rounded bg-slate-950 flex items-center justify-center p-0.5 relative shrink-0 overflow-hidden ${
                                      listThemeMode === 'light' ? 'border border-slate-200' : 'border border-slate-800'
                                    }`}>
                                      <img 
                                        src={item.dataUrl} 
                                        alt="" 
                                        referrerPolicy="no-referrer"
                                        style={{ transform: `rotate(${item.rotation || 0}deg)` }}
                                        className="max-w-full max-h-full object-contain rounded-sm"
                                      />
                                    </div>
                                    
                                    <div className="min-w-0 flex-1">
                                      <p className={`text-xs font-semibold truncate ${listThemeMode === 'light' ? 'text-slate-800 font-bold' : 'text-slate-200'}`} title={item.name}>
                                        {item.name}
                                      </p>
                                      <div className={`flex flex-wrap items-center gap-2 mt-0.5 text-[9.5px] font-mono ${listThemeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {item.type === 'pdf' ? (
                                          <span className="text-purple-450 font-bold">PDF P.{item.pageIndex !== undefined ? item.pageIndex + 1 : '1'}</span>
                                        ) : (
                                          <span className="text-emerald-450 font-bold">{item.type.toUpperCase()}</span>
                                        )}
                                        <span>•</span>
                                        <span className={`font-bold ${ta.text}`}>{normalizeFileSize(item.fileSize)}</span>
                                        {item.width && (
                                          <>
                                            <span>•</span>
                                            <span>{item.rotation === 90 || item.rotation === 270 ? `${item.height}×${item.width}` : `${item.width}×${item.height}`}</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons Row */}
                                  <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                      onClick={(e) => handleRotateItem(item.id, e)}
                                      className={`p-1.5 bg-slate-900/90 ${ta.hoverBg} hover:text-white text-slate-300 rounded-md transition-colors border border-slate-800/60 flex items-center justify-center cursor-pointer`}
                                      title="Rotate 90° Clockwise"
                                    >
                                      <RotateCw className="w-3.5 h-3.5" />
                                    </button>
                                    
                                    <button 
                                      onClick={() => handleToggleFavorite(item)}
                                      className={`p-1.5 rounded-md transition-colors border flex items-center justify-center cursor-pointer ${
                                        favorites.some(fav => fav.dataUrl === item.dataUrl)
                                          ? 'bg-amber-500 text-white border-amber-600'
                                          : 'bg-slate-900/90 hover:bg-amber-550 text-slate-350 hover:text-slate-950 border-slate-800/60'
                                      }`}
                                      title="Favorite"
                                    >
                                      <Star className={`w-3.5 h-3.5 ${favorites.some(fav => fav.dataUrl === item.dataUrl) ? 'fill-current text-white' : ''}`} />
                                    </button>
                                    
                                    <button
                                      onClick={() => setZoomedItem(item)}
                                      className={`p-1.5 bg-slate-900/90 ${ta.hoverBg} hover:text-white text-slate-300 rounded-md transition-colors border border-slate-800/60 flex items-center justify-center cursor-pointer`}
                                      title="Zoom In"
                                    >
                                      <ZoomIn className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  
                                  {isSelected && (
                                    <div className="absolute top-1 right-1 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: t.primary }} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Mini Blocks Layout (Small blocks with file names only, Windows File Explorer Tiles mode) */}
                        {viewLayout === 'mini' && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 animate-fadeIn">
                            {displayedItems.map((item) => {
                              const isSelected = selectedIds.includes(item.id);
                              const originalIndex = items.findIndex(i => i.id === item.id);
                              return (
                                <div
                                  key={item.id}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, item.id)}
                                  onDragOver={(e) => handleDragOver(e, item.id)}
                                  onDragEnd={handleDragEnd}
                                  onClick={(e) => handleItemSelect(item.id, e)}
                                  className={`relative flex items-center p-2 rounded-xl border-2 transition-all cursor-move group select-none gap-2.5 min-h-[50px] ${
                                    listThemeMode === 'light'
                                      ? isSelected
                                        ? `${ta.borderSelected} ${ta.bgSelectedLight} shadow-sm`
                                        : `bg-white border-slate-200 ${ta.hoverBorderLight} hover:bg-slate-50`
                                      : isSelected
                                        ? `${ta.borderSelected} ${ta.bgSelectedDark} shadow-sm`
                                        : `${t.borderCard} ${ta.hoverBorderDark} hover:bg-slate-800/10`
                                  }`}
                                >
                                  {/* Selection checkbox */}
                                  <input 
                                    type="checkbox" 
                                    checked={isSelected}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => toggleCheckboxSelection(item.id)}
                                    className={`w-3.5 h-3.5 rounded bg-slate-950 border-slate-700 ${ta.accentCheckbox} cursor-pointer shrink-0 pointer-events-auto`}
                                  />
                                  
                                  {/* Small Thumbnail Indicator */}
                                  <div className={`w-6 h-6 rounded bg-slate-950 flex items-center justify-center p-0.5 relative shrink-0 ${
                                    listThemeMode === 'light' ? 'border border-slate-200' : 'border border-slate-800'
                                  }`}>
                                    <img 
                                      src={item.dataUrl} 
                                      alt="" 
                                      referrerPolicy="no-referrer"
                                      style={{ transform: `rotate(${item.rotation || 0}deg)` }}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  </div>
                                  
                                  {/* Position index and Title text */}
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[8.5px] font-bold font-mono ${listThemeMode === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>#{originalIndex + 1}</span>
                                      <p className={`text-[11px] font-semibold truncate ${listThemeMode === 'light' ? 'text-slate-850 font-bold' : 'text-slate-200'}`} title={item.name}>
                                        {item.name}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Actions panel sliding in on hover */}
                                  <div className="hidden group-hover:flex items-center gap-1 bg-slate-950 border border-slate-850 rounded-md p-1 absolute right-1 z-10" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={(e) => handleRotateItem(item.id, e)}
                                      className="p-0.5 hover:text-white text-slate-400 cursor-pointer"
                                      title="Rotate 90"
                                    >
                                      <RotateCw className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleToggleFavorite(item)}
                                      className="p-0.5 hover:text-white text-slate-400 cursor-pointer"
                                      title="Toggle Favorite"
                                    >
                                      <Star className={`w-3 h-3 ${favorites.some(fav => fav.dataUrl === item.dataUrl) ? 'text-amber-400 fill-amber-400' : ''}`} />
                                    </button>
                                  </div>
                                  
                                  {isSelected && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white" style={{ backgroundColor: t.primary }} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                
              </div>

              {/* BAR PROGRESS & STATUS (Matches bottom state panel layout details) */}
              <div className={`${t.bgCard} border border-solid ${t.borderCard} rounded-[18px] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg text-xs font-mono`}>
                <div className="flex items-center gap-2 text-[#A6A3C0] text-center sm:text-left">
                  <span className="inline-block w-2.5 h-2.5 rounded-full animate-pulse shrink-0" style={{ backgroundColor: t.primary }} />
                  <span>Status: <b>{status}</b></span>
                </div>

                {isExporting && (
                  <div className={`flex items-center gap-3 w-full sm:w-auto shrink-0 ${t.bgInner} p-2 rounded-xl border ${t.borderCard}/60`}>
                    <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`bg-gradient-to-r ${t.pillGradient} h-2 rounded-full transition-all duration-300`} 
                        style={{ width: `${exportProgress}%` }}
                      />
                    </div>
                    <span className={`text-[10px] ${t.textAccent} font-bold whitespace-nowrap`}>{exportProgress}% Completed</span>
                  </div>
                )}

                <div className={`text-[#A6A3C0] ${t.bgInner} px-3 py-1.5 rounded-xl border ${t.borderCard}/70 font-bold tracking-tight`}>
                  Grand Total Pages: <span className="text-white font-bold">{items.length}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

        {/* ======================= VIEW MODE 2: CODE EXPLORER PANEL ======================= */}
        {currentView === 'python-code' && (
          <div className={`${t.bgCard} border border-dashed ${t.borderCard} rounded-[24px] p-6 sm:p-8 shadow-2xl space-y-6`}>
            
            {/* Explanatory introduction banner */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 ${t.bgInner} border ${t.borderCard}/45 rounded-2xl relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
              <div className="space-y-1 z-10 max-w-2xl">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className={`${t.textAccent} w-5 h-5 shrink-0`} />
                  Pruned Standalone Desktop Engine for local compile
                </h3>
                <p className="text-xs text-slate-300">
                  This Python 3 application leverages the exact backend mechanics used by real-world high speed layout compilers. It employs PySide6 for building Qt layouts and PyMuPDF (fitz) for GPU-optimized PDF page slicing and high quality RGB888 vector mappings.
                </p>
              </div>

              <div className="flex gap-2.5 z-10 shrink-0">
                <button 
                  onClick={handleCopyPythonCode}
                  className={`px-4 py-2 ${t.bgInner} hover:bg-slate-800 text-slate-250 hover:text-white text-xs font-bold rounded-xl border ${t.borderCard}/80 hover:border-current flex items-center gap-2 transition-all cursor-pointer`}
                >
                  {pythonCodeCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>

                <button 
                  onClick={handleDownloadPythonFile}
                  className={`px-4 py-2 bg-gradient-to-r ${t.pillGradient} text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md hover:opacity-90 transition-all cursor-pointer`}
                >
                  <Download className="w-4 h-4" />
                  Download main.py
                </button>
              </div>
            </div>

            {/* PIP CONFIGURATION BLOCK */}
            <div className={`${t.bgInner} border border-solid ${t.borderCard}/85 rounded-2xl p-5 font-mono text-xs`}>
              <span className="text-slate-500 font-bold uppercase tracking-wider block mb-3 text-[10px]">1. Local Pip Package Installation</span>
              <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-lg text-indigo-300 overflow-x-auto relative">
                <code>pip install PySide6 pymupdf</code>
                
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText('pip install PySide6 pymupdf');
                    setStatus('Instruction command copied to clipboard.');
                  }}
                  className="absolute top-2.5 right-2 text-slate-500 hover:text-slate-300 p-1 bg-slate-900/60 rounded"
                  title="Copy installation command"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* PYTHON SCRIPT GORGEOUS TERMINAL BOX */}
            <div className="space-y-2">
              <div className={`flex items-center justify-between px-4 py-3 bg-slate-950/90 border border-solid border-slate-800 rounded-t-2xl border-b-0 text-xs font-mono text-slate-400`}>
                <span className="flex items-center gap-2 text-white">
                  <span className="w-3 h-3 rounded-full bg-red-500/90" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/90" />
                  <span className="w-3 h-3 rounded-full bg-green-500/90" />
                  <span className="ml-2 font-semibold">main.py (PySide6 Standalone Native)</span>
                </span>
                <span className={`text-[10px] tracking-wider uppercase font-bold ${t.textAccent}`}>python 3 script</span>
              </div>

              <div className={`bg-black/95 border border-solid border-slate-800 rounded-b-2xl p-5 overflow-auto max-h-[500px] text-xs font-mono leading-relaxed text-indigo-100/90 shadow-inner`}>
                <pre className="whitespace-pre">{getRawPythonCode(currentTheme)}</pre>
              </div>
            </div>

            {/* STEP BY STEP TUTORIAL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`bg-slate-950/40 border border-${t.borderCard}/45 rounded-xl p-5`}>
                <div className={`w-8 h-8 rounded-full ${t.bgInner} border border-slate-700 flex items-center justify-center text-xs font-bold text-white mb-3`}>
                  01
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Install PySide & PyMuPDF</h4>
                <p className="text-xs text-slate-400">
                  Ensure Python 3 is installed. Open your command terminal and execute: <code className="text-slate-200">pip install PySide6 pymupdf</code>.
                </p>
              </div>

              <div className={`bg-slate-950/40 border border-${t.borderCard}/45 rounded-xl p-5`}>
                <div className={`w-8 h-8 rounded-full ${t.bgInner} border border-slate-700 flex items-center justify-center text-xs font-bold text-white mb-3`}>
                  02
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Download & Save script</h4>
                <p className="text-xs text-slate-400">
                  Download the file using the button above or copy the contents and save it on your machine as <code className="text-slate-200">main.py</code>.
                </p>
              </div>

              <div className={`bg-slate-950/40 border border-${t.borderCard}/45 rounded-xl p-5`}>
                <div className={`w-8 h-8 rounded-full ${t.bgInner} border border-slate-700 flex items-center justify-center text-xs font-bold text-white mb-3`}>
                  03
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Launch Native GUI</h4>
                <p className="text-xs text-slate-400">
                  Run the Python interpreter script: <code className="text-slate-200">python main.py</code>, and enjoy organizing files locally on your machine.
                </p>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ======================= EXPORT FILENAME DIALOG MODAL ======================= */}
      {showExportModal && (() => {
        const compileList = exportOnlySelected 
          ? items.filter(item => selectedIds.includes(item.id))
          : items;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-all duration-300">
            <div 
              className={`${t.bgCard} border border-solid ${t.borderCard} max-w-md w-full rounded-[24px] overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.8)] p-6 relative space-y-4 animate-scale-up`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className={`w-5 h-5 ${t.textAccent}`} />
                  Export PDF Configuration
                </h3>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Info */}
              <div className="space-y-3.5 max-h-[64vh] overflow-y-auto pr-0.5 custom-scrollbar">
                <div className={`p-4 ${t.bgInner} rounded-xl border ${t.borderCard}/40 space-y-1.5`}>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Total working pages:</span>
                    <span className="font-bold text-white">{items.length} Page(s)</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Export Selection Range:</span>
                    <span className={`font-bold ${ta.text}`}>
                      {exportOnlySelected 
                        ? `${selectedIds.length} of ${items.length} Selected` 
                        : 'All Pages (Entire Workspace)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Compilation Engine:</span>
                    <span className="font-mono text-xs text-slate-300">pdf-lib client merger</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Security Status:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
                      100% Secure local sandboxed context
                    </span>
                  </div>
                </div>

                {/* Compilation Toggle Option */}
                <div className={`p-3.5 bg-slate-900/60 rounded-xl border ${t.borderCard}/40 flex items-center justify-between gap-3`}>
                  <div className="flex-1">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <CheckSquare className={`w-3.5 h-3.5 ${ta.text}`} />
                      Compile Selected Only
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                      {selectedIds.length === 0 
                        ? 'No pages selected in workspace (unavailable)' 
                        : `Compile only the ${selectedIds.length} marked/selected page(s).`}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={exportOnlySelected}
                      disabled={selectedIds.length === 0}
                      onChange={(e) => setExportOnlySelected(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={`w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r ${t.badgeBg} peer-checked:after:bg-white peer-checked:after:border-transparent ${selectedIds.length === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}></div>
                  </label>
                </div>

                {/* FINAL SEQUENCE PREVIEW SUMMARY LIST */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center justify-between">
                    <span>Compile Sequence Order</span>
                    <span className={`text-[10.5px] font-bold italic font-sans ${ta.text}`}>
                      {compileList.length} page{compileList.length !== 1 ? 's' : ''} in export
                    </span>
                  </label>
                  <div className="max-h-28 overflow-y-auto bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 custom-scrollbar text-xs">
                    {compileList.length === 0 ? (
                      <p className="text-[10.5px] text-slate-500 italic text-center py-2">No pages to list.</p>
                    ) : (
                      compileList.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 text-slate-350 py-0.5 border-b border-slate-900/40 last:border-0 pb-1 last:pb-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span 
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 font-mono"
                              style={{ backgroundColor: t.primary }}
                            >
                              {idx + 1}
                            </span>
                            <span className="truncate text-[11px] text-slate-200" title={item.name}>
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono">
                            <span className="text-slate-500 text-[10px]">
                              p.{item.pageIndex !== undefined ? item.pageIndex + 1 : 1}
                            </span>
                            <span className="uppercase text-[8.5px] px-1.5 py-0.5 rounded bg-slate-900/90 text-amber-500 font-extrabold border border-amber-500/10">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* JPEG Quality Compressor Slider */}
                <div className="space-y-2 p-3 bg-slate-900/60 rounded-xl border border-solid border-[#2D2A43]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      JPEG Quality (Compression)
                    </span>
                    <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${jpegQuality === 100 ? 'bg-slate-850 text-slate-400' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'}`}>
                      {jpegQuality === 100 ? '100% (Lossless)' : `${jpegQuality}% Quality`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5 pt-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 font-mono">Small Size</span>
                    <input 
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={jpegQuality}
                      onChange={(e) => setJpegQuality(Number(e.target.value))}
                      className="flex-1 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer outline-none accent-indigo-500"
                      style={{ accentColor: t.primary }}
                    />
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 font-mono">Best Quality</span>
                  </div>
                  <p className="text-[9.5px] text-slate-450 leading-relaxed">
                    Reducing quality translates to smaller image payload embed sizes, significantly shrinking the final compiled PDF.
                  </p>
                </div>

                {/* Filename Input */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Output Filename
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={exportFilename}
                      onChange={(e) => setExportFilename(e.target.value)}
                      placeholder="e.g. quarterly_report_final"
                      className="w-full pl-3 pr-12 py-2.5 bg-slate-950 border border-slate-800 focus:border-slate-500 rounded-xl text-white text-sm focus:outline-none transition-colors font-mono font-semibold"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setShowExportModal(false);
                          handleExportToPdf();
                        }
                      }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 font-mono">
                      .pdf
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                    Characters like alphanumeric, spaces, and hyphens/underscores are fully supported.
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 pt-3 border-t border-slate-700/40">
                <button 
                  onClick={() => setShowExportModal(false)}
                  className={`flex-1 py-3 px-4 ${t.bgInner} hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border ${t.borderCard} transition-all cursor-pointer`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setShowExportModal(false);
                    handleExportToPdf();
                  }}
                  className={`flex-1 py-3 px-4 bg-gradient-to-r ${t.pillGradient} text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 ${t.shadowGlow} transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer`}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* FULL SCREEN DYNAMIC ZOOM MODAL */}
      {zoomedItem && (() => {
        // Query the live model to react to in-session rotation updates in real-time
        const liveItem = items.find(i => i.id === zoomedItem.id) || zoomedItem;
        const liveRotation = liveItem.rotation || 0;
        const isFav = favorites.some(fav => fav.dataUrl === liveItem.dataUrl);

        return (
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
            onClick={() => setZoomedItem(null)}
          >
            <div 
              className="bg-[#0F0D19] border border-[#2D2A43] rounded-3xl p-5 sm:p-6 max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl relative animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Details & Action Bars */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 mb-4 gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[280px] sm:max-w-xl" title={liveItem.name}>
                    {liveItem.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2.5 text-[11.5px] text-slate-300 font-mono mt-1.5">
                    <span className="uppercase text-amber-500 font-extrabold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/10 text-[10px]">{liveItem.type}</span>
                    <span className="flex items-center gap-1">
                      <span>File Size:</span>
                      <strong className={`font-bold ${ta.text}`}>{normalizeFileSize(liveItem.fileSize)}</strong>
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1">
                      <span>Resolution:</span>
                      <strong className="text-emerald-400 font-bold">
                        {liveRotation === 90 || liveRotation === 270 ? `${liveItem.height} × ${liveItem.width}` : `${liveItem.width} × ${liveItem.height}`} px
                      </strong>
                    </span>
                    {liveItem.aspectRatio && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="flex items-center gap-1">
                          <span>Ratio:</span>
                          <strong className={`font-bold ${ta.text}`}>
                            {liveRotation === 90 || liveRotation === 270 
                              ? (liveItem.aspectRatio.includes(':') 
                                ? liveItem.aspectRatio.split(':').reverse().join(':') 
                                : liveItem.aspectRatio)
                              : liveItem.aspectRatio}
                          </strong>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => setZoomedItem(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-transparent hover:border-slate-800 cursor-pointer flex items-center justify-center shrink-0"
                  title="Close zoom popup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Large Image Canvas */}
              <div className="flex-1 overflow-auto flex flex-col items-center justify-center p-4 bg-slate-950/85 rounded-2xl border border-slate-900/40 relative min-h-[40vh] max-h-[60vh] custom-scrollbar">
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <img 
                    src={liveItem.dataUrl} 
                    alt={liveItem.name} 
                    referrerPolicy="no-referrer"
                    style={{ 
                      transform: `rotate(${liveRotation}deg)`,
                      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    className="max-w-full max-h-[50vh] object-contain rounded-md shadow-2xl" 
                  />
                  {isCropping && (
                    <div 
                      className="absolute border-[2px] border-dashed border-emerald-400 bg-emerald-500/15 pointer-events-none z-50 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.3)]" 
                      style={{
                        left: `${cropLeft}%`,
                        right: `${cropRight}%`,
                        top: `${cropTop}%`,
                        bottom: `${cropBottom}%`,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Cropping Control HUD */}
              {isCropping && (
                <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-solid border-slate-800/80 space-y-3 mt-3.5 animate-fade-in shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-sans font-sans">
                      <Scissors className="w-3.5 h-3.5" />
                      Visual Inset Cropping Controls (Adjust Borders)
                    </span>
                    <div className="flex gap-1.5 font-sans">
                      <button 
                        onClick={() => { setCropLeft(5); setCropRight(5); setCropTop(5); setCropBottom(5); }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-705 text-[10px] font-bold text-slate-300 rounded transition-all cursor-pointer"
                      >
                        5% Margins
                      </button>
                      <button 
                        onClick={() => { setCropLeft(10); setCropRight(10); setCropTop(10); setCropBottom(10); }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-705 text-[10px] font-bold text-slate-300 rounded transition-all cursor-pointer"
                      >
                        10% Margins
                      </button>
                      <button 
                        onClick={() => { setCropLeft(0); setCropRight(0); setCropTop(0); setCropBottom(0); }}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-705 text-[10px] font-bold text-slate-300 rounded transition-all cursor-pointer"
                      >
                        Reset Bounds
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#0a0812] p-2.5 rounded-xl border border-slate-900/40">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10.5px] text-slate-400 font-mono">
                        <span>Left Cutout:</span>
                        <span className="text-emerald-400 font-bold">{cropLeft}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="45"
                        value={cropLeft}
                        onChange={(e) => setCropLeft(Math.min(45, Number(e.target.value)))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10.5px] text-slate-400 font-mono">
                        <span>Right Cutout:</span>
                        <span className="text-emerald-400 font-bold">{cropRight}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="45"
                        value={cropRight}
                        onChange={(e) => setCropRight(Math.min(45, Number(e.target.value)))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10.5px] text-slate-400 font-mono">
                        <span>Top Cutout:</span>
                        <span className="text-emerald-400 font-bold">{cropTop}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="45"
                        value={cropTop}
                        onChange={(e) => setCropTop(Math.min(45, Number(e.target.value)))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10.5px] text-slate-400 font-mono">
                        <span>Bottom Cutout:</span>
                        <span className="text-emerald-400 font-bold">{cropBottom}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="45"
                        value={cropBottom}
                        onChange={(e) => setCropBottom(Math.min(45, Number(e.target.value)))}
                        className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-xs font-sans">
                    <button
                      onClick={() => {
                        setIsCropping(false);
                        setCropLeft(0);
                        setCropRight(0);
                        setCropTop(0);
                        setCropBottom(0);
                      }}
                      className="px-3.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-lg cursor-pointer border border-slate-700"
                    >
                      Cancel Crop
                    </button>
                    <button
                      onClick={() => handleApplyCrop(liveItem.id)}
                      className="px-4 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-lg cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/10"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      Apply Slice Crop
                    </button>
                  </div>
                </div>
              )}

              {/* Operations Footer */}
              <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-slate-800/80 gap-3">
                <div className="flex items-center gap-2">
                  {!isCropping && (
                    <>
                      <button
                        onClick={() => handleRotateItem(liveItem.id)}
                        className={`px-3 py-1.5 bg-[#1C1A2D] hover:bg-[#25223A] border border-slate-800/80 hover:border-current text-xs font-bold text-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm`}
                        style={{ hoverBorderColor: t.primary }}
                        title="Rotate active image clockwise"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        Rotate 90°
                      </button>

                      <button
                        onClick={() => {
                          setIsCropping(true);
                          setCropLeft(5);
                          setCropRight(5);
                          setCropTop(5);
                          setCropBottom(5);
                        }}
                        className={`px-3 py-1.5 bg-[#1C1A2D] hover:bg-[#25223A] border border-slate-800/80 hover:border-current text-xs font-bold text-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm`}
                        style={{ hoverBorderColor: t.primary }}
                        title="Crop document margins and borders"
                      >
                        <Crop className="w-3.5 h-3.5 text-emerald-400" />
                        Crop Page
                      </button>

                      {liveItem.originalDataUrl && (
                        <button
                          onClick={() => handleUndoCrop(liveItem.id)}
                          className="px-3 py-1.5 bg-[#2E141E] hover:bg-[#3E1C2B] border border-red-900/50 hover:border-red-500 text-xs font-bold text-red-300 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
                          title="Restore original uncropped image"
                        >
                          <Undo className="w-3.5 h-3.5 text-red-450" />
                          Undo Crop / Restore
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleFavorite(liveItem)}
                        className={`px-3 py-1.5 border text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm ${
                          isFav
                            ? 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white'
                            : 'bg-[#1C1A2D] hover:bg-[#282544] border-slate-800 text-slate-300'
                        }`}
                        title={isFav ? "Delete from Saved templates" : "Star to Saved library templates"}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                        {isFav ? 'Starred Template' : 'Star Template'}
                      </button>
                    </>
                  )}
                  {isCropping && (
                    <span className="text-[11px] text-emerald-400 font-mono font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      Crop Area is highlighted above. Use the sliders in crop HUD to lock borders.
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setZoomedItem(null);
                    setIsCropping(false);
                  }}
                  className={`px-5 py-1.5 bg-gradient-to-r ${t.pillGradient} hover:opacity-90 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all active:translate-y-0 hover:-translate-y-0.5`}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// Complete raw python code matching the main.py created so the copy-paste action inside App.tsx is perfectly accurate
function getRawPythonCode(themeId: string = 'violet'): string {
  const t = THEMES[themeId as keyof typeof THEMES] || THEMES.violet;
  const qss = {
    mainBg: themeId === 'violet' ? '#0F0E14' : themeId === 'cyberpunk' ? '#040711' : themeId === 'nordic' ? '#0F172A' : '#0B0603',
    panelBg: themeId === 'violet' ? '#141221' : themeId === 'cyberpunk' ? '#0A0D1A' : themeId === 'nordic' ? '#1E293B' : '#1B110B',
    listBg: themeId === 'violet' ? '#13121D' : themeId === 'cyberpunk' ? '#080A15' : themeId === 'nordic' ? '#182235' : '#140D08',
    itemBg: themeId === 'violet' ? '#191826' : themeId === 'cyberpunk' ? '#11162A' : themeId === 'nordic' ? '#334155' : '#291A10',
    itemHover: themeId === 'violet' ? '#242236' : themeId === 'cyberpunk' ? '#17223C' : themeId === 'nordic' ? '#475569' : '#392518',
    itemSelect: themeId === 'violet' ? '#372A5C' : themeId === 'cyberpunk' ? '#123D47' : themeId === 'nordic' ? '#312E81' : '#5B2100',
    borderCard: themeId === 'violet' ? '#2D2A43' : themeId === 'cyberpunk' ? '#1E3A5F' : themeId === 'nordic' ? '#475569' : '#452715',
    primary: t.primary,
    accent: t.accent,
  };
  return `#!/usr/bin/env python3
"""
LocalPDFManager - A Zero-Telemetry, Standalone Offline Desktop Application
Built with PyQt6/PySide6 & PyMuPDF (fitz)
"""

import sys
import os
from PySide6.QtCore import Qt, QSize, QThread, Signal, Slot
from PySide6.QtGui import QImage, QPixmap, QIcon, QKeySequence, QShortcut
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QHBoxLayout, QVBoxLayout, 
    QPushButton, QListWidget, QListWidgetItem, QFileDialog, QMessageBox, 
    QLabel, QFrame, QProgressBar, QAbstractItemView
)

try:
    import fitz
except ImportError:
    print("Error: PyMuPDF is not installed. Please run: pip install pymupdf")
    sys.exit(1)


class PDFPageLoaderWorker(QThread):
    """
    Worker thread to load and render PDF pages in the background
    to keep the GUI responsive during heavy file loads.
    """
    page_rendered = Signal(str, int, QPixmap, int)  # file_path, page_num, pixmap, total_pages
    loading_finished = Signal()
    loading_error = Signal(str)

    def __init__(self, file_paths):
        super().__init__()
        self.file_paths = file_paths

    def run(self):
        for file_path in self.file_paths:
            try:
                doc = fitz.open(file_path)
                total_pages = len(doc)
                
                for page_num in range(total_pages):
                    page = doc.load_page(page_num)
                    
                    zoom = 1.5  # Clear resolution matrix scale
                    mat = fitz.Matrix(zoom, zoom)
                    pix = page.get_pixmap(matrix=mat)
                    
                    try:
                        ptr = pix.samples
                        qimg = QImage(ptr, pix.width, pix.height, pix.stride, QImage.Format_RGB888)
                    except Exception:
                        png_data = pix.tobytes("png")
                        qimg = QImage.fromData(png_data)
                    
                    pixmap = QPixmap.fromImage(qimg)
                    self.page_rendered.emit(file_path, page_num, pixmap, total_pages)
                
                doc.close()
            except Exception as e:
                self.loading_error.emit(f"Failed to load '{os.path.basename(file_path)}': {str(e)}")
        
        self.loading_finished.emit()


class LocalPDFManager(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("LocalPDFManager — Desktop PDF Editor")
        self.resize(1100, 750)
        
        self.apply_theme()
        
        central_widget = QWidget()
        central_widget.setObjectName("centralWidget")
        self.setCentralWidget(central_widget)
        
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(16, 16, 16, 16)
        main_layout.setSpacing(16)
        
        # LEFT PANEL (Control Panel)
        control_panel = QFrame()
        control_panel.setObjectName("controlPanel")
        control_panel.setFixedWidth(260)
        
        control_layout = QVBoxLayout(control_panel)
        control_layout.setContentsMargins(16, 20, 16, 20)
        control_layout.setSpacing(14)
        
        app_title = QLabel("LocalPDFManager")
        app_title.setStyleSheet("font-size: 20px; font-weight: bold; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif;")
        control_layout.addWidget(app_title)
        
        app_subtitle = QLabel("100% Offline | Zero-Telemetry")
        app_subtitle.setStyleSheet("font-size: 11px; color: #787693; font-weight: 500;")
        control_layout.addWidget(app_subtitle)
        
        line = QFrame()
        line.setFrameShape(QFrame.HLine)
        line.setStyleSheet("color: #2D2A43; background-color: #2D2A43; max-height: 1px;")
        control_layout.addWidget(line)
        
        control_layout.addSpacing(10)
        
        btn_caption_1 = QLabel("MANAGE CHANNELS")
        btn_caption_1.setStyleSheet("font-size: 11px; color: #A6A3C0; font-weight: bold; letter-spacing: 1px;")
        control_layout.addWidget(btn_caption_1)
        
        self.btn_add_png = QPushButton("Add PNGs")
        self.btn_add_png.setObjectName("addPngBtn")
        self.btn_add_png.clicked.connect(self.add_pngs)
        control_layout.addWidget(self.btn_add_png)
        
        self.btn_add_pdf = QPushButton("Add PDF")
        self.btn_add_pdf.setObjectName("addPdfBtn")
        self.btn_add_pdf.clicked.connect(self.add_pdfs)
        control_layout.addWidget(self.btn_add_pdf)
        
        control_layout.addSpacing(10)
        
        btn_caption_2 = QLabel("EDIT WORKSPACE")
        btn_caption_2.setStyleSheet("font-size: 11px; color: #A6A3C0; font-weight: bold; letter-spacing: 1px;")
        control_layout.addWidget(btn_caption_2)
        
        self.btn_delete = QPushButton("Delete Selected")
        self.btn_delete.setObjectName("deleteBtn")
        self.btn_delete.clicked.connect(self.delete_selected)
        control_layout.addWidget(self.btn_delete)
        
        self.btn_clear = QPushButton("Clear Workspace")
        self.btn_clear.setObjectName("clearBtn")
        self.btn_clear.clicked.connect(self.clear_workspace)
        control_layout.addWidget(self.btn_clear)
        
        control_layout.addStretch()
        
        self.btn_export = QPushButton("Export to PDF")
        self.btn_export.setObjectName("exportBtn")
        self.btn_export.clicked.connect(self.export_to_pdf)
        control_layout.addWidget(self.btn_export)
        
        main_layout.addWidget(control_panel)
        
        # RIGTH AREA (WORKSPACE)
        workspace_layout = QVBoxLayout()
        workspace_layout.setSpacing(12)
        
        header_row = QHBoxLayout()
        workspace_title = QLabel("PDF Workspace Pages")
        workspace_title.setStyleSheet("font-size: 18px; font-weight: bold; color: #E2E8F0;")
        header_row.addWidget(workspace_title)
        
        workspace_desc = QLabel("Drag & Drop cells to rearrange sequence")
        workspace_desc.setStyleSheet("font-size: 11px; color: #787693;")
        header_row.addStretch()
        header_row.addWidget(workspace_desc)
        workspace_layout.addLayout(header_row)
        
        self.list_widget = QListWidget()
        self.list_widget.setObjectName("workspaceList")
        self.list_widget.setViewMode(QAbstractItemView.IconMode)
        self.list_widget.setResizeMode(QAbstractItemView.Adjust)
        self.list_widget.setMovement(QAbstractItemView.Snap)
        self.list_widget.setSelectionMode(QAbstractItemView.ExtendedSelection)
        
        self.list_widget.setDragEnabled(True)
        self.list_widget.setAcceptDrops(True)
        self.list_widget.setDropIndicatorShown(True)
        self.list_widget.setDragDropMode(QAbstractItemView.InternalMove)
        
        self.list_widget.setIconSize(QSize(120, 160))
        self.list_widget.setGridSize(QSize(148, 210))
        
        workspace_layout.addWidget(self.list_widget)
        
        self.statusBarPanel = QFrame()
        self.statusBarPanel.setObjectName("statusBarPanel")
        self.statusBarPanel.setFixedHeight(40)
        
        status_layout = QHBoxLayout(self.statusBarPanel)
        status_layout.setContentsMargins(12, 0, 12, 0)
        
        self.lbl_status = QLabel("Ready")
        self.lbl_status.setStyleSheet("color: #A1A1AA; font-size: 11px; font-family: monospace;")
        status_layout.addWidget(self.lbl_status)
        
        status_layout.addStretch()
        
        self.progress_bar = QProgressBar()
        self.progress_bar.setObjectName("statusProgressBar")
        self.progress_bar.setFixedWidth(200)
        self.progress_bar.setFixedHeight(8)
        self.progress_bar.setTextVisible(False)
        self.progress_bar.setVisible(False)
        status_layout.addWidget(self.progress_bar)
        
        self.lbl_page_count = QLabel("Total Pages: 0")
        self.lbl_page_count.setStyleSheet("color: #A1A1AA; font-size: 11px; font-weight: bold; font-family: monospace;")
        status_layout.addWidget(self.lbl_page_count)
        
        workspace_layout.addWidget(self.statusBarPanel)
        main_layout.addLayout(workspace_layout)
        
        self.del_shortcut = QShortcut(QKeySequence.Delete, self)
        self.del_shortcut.activated.connect(self.delete_selected)
        
        self.loaders = []
        self.update_page_count()

    def apply_theme(self):
        styles = """
            QMainWindow {
                background: ${qss.mainBg};
            }
            #centralWidget {
                background-color: ${qss.mainBg};
            }
            #controlPanel {
                background-color: ${qss.panelBg};
                border: 1px dashed ${qss.borderCard};
                border-radius: 20px;
            }
            #workspaceList {
                background-color: ${qss.listBg};
                border: 2px dashed ${qss.borderCard};
                border-radius: 20px;
                padding: 12px;
                color: #FFFFFF;
                outline: none;
            }
            #workspaceList::item {
                background-color: ${qss.itemBg};
                border: 1px solid ${qss.borderCard};
                color: #E2E8F0;
                border-radius: 14px;
                margin: 4px;
                padding: 8px;
            }
            #workspaceList::item:hover {
                background-color: ${qss.itemHover};
                border: 1px solid ${qss.borderCard};
            }
            #workspaceList::item:selected {
                background-color: ${qss.itemSelect};
                border: 1.5px solid ${qss.primary};
                color: #FFFFFF;
            }
            QPushButton {
                background-color: ${qss.listBg};
                color: #E2E8F0;
                border: 1px solid ${qss.borderCard};
                border-radius: 18px;
                padding: 10px 16px;
                font-size: 12px;
                font-family: inherit;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: ${qss.itemHover};
                border-color: ${qss.primary};
            }
            QPushButton:pressed {
                background-color: ${qss.itemSelect};
            }
            #deleteBtn {
                border-color: #551D30;
                color: #FF859F;
            }
            #deleteBtn:hover {
                background-color: #3B121E;
            }
            #clearBtn {
                border-color: #4C3C21;
                color: #FBBF24;
            }
            #clearBtn:hover {
                background-color: #332612;
            }
            #exportBtn {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                                            stop:0 ${qss.primary}, stop:1 ${qss.accent});
                border: none;
                color: #FFFFFF;
                border-radius: 18px;
                padding: 12px 18px;
                font-size: 13px;
                font-weight: bold;
                min-height: 20px;
            }
            #exportBtn:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                                            stop:0 ${qss.primary}, stop:1 ${qss.accent});
                opacity: 0.9;
            }
            #statusBarPanel {
                background-color: ${qss.listBg};
                border: 1px dashed ${qss.borderCard};
                border-radius: 12px;
            }
            #statusProgressBar::chunk {
                background-color: ${qss.accent};
                border-radius: 4px;
            }
            #statusProgressBar {
                background-color: ${qss.itemBg};
                border: none;
                border-radius: 4px;
            }
        """
        self.setStyleSheet(styles)

    @Slot()
    def add_pngs(self):
        file_paths, _ = QFileDialog.getOpenFileNames(
            self, "Import PNG Images", "", "Image Files (*.png)"
        )
        if not file_paths:
            return
        
        self.lbl_status.setText("Importing PNG files...")
        count = 0
        for path in file_paths:
            pixmap = QPixmap(path)
            if pixmap.isNull():
                continue
                
            filename = os.path.basename(path)
            item = QListWidgetItem()
            item.setText(filename)
            
            item.setData(Qt.UserRole + 1, "png")
            item.setData(Qt.UserRole + 2, path)
            item.setData(Qt.UserRole + 3, 0)
            
            scale_size = QSize(120, 160)
            scaled_pixmap = pixmap.scaled(scale_size, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            item.setIcon(QIcon(scaled_pixmap))
            
            self.list_widget.addItem(item)
            count += 1
            
        self.lbl_status.setText(f"Successfully added {count} PNG image(s).")
        self.update_page_count()

    @Slot()
    def add_pdfs(self):
        file_paths, _ = QFileDialog.getOpenFileNames(
            self, "Import PDF Files", "", "PDF Files (*.pdf)"
        )
        if not file_paths:
            return
            
        self.lbl_status.setText("Preparing PDF files...")
        self.progress_bar.setVisible(True)
        self.progress_bar.setRange(0, 0)

        self.set_interaction_enabled(False)

        worker = PDFPageLoaderWorker(file_paths)
        worker.page_rendered.connect(self.on_worker_page_rendered)
        worker.loading_error.connect(self.on_worker_error)
        worker.loading_finished.connect(self.on_worker_finished)
        
        self.loaders.append(worker)
        worker.start()

    @Slot(str, int, QPixmap, int)
    def on_worker_page_rendered(self, file_path, page_num, pixmap, total_pages):
        filename = os.path.basename(file_path)
        item = QListWidgetItem()
        item.setText(f"Page {page_num + 1}\\n{filename}")
        
        item.setData(Qt.UserRole + 1, "pdf")
        item.setData(Qt.UserRole + 2, file_path)
        item.setData(Qt.UserRole + 3, page_num)
        
        scaled_pixmap = pixmap.scaled(QSize(120, 160), Qt.KeepAspectRatio, Qt.SmoothTransformation)
        item.setIcon(QIcon(scaled_pixmap))
        
        self.list_widget.addItem(item)
        self.update_page_count()

    @Slot(str)
    def on_worker_error(self, message):
        QMessageBox.critical(self, "PDF Loading Error", message)

    @Slot()
    def on_worker_finished(self):
        for w in self.loaders:
            if w.isFinished():
                self.loaders.remove(w)
                
        self.progress_bar.setVisible(False)
        self.set_interaction_enabled(True)
        self.lbl_status.setText("PDF Loading completed successfully.")
        self.update_page_count()

    def set_interaction_enabled(self, enabled):
        self.btn_add_png.setEnabled(enabled)
        self.btn_add_pdf.setEnabled(enabled)
        self.btn_export.setEnabled(enabled)
        self.btn_clear.setEnabled(enabled)
        self.btn_delete.setEnabled(enabled)

    @Slot()
    def delete_selected(self):
        selected_items = self.list_widget.selectedItems()
        if not selected_items:
            return
            
        for item in selected_items:
            self.list_widget.takeItem(self.list_widget.row(item))
            
        self.lbl_status.setText(f"Deleted {len(selected_items)} page(s) from workspace.")
        self.update_page_count()

    @Slot()
    def clear_workspace(self):
        if self.list_widget.count() == 0:
            return
            
        confirm = QMessageBox.question(
            self, "Clear Entire Workspace?", 
            "Are you sure you want to clear your working workspace?",
            QMessageBox.Yes | QMessageBox.No
        )
        if confirm == QMessageBox.Yes:
            self.list_widget.clear()
            self.lbl_status.setText("Workspace cleared.")
            self.update_page_count()

    def update_page_count(self):
        cnt = self.list_widget.count()
        self.lbl_page_count.setText(f"Total Pages: {cnt}")

    @Slot()
    def export_to_pdf(self):
        count = self.list_widget.count()
        if count == 0:
            QMessageBox.warning(self, "Empty Workspace", "No pages in your workspace. Add items first.")
            return
            
        output_path, _ = QFileDialog.getSaveFileName(
            self, "Save Unified PDF", "output.pdf", "PDF Documents (*.pdf)"
        )
        if not output_path:
            return
            
        self.lbl_status.setText("Exporting and compiling PDF...")
        self.progress_bar.setVisible(True)
        self.progress_bar.setRange(0, count)
        self.set_interaction_enabled(False)
        QApplication.processEvents()

        try:
            output_doc = fitz.open()
            for i in range(count):
                item = self.list_widget.item(i)
                file_type = item.data(Qt.UserRole + 1)
                file_path = item.data(Qt.UserRole + 2)
                
                if file_type == "pdf":
                    page_num = item.data(Qt.UserRole + 3)
                    src_doc = fitz.open(file_path)
                    output_doc.insert_pdf(src_doc, from_page=page_num, to_page=page_num)
                    src_doc.close()
                elif file_type == "png":
                    img_doc = fitz.open(file_path)
                    pdf_bytes = img_doc.convert_to_pdf()
                    temp_pdf = fitz.open("pdf", pdf_bytes)
                    output_doc.insert_pdf(temp_pdf)
                    img_doc.close()
                    temp_pdf.close()
                    
                self.progress_bar.setValue(i + 1)
                QApplication.processEvents()
                
            output_doc.save(output_path, garbage=3, deflate=True)
            output_doc.close()
            
            self.lbl_status.setText(f"Export successful! Saved: '{os.path.basename(output_path)}'")
            QMessageBox.information(self, "Export Completed", f"Successfully compiled {count} items!")
        except Exception as e:
            self.lbl_status.setText("Export failed.")
            QMessageBox.critical(self, "Export Failed", f"An error occurred:\\n{str(e)}")
        finally:
            self.progress_bar.setVisible(False)
            self.set_interaction_enabled(True)
            self.update_page_count()


def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    manager = LocalPDFManager()
    manager.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
`;
}
