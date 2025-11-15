import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, SparklesIcon, PaintBrushIcon, TrashIcon, DiceIcon } from '../components/icons';
import DrawingCanvas, { DrawingCanvasRef } from '../components/DrawingCanvas';
import { dataURLtoFile } from '../services/geminiService';

interface InitScreenProps {
  onCharacterCreate: (file: File, name: string, vibe: string) => void;
  isLoading: boolean;
  onStartDemo: () => void;
}

const InitScreen: React.FC<InitScreenProps> = ({ onCharacterCreate, isLoading, onStartDemo }) => {
  const [mode, setMode] = useState<'upload' | 'draw'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [vibe, setVibe] = useState('');
  const [isCanvasDirty, setIsCanvasDirty] = useState(false);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'upload' && file) {
      onCharacterCreate(file, name, vibe);
    } else if (mode === 'draw' && isCanvasDirty && canvasRef.current) {
      const dataUrl = canvasRef.current.getImageDataUrl();
      const drawnFile = dataURLtoFile(dataUrl, 'character.png');
      onCharacterCreate(drawnFile, name, vibe);
    }
  };
  
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(droppedFile);
      }
    }
  }, []);

  const handleClearCanvas = () => {
    canvasRef.current?.clear();
    setIsCanvasDirty(false);
  };
  
  const handleGenerateSketch = () => {
    canvasRef.current?.generateRandomSketch();
  };

  const isSubmitDisabled = isLoading || (mode === 'upload' && !file) || (mode === 'draw' && !isCanvasDirty);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-900 animate-fade-in">
      <div className="w-full max-w-2xl text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-5xl md:text-6xl font-bold font-display bg-clip-text text-transparent bg-gradient-fuchsia-indigo text-glow-fuchsia">EmotionInk</h1>
        </div>
        <p className="text-slate-400 mb-8 font-serif">Bring your drawings to life. Upload or sketch a character to begin an emotional journey.</p>

        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto bg-slate-800/50 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-700 backdrop-blur-sm">
          
          <div className="flex mb-4 border-b border-slate-600">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex items-center justify-center gap-2 w-1/2 py-3 text-sm font-medium transition-colors font-display uppercase tracking-wider ${mode === 'upload' ? 'text-fuchsia-400 border-b-2 border-fuchsia-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <UploadIcon className="w-5 h-5"/> Upload
            </button>
            <button
              type="button"
              onClick={() => setMode('draw')}
              className={`flex items-center justify-center gap-2 w-1/2 py-3 text-sm font-medium transition-colors font-display uppercase tracking-wider ${mode === 'draw' ? 'text-fuchsia-400 border-b-2 border-fuchsia-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <PaintBrushIcon className="w-5 h-5"/> Sketch
            </button>
          </div>
          
          {mode === 'upload' && (
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer bg-slate-900/40 hover:bg-slate-700/50 transition-colors"
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              {preview ? (
                <img src={preview} alt="Character preview" className="h-full w-full object-contain rounded-lg p-2" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadIcon className="w-10 h-10 mb-3 text-slate-400" />
                  <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-fuchsia-400">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-500">PNG, JPG, or WEBP</p>
                </div>
              )}
              <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
            </label>
          )}

          {mode === 'draw' && (
            <div className="flex flex-col items-center gap-4">
               <DrawingCanvas ref={canvasRef} onDraw={() => setIsCanvasDirty(true)} />
               <div className="flex items-center justify-center gap-4">
                <button type="button" onClick={handleGenerateSketch} className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-fuchsia-400 transition-colors">
                    <DiceIcon className="w-4 h-4" /> I'm feeling lucky
                </button>
                <button type="button" onClick={handleClearCanvas} className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors">
                    <TrashIcon className="w-4 h-4" /> Clear Canvas
                </button>
               </div>
            </div>
          )}


          <div className="text-left mt-6 space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">Character Name <span className="text-slate-500">(optional)</span></label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500 block w-full p-2.5" placeholder="e.g., Pip, the Sky-Wisp" />
            </div>
             <div>
                <label htmlFor="vibe" className="block text-sm font-medium text-slate-300 mb-1">Character Vibe <span className="text-slate-500">(optional)</span></label>
                <input type="text" id="vibe" value={vibe} onChange={(e) => setVibe(e.target.value)} className="bg-slate-700 border border-slate-600 text-slate-100 text-sm rounded-lg focus:ring-fuchsia-500 focus:border-fuchsia-500 block w-full p-2.5" placeholder="e.g., shy but curious, brave and bold" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="w-full mt-8 text-white bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 focus:ring-4 focus:outline-none focus:ring-fuchsia-800 font-medium rounded-lg text-sm px-5 py-3 text-center disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Awakening...
              </>
            ) : (
                <>
                <SparklesIcon className="w-5 h-5" />
                Bring to Life
                </>
            )}
          </button>
        </form>
        <button
          onClick={onStartDemo}
          className="mt-6 text-sm text-slate-400 hover:text-fuchsia-400 transition-colors"
        >
          Or, try a quick demo
        </button>
      </div>
    </div>
  );
};

export default InitScreen;