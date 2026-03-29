"use client";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineItem {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  icon: React.ElementType;
  metricLabel: string;
  metricValue: string;
  marketingPoint: string;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState: Record<number, boolean> = {};
      
      if (prev[id]) {
        setActiveNodeId(null);
        setAutoRotate(true);
        return {};
      }

      newState[id] = true;
      setActiveNodeId(id);
      setAutoRotate(false);
      centerViewOnNode(id);
      
      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: any;

    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => (prev + 0.3) % 360);
      }, 50);
    }

    return () => clearInterval(rotationTimer);
  }, [autoRotate]);

  useEffect(() => {
    let loopTimer: any;
    let currentIndex = 0;

    const runLoop = () => {
      if (!autoRotate) return;

      const currentItem = timelineData[currentIndex];
      toggleItem(currentItem.id);

      loopTimer = setTimeout(() => {
        setExpandedItems({});
        setActiveNodeId(null);
        setAutoRotate(true);

        currentIndex = (currentIndex + 1) % timelineData.length;
        
        loopTimer = setTimeout(runLoop, 1500);
      }, 3500);
    };

    const initialTimer = setTimeout(runLoop, 2000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(loopTimer);
    };
  }, [timelineData]);

  const centerViewOnNode = (nodeId: number) => {
    if (!nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 280; // Increased radius for more breathing room
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.6,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  return (
    <div
      className="w-full h-full min-h-[800px] flex flex-col items-center justify-center bg-black overflow-hidden relative select-none"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-6xl h-full flex items-center justify-center">
        <div
          className="relative w-full h-[800px] flex items-center justify-center"
          ref={orbitRef}
          style={{ perspective: "1500px" }}
        >
          {/* Central Orb - Buy Wise Core */}
          <div className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37] via-[#b8972e] to-amber-500 animate-pulse flex items-center justify-center z-10 shadow-[0_0_60px_rgba(212,175,55,0.4)]">
            <div className="absolute w-28 h-28 rounded-full border-2 border-[#D4AF37]/40 animate-ping opacity-70"></div>
            <ShieldCheck size={36} className="text-black" />
          </div>

          {/* Orbital Ring Path */}
          <div className="absolute w-[560px] h-[560px] rounded-full border border-[#D4AF37]/10"></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 50 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => { if (el) nodeRefs.current[item.id] = el; }}
                className="absolute transition-all duration-700 cursor-pointer group"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Node Ring Halo */}
                <div
                  className="absolute rounded-full -inset-4 bg-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"
                ></div>

                {/* Node Body */}
                <div
                  className={`
                  w-16 h-16 rounded-full flex flex-col items-center justify-center
                  ${isExpanded ? "bg-[#D4AF37] text-black" : "bg-black text-[#D4AF37]"}
                  border-2 border-[#D4AF37]
                  transition-all duration-500 transform
                  ${isExpanded ? "scale-110 shadow-[0_0_30px_rgba(212,175,55,0.4)]" : "hover:scale-110 shadow-[0_0_15px_rgba(212,175,55,0.2)]"}
                `}
                >
                  <Icon size={28} />
                </div>

                {/* Node Text Label - Properly Spaced away from the icon */}
                <div
                  className={`
                  absolute top-24 left-1/2 -translate-x-1/2 whitespace-nowrap
                  text-sm font-bold tracking-widest uppercase
                  transition-all duration-300
                  ${isExpanded ? "text-[#D4AF37] scale-110" : "text-white/60 group-hover:text-white"}
                `}
                >
                  {item.title}
                </div>

                {/* Expanded Detail Card */}
                {isExpanded && (
                  <Card className="absolute top-32 left-1/2 -translate-x-1/2 w-[380px] bg-black/95 backdrop-blur-3xl border-[#D4AF37]/30 shadow-2xl shadow-[#D4AF37]/20 overflow-visible transition-all duration-500 animate-in fade-in zoom-in-95">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-px h-4 bg-[#D4AF37]"></div>
                    <CardHeader className="pb-3 text-center">
                      <Badge variant="outline" className="w-fit mx-auto border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/5 mb-2">
                        {item.subtitle}
                      </Badge>
                      <CardTitle className="text-xl text-white font-bold tracking-tight">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <p className="text-sm text-white/70 leading-relaxed text-center italic px-4">
                        "{item.content}"
                      </p>

                      {/* Professional Performance Metric - Single line layout */}
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]">{item.metricLabel}</span>
                          <span className="text-sm font-black text-white">{item.metricValue}</span>
                        </div>
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-600 w-full"></div>
                        </div>
                      </div>

                      {/* Marketing Benefit Section */}
                      <div className="flex items-center gap-4 p-4 bg-[#D4AF37]/5 rounded-lg border border-[#D4AF37]/20">
                        <CheckCircle2 className="text-[#D4AF37] shrink-0" size={20} />
                        <div>
                          <p className="text-xs text-white font-medium leading-relaxed">
                             {item.marketingPoint}
                          </p>
                        </div>
                      </div>

                      <div className="text-center pt-2">
                         <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-light">Unbiased Intelligence</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
