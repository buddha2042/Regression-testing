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
  | 'INIT'
  | 'WIDGET_QA_RUNNING'
  | 'WIDGET_QA_DONE'
  | 'DATA_AUDIT_PENDING'
  | 'DATA_COMPARE_RUNNING'
  | 'DATA_COMPARE_DONE';

export interface QaState {
  /* ============================
     Connection & Auth
  ============================ */
  inputs: QaInputs | null;
  jwtToken: string | null;

  /* ============================
     Widget Logic (Phase 1)
  ============================ */
  regularData: any | null;
  refactorData: any | null;
  comparisonReport: ComparisonItem[];

  /* ============================
     Phase Control
  ============================ */
  phase: QaPhase;

  /* ============================
     Metadata
  ============================ */
  createdAt: string | null;

  /* ============================
     Future: Data Compare
  ============================ */
  dataCompareResult?: {
    regularRowCount: number;
    refactorRowCount: number;
    mismatches?: number;
  };
}

/* ================================
   Context Shape
================================ */

interface QaContextType extends QaState {
  /** Full replace – use sparingly */
  setQaState: React.Dispatch<React.SetStateAction<QaState>>;

  /** Partial merge – preferred */
  updateQaState: (partial: Partial<QaState>) => void;

  /** Reset everything */
  resetQa: () => void;
}

/* ================================
   Default State
================================ */

const defaultState: QaState = {
  inputs: null,
  jwtToken: null,

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

        /* Full replace (advanced use only) */
        setQaState: setState,

        /* Safe partial update (default) */
        updateQaState: (partial: Partial<QaState>) => {
          setState(prev => ({
            ...prev,
            ...partial
          }));
        },

        /* Reset QA flow */
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
