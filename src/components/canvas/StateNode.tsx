import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ArrowRight } from 'lucide-react';

export const StateNode = memo(({ id, data, selected }: any) => {
  const isStart = data?.isStart;
  const isAccept = data?.isAccept;
  const isActive = data?.isActive || data?.isCurrentInSimulation || data?.isHighlightedInStep;

  return (
    <div className="relative group">
      {/* Handles */}
      <Handle type="target" position={Position.Top} id="top-in" className="!bg-cyan-500 !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Top} id="top-out" className="!bg-cyan-500 !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />

      <Handle type="target" position={Position.Right} id="right-in" className="!bg-cyan-500 !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Right} id="right-out" className="!bg-cyan-500 !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />

      <Handle type="target" position={Position.Bottom} id="bottom-in" className="!bg-cyan-500 !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Bottom} id="bottom-out" className="!bg-cyan-500 !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />

      <Handle type="target" position={Position.Left} id="left-in" className="!bg-cyan-500 !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />
      <Handle type="source" position={Position.Left} id="left-out" className="!bg-cyan-500 !w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Start State Indicator Arrow */}
      {isStart && (
        <div className="absolute -left-7 top-1/2 -translate-y-1/2 flex items-center text-cyan-400 pointer-events-none drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
          <span className="text-[9px] font-mono font-bold mr-0.5 text-cyan-300">START</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </div>
      )}

      {/* Main State Circle */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center font-mono font-bold text-xs select-none transition-all duration-300 ${
          isActive
            ? 'bg-cyan-500/25 border-2 border-cyan-400 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.8)] scale-110'
            : selected
            ? 'bg-slate-900 border-2 border-purple-400 text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.5)]'
            : 'bg-slate-950/95 border-2 border-slate-700 hover:border-cyan-500/60 text-slate-200 shadow-lg'
        }`}
      >
        {/* Double circle ring for accepting states */}
        {isAccept && (
          <div
            className={`absolute inset-1 rounded-full border pointer-events-none ${
              isActive ? 'border-cyan-300' : selected ? 'border-purple-400' : 'border-slate-500'
            }`}
          />
        )}

        <span className="z-10 truncate max-w-[44px] text-center px-1">
          {data?.label || id}
        </span>
      </div>
    </div>
  );
});
StateNode.displayName = 'StateNode';
