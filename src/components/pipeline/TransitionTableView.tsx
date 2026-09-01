import React, { useState } from 'react';
import { Automaton } from '../../core/types';
import { isEpsilon } from '../../core/epsilonClosure';
import { Copy, Check, Download, Table as TableIcon } from 'lucide-react';

interface TransitionTableViewProps {
  automaton: Automaton;
  activeStateId?: string;
  activeSymbol?: string;
}

export const TransitionTableView: React.FC<TransitionTableViewProps> = ({
  automaton,
  activeStateId,
  activeSymbol,
}) => {
  const [copied, setCopied] = useState(false);

  // Unified columns: alphabet symbols + epsilon if present
  const hasEps = automaton.transitions.some(t => isEpsilon(t.symbol));
  const columns = [...automaton.alphabet.filter(s => !isEpsilon(s))];
  if (hasEps && !columns.includes('e')) {
    columns.push('e');
  }

  // Get cell content for (state, symbol)
  const getCellTransitions = (state: string, sym: string): string[] => {
    const matching = automaton.transitions.filter(
      t => t.from === state && (sym === 'e' ? isEpsilon(t.symbol) : t.symbol === sym)
    );
    return matching.map(t => t.to);
  };

  const handleCopyMarkdown = () => {
    const header = `| State | ${columns.join(' | ')} |`;
    const divider = `|---|${columns.map(() => '---').join('|')}|`;
    const rows = automaton.states.map(s => {
      const isStart = automaton.startState === s;
      const isAccept = automaton.acceptStates.includes(s);
      const prefix = `${isStart ? '-> ' : ''}${isAccept ? '* ' : ''}`;
      const stateLabel = `${prefix}${s}`;
      const cellValues = columns.map(sym => {
        const reached = getCellTransitions(s, sym);
        if (reached.length === 0) return '�';
        if (automaton.type === 'DFA') return reached[0];
        return `{${reached.join(', ')}}`;
      });
      return `| ${stateLabel} | ${cellValues.join(' | ')} |`;
    });

    const markdown = [header, divider, ...rows].join('\n');
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const header = `State,${columns.join(',')}`;
    const rows = automaton.states.map(s => {
      const isStart = automaton.startState === s;
      const isAccept = automaton.acceptStates.includes(s);
      const prefix = `${isStart ? '->' : ''}${isAccept ? '*' : ''}`;
      const stateLabel = `"${prefix}${s}"`;
      const cellValues = columns.map(sym => {
        const reached = getCellTransitions(s, sym);
        if (reached.length === 0) return '"{}"';
        if (automaton.type === 'DFA') return `"${reached[0]}"`;
        return `"{${reached.join(', ')}}"`;
      });
      return `${stateLabel},${cellValues.join(',')}`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${automaton.type}_transition_table.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full glass-panel border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-b border-slate-300">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-mono font-bold text-slate-900">
            {automaton.type} Transition Table (d)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-mono transition-all"
            title="Copy as Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-mono transition-all"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-xs font-mono text-left">
          <thead className="bg-slate-200 text-slate-800 border-b border-slate-300">
            <tr>
              <th className="px-4 py-2 font-bold text-cyan-300">State / d</th>
              {columns.map(sym => (
                <th
                  key={sym}
                  className={`px-4 py-2 font-bold text-center ${
                    activeSymbol === sym ? 'bg-cyan-100 text-cyan-900' : 'text-slate-800'
                  }`}
                >
                  {sym === 'e' ? 'e (Epsilon)' : sym}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {automaton.states.map(state => {
              const isStart = automaton.startState === state;
              const isAccept = automaton.acceptStates.includes(state);
              const isCurrentRow = activeStateId === state;

              return (
                <tr
                  key={state}
                  className={`transition-colors ${
                    isCurrentRow ? 'bg-cyan-100' : 'odd:bg-white even:bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <td className="px-4 py-2 font-bold flex items-center gap-1 text-slate-200">
                    {isStart && <span className="text-cyan-400 font-bold" title="Start State">&rarr;</span>}
                    {isAccept && <span className="text-emerald-400 font-bold" title="Accept State">*</span>}
                    <span>{state}</span>
                  </td>

                  {columns.map(sym => {
                    const reached = getCellTransitions(state, sym);
                    const isTargetCell = isCurrentRow && activeSymbol === sym;

                    return (
                      <td
                        key={sym}
                        className={`px-4 py-2 text-center transition-all ${
                          isTargetCell
                          ? 'bg-cyan-200 text-cyan-950 font-bold'
                            : reached.length === 0
                            ? 'text-slate-600'
                            : 'text-slate-300'
                        }`}
                      >
                        {reached.length === 0 ? (
                          '�'
                        ) : automaton.type === 'DFA' ? (
                          reached[0]
                        ) : (
                          `{${reached.join(', ')}}`
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend Footer */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-300 flex items-center justify-between text-[11px] font-mono text-slate-600">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="text-cyan-400 font-bold">&rarr;</span> Start State
          </span>
          <span className="flex items-center gap-1">
            <span className="text-emerald-400 font-bold">*</span> Accepting State
          </span>
        </div>
        <div>
          {automaton.states.length} States | {columns.length} Input Symbols
        </div>
      </div>
    </div>
  );
};
