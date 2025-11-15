
import React, { useState, useEffect } from 'react';

interface CinematicBackgroundProps {
  animationCue: string | null;
}

const Fireflies = () => {
    const fireflies = Array.from({ length: 20 }).map((_, i) => {
        const style = {
            '--tx1': `${Math.random() * 80 - 40}vw`,
            '--ty1': `${Math.random() * 80 - 40}vh`,
            '--tx2': `${Math.random() * 80 - 40}vw`,
            '--ty2': `${Math.random() * 80 - 40}vh`,
            '--tx3': `${Math.random() * 80 - 40}vw`,
            '--ty3': `${Math.random() * 80 - 40}vh`,
            '--d1': `${15 + Math.random() * 10}s`,
            '--d2': `${3 + Math.random() * 4}s`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
        } as React.CSSProperties;
        return <div key={i} className="absolute w-1 h-1 bg-yellow-200 rounded-full shadow-[0_0_8px_2px_rgba(253,249,150,0.7)] firefly" style={style} />;
    });
    return <>{fireflies}</>;
};

const Fog = () => {
    const layers = [
        { '--duration': '45s', '--opacity': 0.2 },
        { '--duration': '60s', '--opacity': 0.3, animationDelay: '-15s' },
        { '--duration': '75s', '--opacity': 0.25, animationDelay: '-30s' },
    ].map((style, i) => (
        <div key={i} className="absolute inset-0 bg-slate-500/30 fog-layer" style={style as React.CSSProperties} />
    ));
    return <>{layers}</>
}

const FallingLeaves = () => {
    const leaves = Array.from({ length: 15 }).map((_, i) => {
        const style = {
            '--d': `${5 + Math.random() * 10}s`,
            '--r-end': `${Math.random() * 720 - 360}deg`,
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 10}s`,
        } as React.CSSProperties;
        return <div key={i} className="absolute top-0 w-3 h-4 bg-green-400/50 rounded-[50%_0] leaf" style={style} />;
    });
    return <>{leaves}</>
}

const FlickeringShadows = () => {
    return <div className="absolute inset-0 bg-black shadow-overlay" />;
}

const particleComponents: { [key: string]: React.FC } = {
  fireflies: Fireflies,
  slow_fog: Fog,
  falling_leaves: FallingLeaves,
  flickering_shadows: FlickeringShadows,
};

const SCENES = ['dark_forest', 'glowing_cave', 'starry_night', 'ruined_temple'];

const CinematicBackground: React.FC<CinematicBackgroundProps> = ({ animationCue }) => {
  const [activeScene, setActiveScene] = useState(SCENES[0]);
  const [activeParticle, setActiveParticle] = useState<string | null>(null);
  
  useEffect(() => {
    if (animationCue) {
      const [newScene, newParticle] = animationCue.split(':');
      if (SCENES.includes(newScene)) {
        setActiveScene(newScene);
      }
      setActiveParticle(newParticle || null);
    }
  }, [animationCue]);

  const ParticleComponent = activeParticle && particleComponents[activeParticle] 
    ? particleComponents[activeParticle] 
    : null;

  return (
    <div className="scene-container">
      {SCENES.map(sceneName => (
        <div 
          key={sceneName} 
          className={`scene-layer scene-${sceneName.replace(/_/g, '-')}${activeScene === sceneName ? ' active' : ''}`} 
        />
      ))}
      <div className="absolute inset-0 pointer-events-none">
        {ParticleComponent && <ParticleComponent />}
      </div>
    </div>
  );
};

export default React.memo(CinematicBackground);
