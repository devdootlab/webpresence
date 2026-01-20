import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, Hunter, FishData } from './types';
import { COMIC_BURST_POLYGON, DEFAULT_IMAGE_SRC, DEFAULT_VIDEO_SRC, INITIAL_HUNTERS, FISH_DATA, DEFAULT_FINALE_VIDEO_SRC } from './constants';

// --- INDEXED DB HELPER ---
const DB_NAME = 'VintageRifleDB';
const STORE_NAME = 'assets';

const dbHelper = {
  open: (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject('IndexedDB not supported');
        return;
      }
      const request = window.indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  save: async (key: string, data: Blob | string) => {
    const db = await dbHelper.open();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(data, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },
  load: async (key: string): Promise<Blob | string | undefined> => {
    const db = await dbHelper.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  checkSaveExists: async (): Promise<boolean> => {
    try {
      const db = await dbHelper.open();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.count('img'); // check for main image
        req.onsuccess = () => resolve(req.result > 0);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      return false;
    }
  }
};

// --- STYLES FOR ANIMATIONS ---
const AnimationStyles = () => (
  <style>{`
    @keyframes muzzle-flash {
      0% { transform: scale(0); opacity: 0; }
      10% { transform: scale(1.5); opacity: 1; }
      20% { transform: scale(0.8); opacity: 0.9; }
      40% { transform: scale(1.2); opacity: 0.8; }
      100% { transform: scale(0); opacity: 0; }
    }
    .animate-muzzle-flash {
      animation: muzzle-flash 0.2s ease-out forwards;
    }

    @keyframes spark-fly {
      0% { transform: translate(0, 0) scale(1); opacity: 1; }
      100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
    }
    .animate-spark {
      animation: spark-fly 0.6s ease-out forwards;
    }

    @keyframes smoke-puff {
      0% { transform: translate(0, 0) scale(0.2); opacity: 0.8; filter: blur(2px); }
      30% { opacity: 0.5; }
      100% { transform: translate(var(--sx), var(--sy)) scale(3); opacity: 0; filter: blur(15px); }
    }
    .animate-smoke {
      animation: smoke-puff 2s ease-out forwards;
    }

    @keyframes rod-extend {
      0% { width: 0px; opacity: 1; }
      100% { width: 120px; opacity: 1; } /* Target length matches banner width + offset */
    }
    .animate-rod {
      animation: rod-extend 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    @keyframes banner-unroll {
      0% { transform: scaleY(0); opacity: 0; }
      100% { transform: scaleY(1); opacity: 1; }
    }
    .animate-banner-scroll {
      animation: banner-unroll 0.4s ease-out 0.2s forwards; /* 0.2s delay to wait for rod */
      transform-origin: top center;
      opacity: 0; 
    }
    
    @keyframes ticker-scroll {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
    .animate-ticker {
      animation: ticker-scroll 120s linear infinite;
    }

    /* NEWS TRANSITION ANIMATIONS */
    @keyframes fade-to-black {
        0% { opacity: 0; }
        100% { opacity: 1; }
    }
    
    @keyframes ball-condense {
        0% { 
            transform: translate(-50%, -50%) scale(1); 
            border-radius: 0; 
            width: 200px; 
            height: 100px;
            color: #FAF8F0;
            background: transparent;
        }
        50% {
             color: transparent;
             background: #FAF8F0;
        }
        100% { 
            transform: translate(-50%, -50%) scale(0.2); 
            border-radius: 50%; 
            width: 100px; 
            height: 100px;
            background-color: #FAF8F0; /* WHITE BALL */
            box-shadow: 0 0 20px #FAF8F0;
            color: transparent;
        }
    }

    @keyframes ball-move-dynamic {
        0% { 
            top: var(--start-y); 
            left: var(--start-x); 
            transform: translate(-50%, -50%) scale(0.2); 
            border-radius: 50%;
            background-color: #FAF8F0;
            width: 100px;
            height: 100px;
        }
        100% { 
            top: 4rem; /* Match header vertical position in NewsPage */
            left: 20px; /* Match header horizontal start in NewsPage */
            transform: translate(0, -50%) scale(0.2); 
            border-radius: 50%;
            background-color: #FAF8F0;
            width: 100px;
            height: 100px;
        }
    }

    @keyframes ball-trace-loop {
        /* Tracing the outline of the word "News" approx 400px wide, 100px high */
        0%   { transform: translate(0, -50%) scale(0.2); } /* Top-Left start */
        25%  { transform: translate(400px, -50%) scale(0.2); } /* Top Edge to Right */
        35%  { transform: translate(400px, 50%) scale(0.2); } /* Right Down */
        50%  { transform: translate(200px, 50%) scale(0.2); } /* Bottom Edge to Left */
        75%  { transform: translate(0, 50%) scale(0.2); } /* Bottom Edge Home */
        100% { transform: translate(0, -50%) scale(0.2); } /* Left Up to start */
    }

    @keyframes header-reveal {
        0% { clip-path: inset(0 100% 0 0); }
        100% { clip-path: inset(0 0 0 0); }
    }
  `}</style>
);

// --- TYPES FOR PAGE NAVIGATION ---
type PageType = 'SETUP' | 'SCENE' | 'VIDEO' | 'LANDING' | 'NEWS' | 'ABOUT' | 'CONTACT';

interface AssetStore {
  img: string | null;
  vid: string | null;
  landing: string | null;
}

// --- HELPER COMPONENTS ---
const MediaRenderer = ({ src, className, style, draggable, autoPlay, loop, muted }: any) => {
  const isVideo = src?.endsWith('.mp4') || src?.includes('base64') || src?.startsWith('blob:');
  if (isVideo && (src.includes('.mp4') || src.includes('video'))) {
    return <video src={src} className={className} style={style} draggable={draggable} autoPlay={autoPlay} loop={loop} muted={muted} playsInline />;
  }
  return <img src={src} alt="Content" className={className} style={style} draggable={draggable} />;
};

// 1. SETUP SCENE
const SetupScene = ({ onComplete }: { onComplete: (assets: AssetStore) => void }) => {
  const [img, setImg] = useState<string>(DEFAULT_IMAGE_SRC);
  const [vid, setVid] = useState<string>(DEFAULT_VIDEO_SRC);
  const [landing, setLanding] = useState<string>(DEFAULT_FINALE_VIDEO_SRC);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [hasSavedData, setHasSavedData] = useState(false);

  useEffect(() => {
    dbHelper.checkSaveExists().then(setHasSavedData);
  }, []);

  const handleDrop = (e: React.DragEvent, type: 'image' | 'video' | 'landing') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'image') setImg(url);
      else if (type === 'video') setVid(url);
      else setLanding(url);
    }
  };

  const saveConfiguration = async () => {
    setSaveStatus('Saving...');
    try {
      // Helper to process asset
      const processAndSave = async (key: string, src: string) => {
        if (src.startsWith('blob:')) {
          const res = await fetch(src);
          const blob = await res.blob();
          await dbHelper.save(key, blob);
          await dbHelper.save(key + '_type', 'blob');
        } else {
          await dbHelper.save(key, src);
          await dbHelper.save(key + '_type', 'url');
        }
      };

      await processAndSave('img', img);
      await processAndSave('vid', vid);
      await processAndSave('landing', landing);

      setSaveStatus('Saved!');
      setHasSavedData(true);
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('Error saving');
    }
  };

  const loadConfiguration = async () => {
    setSaveStatus('Loading...');
    try {
      const loadItem = async (key: string) => {
        const type = await dbHelper.load(key + '_type');
        const data = await dbHelper.load(key);
        if (type === 'blob' && data instanceof Blob) {
          return URL.createObjectURL(data);
        }
        return data as string;
      };

      const lImg = await loadItem('img');
      const lVid = await loadItem('vid');
      const lLanding = await loadItem('landing');

      if (lImg) setImg(lImg);
      if (lVid) setVid(lVid);
      if (lLanding) setLanding(lLanding);

      setSaveStatus('Loaded!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) {
      console.error(e);
      setSaveStatus('Error loading');
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center p-8 space-y-8 font-vintage text-[#FAF8F0] overflow-y-auto bg-stone-900 z-[60]">
      <h1 className="text-4xl tracking-widest text-amber-500 drop-shadow-md text-center">VINTAGE RIFLE SCENE SETUP</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        <div
          className="border-2 border-dashed border-stone-600 rounded-lg p-4 bg-stone-800 flex flex-col items-center text-center transition hover:border-amber-500 relative group"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'image')}
        >
          <h2 className="text-xl mb-2 text-amber-400">1. Hunter Image</h2>
          <div className="w-full h-32 bg-black mb-2 overflow-hidden rounded flex items-center justify-center">
            {img ? <img src={img} alt="Preview" className="h-full w-full object-cover opacity-70" /> : <span className="text-stone-500">No Image</span>}
          </div>
          <p className="text-xs text-stone-400">Drag & drop hunter image.</p>
        </div>

        <div
          className="border-2 border-dashed border-stone-600 rounded-lg p-4 bg-stone-800 flex flex-col items-center text-center transition hover:border-amber-500"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'video')}
        >
          <h2 className="text-xl mb-2 text-amber-400">2. Transition Video</h2>
          <div className="w-full h-32 bg-black mb-2 overflow-hidden rounded flex items-center justify-center">
            {vid ? <video src={vid} className="h-full w-full object-cover opacity-70" /> : <span className="text-stone-500">No Video</span>}
          </div>
          <p className="text-xs text-stone-400">Drag & drop mp4.</p>
        </div>

        <div
          className="border-2 border-dashed border-stone-600 rounded-lg p-4 bg-stone-800 flex flex-col items-center text-center transition hover:border-amber-500"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'landing')}
        >
          <h2 className="text-xl mb-2 text-amber-400">3. Finale Art</h2>
          <div className="w-full h-32 bg-black mb-2 overflow-hidden rounded flex items-center justify-center">
            {landing?.endsWith('.mp4') ?
              <video src={landing} autoPlay loop muted className="h-full w-full object-cover opacity-70" /> :
              (landing ? <img src={landing} alt="Preview" className="h-full w-full object-cover opacity-70" /> : <span className="text-stone-500">No Media</span>)
            }
          </div>
          <p className="text-xs text-stone-400">Drag & drop Video or Image.</p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          onClick={() => onComplete({ img, vid, landing })}
          className="px-10 py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold text-xl rounded shadow-[4px_4px_0_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none transition-all uppercase"
        >
          Initialize App
        </button>

        <div className="flex gap-4">
          <button
            onClick={saveConfiguration}
            className="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 font-bold text-sm rounded border border-stone-500 uppercase tracking-wider transition-colors"
          >
            Save Setup
          </button>
          {hasSavedData && (
            <button
              onClick={loadConfiguration}
              className="px-6 py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 font-bold text-sm rounded border border-stone-500 uppercase tracking-wider transition-colors"
            >
              Load Saved
            </button>
          )}
        </div>
        {saveStatus && <span className="text-amber-400 font-mono text-sm animate-pulse">{saveStatus}</span>}
      </div>
    </div>
  );
};

// 2. MUZZLE FLASH
const MuzzleFlash = () => {
  const sparks = Array.from({ length: 35 }).map((_, i) => {
    const angle = (Math.random() - 0.5) * Math.PI * 1.5;
    const dist = 80 + Math.random() * 100;
    const tx = Math.cos(angle) * dist + 'px';
    const ty = Math.sin(angle) * dist + 'px';
    const color = Math.random() > 0.5 ? '#FEF3C7' : '#F97316';
    const size = 2 + Math.random() * 3;
    return { id: i, tx, ty, color, size };
  });

  return (
    <div className="absolute top-0 left-0 pointer-events-none z-50">
      {/* Core Flash - centered on 0,0 */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full mix-blend-screen blur-[4px] animate-muzzle-flash" />
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-yellow-300 rounded-full mix-blend-screen blur-[8px] animate-muzzle-flash" style={{ animationDelay: '0.01s' }} />
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-orange-500 rounded-full mix-blend-screen blur-[12px] animate-muzzle-flash" style={{ animationDelay: '0.03s' }} />

      {/* Smoke */}
      <div className="animate-smoke absolute top-0 left-0 w-20 h-20 bg-gray-200/50 rounded-full blur-[10px]" style={{ '--sx': '60px', '--sy': '-40px' } as React.CSSProperties} />

      {/* Sparks */}
      {sparks.map(spark => (
        <div
          key={spark.id}
          className="animate-spark absolute top-0 left-0 rounded-full shadow-[0_0_2px_white]"
          style={{
            width: spark.size,
            height: spark.size,
            backgroundColor: spark.color,
            '--tx': spark.tx,
            '--ty': spark.ty
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

// 3. COMIC BANNER
const ComicBanner = ({ hunter, onBannerClick }: { hunter: Hunter, onBannerClick: (e: React.MouseEvent) => void }) => {
  return (
    <div
      className={`animate-banner-scroll relative comic-banner-curl pointer-events-auto ${hunter.isLink ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={(e) => {
        if (hunter.isLink) {
          e.stopPropagation();
          onBannerClick(e);
        }
      }}
      style={{
        width: '100px',
        height: '70px',
        backgroundColor: hunter.bannerColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: '4px', // Hangs immediately below the 4px rod
        left: '10px', // Offset from muzzle along the rod
        transformOrigin: 'top center'
      }}
    >
      <div className="absolute inset-0 benday-dots pointer-events-none" />
      <div className="relative w-full h-full flex items-center justify-center p-0" style={{ transform: hunter.burstScale }}>
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center shadow-lg pointer-events-none z-10"
          style={{
            clipPath: COMIC_BURST_POLYGON,
            backgroundColor: hunter.burstColor,
            filter: `drop-shadow(${hunter.burstShadow})`
          }}
        />
        <h2
          className="absolute font-bangers text-xl tracking-wide z-50 text-center leading-none select-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-auto"
          style={{
            color: hunter.textColor,
            textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
          }}
        >
          {hunter.bannerHeadline}
        </h2>
      </div>
    </div>
  );
};

// 4. INFO PAGES (ABOUT / CONTACT)
const InfoPage = ({ title, content }: { title: string, content: string }) => (
  <div className="fixed inset-0 w-full h-full bg-stone-900/95 flex flex-col items-center justify-center p-12 text-center z-50">
    <div className="border-4 border-double border-amber-600/50 p-12 max-w-4xl bg-stone-800 shadow-2xl">
      <h1 className="font-bangers text-6xl text-amber-500 mb-6 drop-shadow-lg tracking-wider">{title}</h1>
      <p className="font-vintage text-xl text-[#FAF8F0] leading-relaxed">{content}</p>
      <div className="mt-8 text-stone-500 text-sm">© 1965 Vintage Interactive Inc.</div>
    </div>
  </div>
);

// 5. FISH CUTOUT COMPONENT
const FishCutout = ({ src, data }: { src: string, data: FishData }) => {
  // Use data.focus if provided, otherwise default to center of the bounding box
  const centerX = data.focus ? data.focus.x : (data.position.l + (data.position.w || 0) / 2);
  const centerY = data.focus ? data.focus.y : (data.position.t + (data.position.h || 0) / 2);

  const scale = Math.min(100 / (data.position.w || 20), 100 / (data.position.h || 20)) * 0.7;
  const isVideo = src.endsWith('.mp4');

  return (
    <div className="w-48 h-48 md:w-64 md:h-64 relative overflow-hidden rounded-full border-4 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] bg-black shrink-0">
      {isVideo ? (
        <video
          src={src}
          autoPlay loop muted playsInline
          className="absolute w-full h-full object-cover max-w-none origin-center transition-transform duration-700"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${centerX}% ${centerY}%`,
            transformOrigin: `${centerX}% ${centerY}%`,
            transform: `scale(${scale})`
          }}
        />
      ) : (
        <img
          src={src}
          alt="Fish Detail"
          className="absolute w-full h-full object-cover max-w-none origin-center transition-transform duration-700"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: `${centerX}% ${centerY}%`,
            transformOrigin: `${centerX}% ${centerY}%`,
            transform: `scale(${scale})`
          }}
        />
      )}
    </div>
  );
};

// 6. FISH DETAIL VIEW (Inline Dark Theme)
const FishDetailView = ({ data, imageSrc }: { data: FishData, imageSrc: string }) => {
  const renderBody = () => {
    let text = data.content.body;
    data.content.highlightTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      text = text.replace(regex, '<span class="text-amber-400 bg-stone-800 px-1 border-b border-amber-500/50">$1</span>');
    });
    return <p className="font-serif text-lg md:text-xl leading-relaxed text-stone-300" dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className="w-full bg-stone-900 border-t-8 border-amber-600/30 text-stone-200 animate-in fade-in slide-in-from-bottom-10 duration-500 pb-20 mt-12">

      {/* Header Content */}
      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Dynamic Cutout */}
        <FishCutout src={imageSrc} data={data} />

        <div className="flex flex-col text-center md:text-left">
          <div className="font-mono text-xs text-amber-500 tracking-widest mb-2 uppercase">Research Topic: {data.id}</div>
          <h1 className="text-3xl md:text-5xl font-coy text-white mb-6 leading-tight">{data.content.title}</h1>
          <div className="bg-stone-800/50 p-6 md:p-8 rounded-lg border border-stone-700 shadow-inner">
            {renderBody()}
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div className="w-full h-16 bg-stone-950 text-amber-500/80 flex items-center overflow-hidden whitespace-nowrap border-y border-stone-800 relative">
        <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-stone-950 to-transparent z-10" />
        <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-stone-950 to-transparent z-10" />

        <div className="animate-ticker inline-block pl-[100%]">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="mx-8 font-mono font-bold text-lg tracking-wider flex items-center gap-4 inline-flex">
              {data.content.tickerItems.map((item, idx) => (
                <span key={idx} className="opacity-70 hover:opacity-100 transition-opacity">{item} •</span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// 7. NEWS PAGE
const NewsPage = () => (
  <div className="w-full max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in duration-1000 relative">
    {/* Looping Ball Animation - Persistent */}
    <div
      className="absolute z-20 pointer-events-none"
      style={{
        top: '4rem', // Aligned with header top
        left: '20px', // Aligned with header left
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        backgroundColor: '#FAF8F0', // White Ball
        boxShadow: '0 0 20px #FAF8F0',
        transform: 'translate(0, -50%) scale(0.2)', // Matches end state of transition
        animation: 'ball-trace-loop 4s linear infinite'
      }}
    />

    <h1 className="font-coy text-6xl md:text-8xl text-stone-100 mb-12 drop-shadow-xl border-b-2 border-stone-700 pb-6 relative pl-[80px]">
      News
    </h1>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 text-stone-300 font-serif text-lg leading-relaxed">
      <div className="space-y-6">
        <h3 className="text-amber-500 font-mono text-sm uppercase tracking-widest border-l-2 border-amber-500 pl-3">Latest Update</h3>
        <p>
          Our lab has recently secured a major NIH grant to investigate the role of cryptic splicing in neurodegenerative diseases. This 5-year project will leverage our proprietary deep learning models to identify novel therapeutic targets.
        </p>
        <p>
          We are also thrilled to welcome three new post-doctoral fellows to the team, bringing expertise in computational biology, structural immunology, and single-cell transcriptomics.
        </p>
      </div>
      <div className="space-y-6">
        <h3 className="text-amber-500 font-mono text-sm uppercase tracking-widest border-l-2 border-amber-500 pl-3">Conference Highlights</h3>
        <p>
          The team presented four posters at the recent International Society for Computational Biology (ISCB) conference. Our work on "Predicting Splicing from Sequence Alone" received the Best Poster Award in the Genomics track.
        </p>
        <p>
          Upcoming talks include a keynote at the Cold Spring Harbor Retroviruses meeting and a workshop on "AI in Immunology" at the Keystone Symposium next spring.
        </p>
      </div>
    </div>

    <div className="border-t border-stone-700 pt-12">
      <h2 className="font-bangers text-4xl text-stone-500 mb-8 tracking-wide">Selected Publications</h2>
      <ul className="space-y-6 font-mono text-sm text-stone-400">
        <li className="flex gap-4 group hover:text-amber-400 transition-colors cursor-pointer">
          <span className="text-amber-600 font-bold">2024</span>
          <div>
            <strong className="block text-stone-200 group-hover:text-amber-300">DeepSplice: A Transformer-based model for splicing prediction.</strong>
            <em>Nature Machine Intelligence.</em> Smith J, Doe A, et al.
          </div>
        </li>
        <li className="flex gap-4 group hover:text-amber-400 transition-colors cursor-pointer">
          <span className="text-amber-600 font-bold">2023</span>
          <div>
            <strong className="block text-stone-200 group-hover:text-amber-300">Profiling the B-cell epitope landscape of SARS-CoV-2.</strong>
            <em>Cell Host & Microbe.</em> Johnson K, Smith J, et al.
          </div>
        </li>
        <li className="flex gap-4 group hover:text-amber-400 transition-colors cursor-pointer">
          <span className="text-amber-600 font-bold">2023</span>
          <div>
            <strong className="block text-stone-200 group-hover:text-amber-300">Mechanism of innate immune evasion by OC43.</strong>
            <em>PLoS Pathogens.</em> Williams R, et al.
          </div>
        </li>
      </ul>
    </div>
  </div>
);

// 8. NEWS TRANSITION OVERLAY
const NewsTransitionOverlay = ({ startPos, onComplete }: { startPos: { x: number, y: number }, onComplete: () => void }) => {
  const [phase, setPhase] = useState<'lock' | 'fade' | 'ball' | 'move'>('lock');

  useEffect(() => {
    // Slow Timeline for Debugging
    const tFade = setTimeout(() => setPhase('fade'), 100);
    const tBall = setTimeout(() => setPhase('ball'), 1100); // 1s Fade
    const tMove = setTimeout(() => setPhase('move'), 2100); // 1s Ball Condense

    // End of Move Phase (Transition Complete)
    // Hand off to NewsPage immediately
    const tEnd = setTimeout(() => {
      onComplete();
    }, 3600); // 1.5s Move

    return () => {
      clearTimeout(tFade); clearTimeout(tBall); clearTimeout(tMove); clearTimeout(tEnd);
    };
  }, [onComplete]);

  // Dynamic styles for start position
  const dynamicStyle = {
    '--start-x': `${startPos.x}px`,
    '--start-y': `${startPos.y}px`
  } as React.CSSProperties;

  return (
    <div
      className="fixed inset-0 z-[100] pointer-events-none"
      style={dynamicStyle}
    >
      {/* Background Fade Layer */}
      <div
        className="absolute inset-0 bg-black"
        style={{
          opacity: phase === 'lock' ? 0 : 1,
          transition: 'opacity 1s ease-in-out' // Slow fade
        }}
      />

      {/* The Animated Element */}
      <div
        className="absolute flex items-center justify-center font-bangers text-4xl text-[#FAF8F0]"
        style={{
          top: 'var(--start-y)',
          left: 'var(--start-x)',
          transform: 'translate(-50%, -50%)',
          // Animation Logic
          animation:
            phase === 'ball' ? 'ball-condense 1s forwards' :
              phase === 'move' ? 'ball-move-dynamic 1.5s forwards' : 'none',

          // Manual overrides for states to ensure continuity between animations
          ...(phase === 'move' ? {
            borderRadius: '50%',
            backgroundColor: '#FAF8F0',
            width: '100px',
            height: '100px',
            color: 'transparent',
            transform: 'translate(0, -50%) scale(0.2)', // Match end of move
            top: '4rem', // End pos
            left: '20px' // End pos
          } : {})
        }}
      >
        {/* Text only visible in lock/fade/early ball phases */}
        {(phase === 'lock' || phase === 'fade') && <span>NEWS!</span>}
      </div>

      {/* Reveal Mask for Header (Simulated) */}
      {phase === 'move' && (
        <div
          className="fixed top-[4rem] left-[80px] h-[100px] w-[300px] bg-black z-10"
          style={{ animation: 'header-reveal 1.5s forwards' }}
        />
      )}
    </div>
  );
};

// 9. FINALE SCENE (Interactive Mosaic + Detail)
const FinaleScene = ({
  assets
}: {
  assets: AssetStore
}) => {
  const [hoveredFish, setHoveredFish] = useState<string | null>(null);
  const [selectedFishId, setSelectedFishId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selectedFish = FISH_DATA.find(f => f.id === selectedFishId);

  // Auto-scroll when selected
  useEffect(() => {
    if (selectedFishId && detailRef.current) {
      setTimeout(() => {
        detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedFishId]);

  return (
    <div className="relative flex flex-col items-center w-full min-h-screen">
      {/* HEADER */}
      <div className="w-full p-6 z-30 flex justify-center mt-4 mb-2">
        <h1 className="font-coy text-stone-200 text-3xl md:text-5xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] -rotate-2 text-center leading-tight">
          Our fishing expeditions...
        </h1>
      </div>

      <div className="relative inline-block max-w-[95vw] shadow-2xl border-4 border-stone-800 bg-stone-900">
        {assets.landing?.endsWith('.mp4') ? (
          <video
            src={assets.landing}
            autoPlay loop muted playsInline
            className="block w-auto h-auto max-w-[95vw] max-h-[70vh] object-contain select-none"
            draggable={false}
          />
        ) : (
          <img
            src={assets.landing!}
            alt="Finale Art"
            className="block w-auto h-auto max-w-[95vw] max-h-[70vh] object-contain select-none"
            draggable={false}
          />
        )}

        {/* Fish Hitboxes */}
        {FISH_DATA.map(fish => (
          <div
            key={fish.id}
            className="absolute group cursor-pointer z-20"
            style={{
              top: `${fish.position.t}%`,
              left: `${fish.position.l}%`,
              width: `${fish.position.w}%`,
              height: `${fish.position.h}%`,
              clipPath: fish.clipPath,
              backgroundColor: (hoveredFish === fish.id || selectedFishId === fish.id) ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={() => setHoveredFish(fish.id)}
            onMouseLeave={() => setHoveredFish(null)}
            onClick={() => setSelectedFishId(fish.id)}
          />
        ))}

        {/* Render Tooltips - Responsive Text Size */}
        {hoveredFish && (
          <div
            className="absolute z-50 pointer-events-none transition-all duration-300 ease-out"
            style={{
              top: `${FISH_DATA.find(f => f.id === hoveredFish)!.position.t}%`,
              left: `${FISH_DATA.find(f => f.id === hoveredFish)!.position.l + (FISH_DATA.find(f => f.id === hoveredFish)!.position.w! / 2)}%`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            <div className="bg-stone-900/95 border border-amber-500/50 text-amber-50 px-4 py-3 rounded-xl text-lg md:text-xl font-vintage shadow-2xl backdrop-blur-md w-max max-w-[200px] md:max-w-[280px] text-center leading-snug">
              {FISH_DATA.find(f => f.id === hoveredFish)!.content.title}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-stone-900/95 border-r border-b border-amber-500/50 rotate-45" />
            </div>
          </div>
        )}
      </div>

      {/* DETAIL SECTION */}
      <div ref={detailRef} className="w-full">
        {selectedFish && (
          <FishDetailView data={selectedFish} imageSrc={assets.landing!} />
        )}
      </div>
    </div>
  );
};

// 10. MAIN HUNTER SCENE COMPONENT
const HunterScene = ({
  assets,
  onHunterClick
}: {
  assets: AssetStore,
  onHunterClick: (id: number, pos: { x: number, y: number }) => void
}) => {
  const [lockedHunterId, setLockedHunterId] = useState<number | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [hunters, setHunters] = useState<Hunter[]>(INITIAL_HUNTERS);

  const updateHunter = (id: number, field: keyof Coordinates | 'angle', value: number, isMuzzle: boolean = false) => {
    setHunters(prev => prev.map(h => {
      if (h.id !== id) return h;
      if (field === 'angle') return { ...h, angle: value };
      const target = isMuzzle ? { ...h.muzzle } : { ...h.hitbox };
      (target as any)[field] = value;
      if (isMuzzle) return { ...h, muzzle: target };
      return { ...h, hitbox: target };
    }));
  };

  return (
    <div className="relative inline-block max-w-[95vw] max-h-[90vh]">
      {/* MAIN IMAGE */}
      <img
        src={assets.img!}
        alt="Vintage Scene"
        className="block w-auto h-auto max-w-[95vw] max-h-[90vh] object-contain select-none sepia-[0.3] contrast-[1.2] brightness-[0.85] filter grayscale-[0.2]"
        draggable={false}
      />

      {/* OVERLAY LAYERS */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {hunters.map(hunter => {
          const isActive = lockedHunterId === hunter.id;
          return (
            <React.Fragment key={hunter.id}>
              {/* Hitbox Area */}
              <div
                className={`absolute cursor-pointer pointer-events-auto z-20 ${showDebug ? 'bg-red-500/30 border border-red-500' : 'bg-transparent'}`}
                style={{
                  top: `${hunter.hitbox.t}%`,
                  left: `${hunter.hitbox.l}%`,
                  width: `${hunter.hitbox.w}%`,
                  height: `${hunter.hitbox.h}%`,
                }}
                onClick={() => setLockedHunterId(isActive ? null : hunter.id)}
              />

              {/* Gun Assembly */}
              <div
                className="absolute z-40 pointer-events-none"
                style={{
                  top: `${hunter.muzzle.t}%`,
                  left: `${hunter.muzzle.l}%`,
                  width: 0,
                  height: 0,
                  overflow: 'visible'
                }}
              >
                {isActive && (
                  <div
                    className="absolute top-0 left-0 w-0 h-0"
                    style={{
                      transform: `rotate(${hunter.angle}deg)`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <MuzzleFlash />
                    <div
                      className="animate-rod absolute top-0 left-0 h-[4px] rounded-r-sm shadow-[0_2px_4px_rgba(0,0,0,0.8)] z-50 border border-gray-600 pointer-events-auto"
                      style={{
                        background: 'linear-gradient(180deg, #555 0%, #fff 50%, #555 100%)',
                        transform: 'translateY(-50%)',
                        transformOrigin: 'left center'
                      }}
                    />
                    <ComicBanner
                      hunter={hunter}
                      onBannerClick={(e) => {
                        // Correct Fix: Pass the geometric center of the element, not the click.
                        const rect = e.currentTarget.getBoundingClientRect();
                        const centerX = rect.left + rect.width / 2;
                        const centerY = rect.top + rect.height / 2;
                        onHunterClick(hunter.id, { x: centerX, y: centerY });
                      }}
                    />
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* CALIBRATION PANEL (Hidden by default) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(!showDebug)}
          className={`px-3 py-1 rounded text-xs font-bold uppercase transition shadow-lg ${showDebug ? 'bg-red-600 text-white' : 'bg-stone-700 hover:bg-stone-600 text-stone-300'}`}
        >
          {showDebug ? 'Debug ON' : 'Debug OFF'}
        </button>
      </div>

      {showDebug && lockedHunterId && (
        <div className="fixed top-4 right-4 w-64 bg-stone-900/95 border border-stone-700 rounded p-4 text-xs space-y-4 shadow-xl z-50 text-stone-200 backdrop-blur pointer-events-auto">
          <div className="space-y-2">
            <strong className="block text-green-400">Angle</strong>
            <input type="range" min="-180" max="180" step="1" value={hunters.find(h => h.id === lockedHunterId)?.angle} onChange={(e) => updateHunter(lockedHunterId, 'angle', parseFloat(e.target.value))} className="w-full accent-green-500" />
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('SCENE');
  const [assets, setAssets] = useState<AssetStore>({
    img: '/pickerel.jpg',
    vid: DEFAULT_VIDEO_SRC,
    landing: DEFAULT_FINALE_VIDEO_SRC
  });
  const [isNewsTransitioning, setIsNewsTransitioning] = useState(false);
  const [transitionStartPos, setTransitionStartPos] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // ROUTING LOGIC
  const handleHunterClick = (id: number, pos: { x: number, y: number }) => {
    if (id === 1) {
      // Hunter 1 (Research) -> Video
      setCurrentPage('VIDEO');
    } else if (id === 3) {
      // Hunter 3 (News) -> Animated Transition
      setTransitionStartPos(pos);
      setIsNewsTransitioning(true);
    }
    // Hunter 2 (People) -> No action yet
  };

  return (
    <div className="fixed inset-0 min-h-screen bg-stone-900 flex flex-col items-center overflow-y-auto custom-scrollbar font-sans">
      <AnimationStyles />

      {/* GLOBAL TRANSITION OVERLAYS */}
      {isNewsTransitioning && (
        <NewsTransitionOverlay
          startPos={transitionStartPos}
          onComplete={() => {
            // Transition is done, show the actual page which now has the looping ball
            // CRITICAL FIX: Unmount the overlay so Navigation returns and we don't have double balls
            setIsNewsTransitioning(false);
            setCurrentPage('NEWS');
          }}
        />
      )}

      {/* PAGE CONTENT CONTAINER */}
      <main className="relative flex flex-col items-center justify-center p-4 w-full min-h-full">
        {/* If transition is happening, we might want to hide the previous scene to simulate fade out, 
             OR just overlay on top. Overlay handles fade to black. */}
        {currentPage === 'SETUP' && <SetupScene onComplete={(loadedAssets) => {
          setAssets(loadedAssets);
          setCurrentPage('SCENE');
        }} />}

        {currentPage === 'SCENE' && <HunterScene assets={assets} onHunterClick={handleHunterClick} />}

        {currentPage === 'VIDEO' && (
          <div className="relative inline-block max-w-[95vw] max-h-[90vh]">
            <video
              src={assets.vid!}
              autoPlay
              onEnded={() => setCurrentPage('LANDING')}
              onClick={() => setCurrentPage('LANDING')}
              className="block w-auto h-auto max-w-[95vw] max-h-[90vh] object-contain cursor-pointer bg-black"
            />
          </div>
        )}

        {currentPage === 'LANDING' && <FinaleScene assets={assets} />}

        {currentPage === 'NEWS' && <NewsPage />}

        {currentPage === 'ABOUT' && <InfoPage title="ABOUT THE PROJECT" content="This interactive experience brings a 1920s duck hunting photograph to life using CSS animations and React state management." />}

        {currentPage === 'CONTACT' && <InfoPage title="CONTACT US" content="Have questions? Reach out to our digital preservation team." />}
      </main>

      {/* NAVIGATION MENU */}
      {currentPage !== 'SETUP' && !isNewsTransitioning && (
        <div className="fixed bottom-4 left-4 z-[100] flex flex-col space-y-2">
          <div className="bg-stone-950/90 border border-stone-700 p-2 rounded shadow-xl backdrop-blur-sm flex flex-col space-y-1">
            <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1 px-2">Navigation</div>
            {[
              { id: 'SCENE', label: 'Hunter Scene' },
              { id: 'LANDING', label: 'Finale Art' },
              { id: 'NEWS', label: 'News' },
              { id: 'ABOUT', label: 'About' },
              { id: 'CONTACT', label: 'Contact' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id as PageType);
                  // Reset transition state if navigating manually
                  setIsNewsTransitioning(false);
                }}
                className={`text-left px-3 py-1 rounded text-xs font-bold uppercase transition ${currentPage === item.id ? 'bg-amber-600 text-black' : 'text-stone-400 hover:text-white hover:bg-stone-700'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}