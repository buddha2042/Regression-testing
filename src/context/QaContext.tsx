'use client';

import { createContext, useContext, useState } from 'react';

/* ================================
   Types
================================ */

export interface ComparisonItem {
  path: string;
  regularValue: any;
  refactorValue: any;
  isMatch: boolean;
}

export interface QaInputs {
  regUrl: string;
  regToken: string;
  regDashId: string;
  regWidgetId: string;

  refUrl: string;
  refToken: string;
  refDashId: string;
  refWidgetId: string;
}

export type QaPhase =
  | 'INIT'                 // Nothing started
  | 'WIDGET_QA_RUNNING'    // Fetching / comparing widget JSON
  | 'WIDGET_QA_DONE'       // Widget comparison completed
  | 'DATA_AUDIT_PENDING'   // Context review (Phase 2 – current)
  | 'DATA_COMPARE_RUNNING'// Future: data-level comparison
  | 'DATA_COMPARE_DONE';  // Future: certification ready

export interface QaState {
  /* Inputs & context */
  inputs: QaInputs | null;

  /* Raw widget JSON */
  regularData: any | null;
  refactorData: any | null;

  /* Phase 1 result */
  comparisonReport: ComparisonItem[];

  /* Phase control */
  phase: QaPhase;

  /* Metadata */
  createdAt: string | null;
}

/* ================================
   Context Shape
================================ */

interface QaContextType extends QaState {
  setQaState: (state: QaState) => void;
  updateQaState: (partial: Partial<QaState>) => void;
  resetQa: () => void;
}

/* ================================
   Default State
================================ */

const defaultState: QaState = {
  inputs: null,
  regularData: null,
  refactorData: null,
  comparisonReport: [],
  phase: 'INIT',
  createdAt: null
};

/* ================================
   Context Creation
================================ */

const QaContext = createContext<QaContextType | null>(null);

/* ================================
   Provider
================================ */

export const QaProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<QaState>(defaultState);

  return (
    <QaContext.Provider
      value={{
        ...state,

        /* Replace entire QA state (used after Phase 1) */
        setQaState: (newState: QaState) => {
          setState(newState);
        },

        /* Partial updates (safe for future phases) */
        updateQaState: (partial: Partial<QaState>) => {
          setState(prev => ({
            ...prev,
            ...partial
          }));
        },

        /* Full reset */
        resetQa: () => {
          setState(defaultState);
        }
      }}
    >
      {children}
    </QaContext.Provider>
  );
};

/* ================================
   Hook
================================ */

export const useQa = () => {
  const context = useContext(QaContext);
  if (!context) {
    throw new Error('useQa must be used within a QaProvider');
  }
  return context;
};
