import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

type Point = { x: number, y: number };
type Path = Point[];
type Arc = { cx: number, cy: number, r: number, sA: number, eA: number };
type SketchPart = { type: 'path', data: Path } | { type: 'arc', data: Arc };
type Sketch = { name: string, parts: SketchPart[] };

const SKETCHES: Sketch[] = [
    {
        name: 'Ghost',
        parts: [
            { type: 'arc', data: { cx: 200, cy: 170, r: 80, sA: Math.PI, eA: 0 } },
            { type: 'path', data: [{x: 120, y: 170}, {x: 125, y: 250}, {x: 140, y: 240}, {x: 155, y: 250}, {x: 170, y: 240}, {x: 185, y: 250}, {x: 200, y: 240}, {x: 215, y: 250}, {x: 230, y: 240}, {x: 245, y: 250}, {x: 260, y: 240}, {x: 275, y: 250}, {x: 280, y: 170}] },
            { type: 'arc', data: { cx: 170, cy: 160, r: 10, sA: 0, eA: 2 * Math.PI } },
            { type: 'arc', data: { cx: 230, cy: 160, r: 10, sA: 0, eA: 2 * Math.PI } },
            { type: 'arc', data: { cx: 200, cy: 200, r: 15, sA: 0, eA: 2 * Math.PI } },
        ]
    },
    {
        name: 'Robot',
        parts: [
            { type: 'path', data: [{x: 150, y: 100}, {x: 250, y: 100}, {x: 250, y: 200}, {x: 150, y: 200}, {x: 150, y: 100}] }, // Head
            { type: 'path', data: [{x: 175, y: 125}, {x: 190, y: 125}, {x: 190, y: 140}, {x: 175, y: 140}, {x: 175, y: 125}] }, // Left Eye
            { type: 'path', data: [{x: 210, y: 125}, {x: 225, y: 125}, {x: 225, y: 140}, {x: 210, y: 140}, {x: 210, y: 125}] }, // Right Eye
            { type: 'path', data: [{x: 180, y: 170}, {x: 220, y: 170}] }, // Mouth
            { type: 'path', data: [{x: 200, y: 100}, {x: 200, y: 70}, {x: 210, y: 60}] }, // Antenna
            { type: 'arc', data: { cx: 210, cy: 60, r: 5, sA: 0, eA: 2 * Math.PI } }, // Antenna tip
            { type: 'path', data: [{x: 120, y: 120}, {x: 150, y: 150}] }, // Left arm
            { type: 'path', data: [{x: 280, y: 120}, {x: 250, y: 150}] }, // Right arm
        ]
    }
];

export interface DrawingCanvasRef {
  getImageDataUrl: () => string;
  clear: () => void;
  generateRandomSketch: () => void;
}

interface DrawingCanvasProps {
    onDraw: () => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(({ onDraw }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const getContext = () => {
    return canvasRef.current?.getContext('2d');
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  useEffect(() => {
    clearCanvas();
  }, []);

  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e.nativeEvent) {
      clientX = e.nativeEvent.touches[0].clientX;
      clientY = e.nativeEvent.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = getContext();
    if (!ctx) return;
    
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';
    setIsDrawing(true);
    onDraw();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = getContext();
    if (!ctx) return;
    
    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    const ctx = getContext();
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  useImperativeHandle(ref, () => ({
    getImageDataUrl: () => {
      const canvas = canvasRef.current;
      return canvas ? canvas.toDataURL('image/png') : '';
    },
    clear: () => {
      clearCanvas();
    },
    generateRandomSketch: () => {
        const ctx = getContext();
        if (!ctx) return;

        const sketch = SKETCHES[Math.floor(Math.random() * SKETCHES.length)];
        clearCanvas();
        
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';
        
        let partIndex = 0;
        const drawNextPart = () => {
            if (partIndex >= sketch.parts.length) {
                onDraw(); // Notify parent that drawing is complete
                return;
            }

            const part = sketch.parts[partIndex];
            ctx.beginPath();
            if (part.type === 'path') {
                ctx.moveTo(part.data[0].x, part.data[0].y);
                for (let i = 1; i < part.data.length; i++) {
                    ctx.lineTo(part.data[i].x, part.data[i].y);
                }
            } else if (part.type === 'arc') {
                const { cx, cy, r, sA, eA } = part.data;
                ctx.arc(cx, cy, r, sA, eA);
            }
            ctx.stroke();
            
            partIndex++;
            setTimeout(drawNextPart, 100);
        };

        drawNextPart();
    }
  }));

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className="bg-white rounded-lg border-2 border-slate-600 touch-none w-full"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      style={{ touchAction: 'none' }}
    />
  );
});

export default DrawingCanvas;