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
        <div className="absolute -left-9 top-1/2 -translate-y-1/2 flex items-center text-cyan-700 pointer-events-none">
          <span className="text-[10px] font-mono font-bold mr-0.5 text-cyan-800">START</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </div>
      )}

      {/* Main State Circle */}
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center font-mono font-bold text-xs select-none transition-all duration-300 ${
          isActive
            ? 'bg-cyan-100 border-[3px] border-cyan-700 text-slate-900 shadow-md scale-110'
            : selected
            ? 'bg-indigo-50 border-[3px] border-indigo-600 text-slate-900 shadow-md'
            : isAccept
            ? 'bg-emerald-50 border-[3px] border-emerald-600 hover:border-cyan-700 text-slate-900 shadow-sm'
            : 'bg-white border-[3px] border-slate-500 hover:border-cyan-700 text-slate-900 shadow-sm'
        }`}
      >
        {/* Double circle ring for accepting states */}
        {isAccept && (
          <div
            className={`absolute inset-1 rounded-full border pointer-events-none ${
              isActive ? 'border-cyan-700' : selected ? 'border-indigo-600' : 'border-emerald-700'
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
