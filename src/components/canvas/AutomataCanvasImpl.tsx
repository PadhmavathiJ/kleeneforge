import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Automaton, Transition } from '../../core/types';
import { isEpsilon } from '../../core/epsilonClosure';
import { StateNode } from './StateNode';
import {
  Plus,
  Trash2,
  LayoutGrid,
  Flag,
  CheckCircle,
  Pencil,
} from 'lucide-react';

const EMPTY_STATE_IDS: string[] = [];
const EMPTY_TRANSITIONS: Transition[] = [];
const nodeTypes = { stateNode: StateNode };

interface AutomataCanvasProps {
  automaton: Automaton;
  onChange?: (updated: Automaton) => void;
  activeStateIds?: string[];
  highlightedTransitions?: Transition[];
  readOnly?: boolean;
  title?: string;
}

const AutomataCanvasInner: React.FC<AutomataCanvasProps> = ({
  automaton,
  onChange,
  activeStateIds = EMPTY_STATE_IDS,
  highlightedTransitions = EMPTY_TRANSITIONS,
  readOnly = false,
  title,
}) => {
  // Compute initial layout positions (circular layout)
  const initialNodes: Node[] = useMemo(() => {
    const total = automaton.states.length;
    const radius = Math.max(130, total * 35);
    const centerX = 260;
    const centerY = 190;

    return automaton.states.map((st, i) => {
      const angle = (2 * Math.PI * i) / (total || 1) - Math.PI / 2;
      const x = total === 1 ? centerX : centerX + radius * Math.cos(angle);
      const y = total === 1 ? centerY : centerY + radius * Math.sin(angle);

      const isStart = automaton.startState === st;
      const isAccept = automaton.acceptStates.includes(st);
      const isActive = activeStateIds.includes(st);

      return {
        id: st,
        type: 'stateNode',
        position: { x, y },
        data: {
          label: st,
          isStart,
          isAccept,
          isActive,
        },
      };
    });
  }, [automaton.states, automaton.startState, automaton.acceptStates, activeStateIds]);

  const initialEdges: Edge[] = useMemo(() => {
    const grouped = new Map<string, { from: string; to: string; symbols: string[] }>();

    for (const t of automaton.transitions) {
      const key = `${t.from}->${t.to}`;
      if (!grouped.has(key)) {
        grouped.set(key, { from: t.from, to: t.to, symbols: [] });
      }
      if (!grouped.get(key)!.symbols.includes(t.symbol)) {
        grouped.get(key)!.symbols.push(t.symbol);
      }
    }

    return Array.from(grouped.entries()).map(([key, item]) => {
      const isSelfLoop = item.from === item.to;
      const isHighlighted = highlightedTransitions.some(
        ht => ht.from === item.from && ht.to === item.to
      );

      return {
        id: `e_${key}`,
        source: item.from,
        target: item.to,
        label: item.symbols.join(', '),
        type: isSelfLoop ? 'smoothstep' : 'default',
        animated: isHighlighted,
        style: {
          stroke: isHighlighted ? '#d97706' : '#334155',
          strokeWidth: isHighlighted ? 4 : 2.5,
        },
        labelStyle: {
          fill: isHighlighted ? '#b45309' : '#0f172a',
          fontWeight: 700,
          fontFamily: 'monospace',
          fontSize: 12,
        },
        labelBgStyle: {
          fill: '#ffffff',
          fillOpacity: 0.96,
          rx: 4,
          ry: 4,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? '#d97706' : '#334155',
          width: 14,
          height: 14,
        },
      } as Edge;
    });
  }, [automaton.transitions, highlightedTransitions]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const [showAddTrans, setShowAddTrans] = useState(false);
  const [transFrom, setTransFrom] = useState('');
  const [transTo, setTransTo] = useState('');
  const [transSymbol, setTransSymbol] = useState('0');

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly || !onChange || !params.source || !params.target) return;
      const sym = prompt('Enter transition symbol (e.g. 0, 1, a, or ε):', '0') || '0';
      const newTrans: Transition = { from: params.source, to: params.target, symbol: sym };

      const updatedTransitions = [...automaton.transitions, newTrans];
      const updatedAlphabet = Array.from(new Set([...automaton.alphabet, sym].filter(symbol => !isEpsilon(symbol))));

      onChange({
        ...automaton,
        alphabet: updatedAlphabet,
        transitions: updatedTransitions,
      });
    },
    [automaton, onChange, readOnly]
  );

  const handleAddState = () => {
    if (readOnly || !onChange) return;
    let nextIndex = automaton.states.length;
    let newId = `q${nextIndex}`;
    while (automaton.states.includes(newId)) {
      nextIndex++;
      newId = `q${nextIndex}`;
    }

    const updatedStates = [...automaton.states, newId];
    const isFirst = automaton.states.length === 0;

    onChange({
      ...automaton,
      states: updatedStates,
      startState: isFirst ? newId : automaton.startState,
    });
  };

  const handleToggleStart = () => {
    if (readOnly || !onChange || !selectedNodeId) return;
    onChange({
      ...automaton,
      startState: selectedNodeId,
    });
  };

  const handleToggleAccept = () => {
    if (readOnly || !onChange || !selectedNodeId) return;
    const isCurrentlyAccept = automaton.acceptStates.includes(selectedNodeId);
    const updatedAccepts = isCurrentlyAccept
      ? automaton.acceptStates.filter(s => s !== selectedNodeId)
      : [...automaton.acceptStates, selectedNodeId];

    onChange({
      ...automaton,
      acceptStates: updatedAccepts,
    });
  };

  const handleRenameSelected = () => {
    if (readOnly || !onChange || !selectedNodeId) return;
    const renamed = prompt('New state name:', selectedNodeId)?.trim();
    if (!renamed || renamed === selectedNodeId || automaton.states.includes(renamed)) return;
    onChange({
      ...automaton,
      states: automaton.states.map(state => state === selectedNodeId ? renamed : state),
      startState: automaton.startState === selectedNodeId ? renamed : automaton.startState,
      acceptStates: automaton.acceptStates.map(state => state === selectedNodeId ? renamed : state),
      transitions: automaton.transitions.map(transition => ({ ...transition, from: transition.from === selectedNodeId ? renamed : transition.from, to: transition.to === selectedNodeId ? renamed : transition.to })),
    });
    setSelectedNodeId(renamed);
  };

  const handleDeleteSelected = () => {
    if (readOnly || !onChange || !selectedNodeId) return;
    const updatedStates = automaton.states.filter(s => s !== selectedNodeId);
    const updatedTransitions = automaton.transitions.filter(
      t => t.from !== selectedNodeId && t.to !== selectedNodeId
    );
    const updatedAccepts = automaton.acceptStates.filter(s => s !== selectedNodeId);
    const updatedStart = automaton.startState === selectedNodeId ? (updatedStates[0] || '') : automaton.startState;

    onChange({
      ...automaton,
      states: updatedStates,
      startState: updatedStart,
      acceptStates: updatedAccepts,
      transitions: updatedTransitions,
    });
    setSelectedNodeId(null);
  };

  const handleAddTransitionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly || !onChange || !transFrom || !transTo) return;

    const newTrans: Transition = { from: transFrom, to: transTo, symbol: transSymbol };
    const updatedTransitions = [...automaton.transitions, newTrans];
    const updatedAlphabet = Array.from(new Set([...automaton.alphabet, transSymbol].filter(symbol => !isEpsilon(symbol))));

    onChange({
      ...automaton,
      alphabet: updatedAlphabet,
      transitions: updatedTransitions,
    });
    setShowAddTrans(false);
  };

  const handleAutoLayout = () => {
    const total = automaton.states.length;
    const radius = Math.max(130, total * 40);
    const centerX = 260;
    const centerY = 190;

    setNodes(prev =>
      prev.map((n, i) => {
        const angle = (2 * Math.PI * i) / (total || 1) - Math.PI / 2;
        return {
          ...n,
          position: {
            x: total === 1 ? centerX : centerX + radius * Math.cos(angle),
            y: total === 1 ? centerY : centerY + radius * Math.sin(angle),
          },
        };
      })
    );
  };

  const handleEditSelectedEdge = () => {
    if (readOnly || !onChange || !selectedEdgeId) return;
    const edge = edges.find(item => item.id === selectedEdgeId);
    if (!edge) return;
    const existing = automaton.transitions.filter(t => t.from === edge.source && t.to === edge.target);
    const entered = prompt('Transition symbols, comma-separated (use epsilon for epsilon):', existing.map(t => t.symbol).join(', '));
    if (entered === null) return;
    const symbols = Array.from(new Set(entered.split(',').map(symbol => symbol.trim()).filter(Boolean)));
    const transitions = automaton.transitions.filter(t => t.from !== edge.source || t.to !== edge.target);
    transitions.push(...symbols.map(symbol => ({ from: edge.source, to: edge.target, symbol })));
    onChange({ ...automaton, transitions, alphabet: Array.from(new Set(transitions.map(t => t.symbol).filter(symbol => !isEpsilon(symbol)))) });
    setSelectedEdgeId(null);
  };

  const handleDeleteSelectedEdge = () => {
    if (readOnly || !onChange || !selectedEdgeId) return;
    const edge = edges.find(item => item.id === selectedEdgeId);
    if (!edge) return;
    onChange({ ...automaton, transitions: automaton.transitions.filter(t => t.from !== edge.source || t.to !== edge.target) });
    setSelectedEdgeId(null);
  };

  return (
    <div className="relative w-full h-[450px] min-h-[450px] rounded-2xl glass-panel border border-cyan-950/60 overflow-hidden shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-cyan-400">{title || `${automaton.type} Visual Canvas`}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">{automaton.states.length} states • {automaton.transitions.length} transitions</span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1.5">
            <button onClick={handleAddState} className="flex items-center gap-1 px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono transition-all">
              <Plus className="w-3.5 h-3.5" />
              <span>State</span>
            </button>

            <button onClick={() => { setTransFrom(automaton.states[0] || ''); setTransTo(automaton.states[0] || ''); setShowAddTrans(true); }} disabled={automaton.states.length === 0} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-mono transition-all disabled:opacity-40">
              <Plus className="w-3.5 h-3.5" />
              <span>Transition</span>
            </button>

            {selectedNodeId && (
              <>
                <button onClick={handleToggleStart} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono" title="Make Start State"><Flag className="w-3.5 h-3.5 text-cyan-400" /></button>
                <button onClick={handleToggleAccept} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono" title="Toggle Accept State"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /></button>
                <button onClick={handleRenameSelected} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono" title="Rename State"><Pencil className="w-3.5 h-3.5 text-amber-300" /></button>
                <button onClick={handleDeleteSelected} className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-mono" title="Delete State"><Trash2 className="w-3.5 h-3.5" /></button>
              </>
            )}

            {selectedEdgeId && (
              <>
                <button onClick={handleEditSelectedEdge} className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono" title="Edit Transition"><Pencil className="w-3.5 h-3.5 text-amber-300" /></button>
                <button onClick={handleDeleteSelectedEdge} className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-mono" title="Delete Transition"><Trash2 className="w-3.5 h-3.5" /></button>
              </>
            )}

            <button onClick={handleAutoLayout} className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg" title="Auto Align Circle"><LayoutGrid className="w-3.5 h-3.5" /></button>
          </div>
        )}
      </div>

      <div className="w-full flex-1 min-h-[390px] h-[390px] bg-slate-50 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => { setSelectedNodeId(node.id); setSelectedEdgeId(null); }}
          onEdgeClick={(_, edge) => { setSelectedEdgeId(edge.id); setSelectedNodeId(null); }}
          onPaneClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); }}
          fitView
          className="bg-dot-pattern w-full h-full"
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="!bg-slate-900 !border-slate-800 !text-slate-300" />
          <MiniMap nodeColor="#38bdf8" maskColor="rgba(6, 8, 13, 0.7)" className="!bg-slate-950/80 !border-slate-800 !rounded-xl overflow-hidden" />
        </ReactFlow>
      </div>

      {showAddTrans && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <form onSubmit={handleAddTransitionSubmit} className="w-full max-w-xs glass-panel p-5 rounded-2xl border border-cyan-500/40 space-y-4 shadow-2xl">
            <h4 className="text-sm font-mono font-bold text-cyan-300">Add Transition</h4>
            <div className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">From State:</label>
                <select value={transFrom} onChange={e => setTransFrom(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200">
                  {automaton.states.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">To State:</label>
                <select value={transTo} onChange={e => setTransTo(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200">
                  {automaton.states.map(s => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Symbol (0, 1, a, b, ε):</label>
                <input type="text" value={transSymbol} onChange={e => setTransSymbol(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 font-bold" placeholder="0" required />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddTrans(false)} className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 font-mono">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs rounded-lg shadow">Add Transition</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default function AutomataCanvasImpl(props: AutomataCanvasProps) {
  return (
    <ReactFlowProvider>
      <AutomataCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
