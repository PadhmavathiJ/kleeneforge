import React, { Suspense, useState } from 'react';
import { Automaton, Transition } from '../../core/types';

const LazyImpl = React.lazy(() => import('./AutomataCanvasImpl'));

export const AutomataCanvas: React.FC<{ automaton: Automaton; onChange?: (a: Automaton) => void; activeStateIds?: string[]; highlightedTransitions?: Transition[]; readOnly?: boolean; title?: string }> = (props) => {
  return (
    <Suspense fallback={<div className="w-full h-[450px] min-h-[450px] rounded-2xl glass-panel border border-slate-800 flex items-center justify-center">Loading Canvas...</div>}>
      <LazyImpl {...props} />
    </Suspense>
  );
};
