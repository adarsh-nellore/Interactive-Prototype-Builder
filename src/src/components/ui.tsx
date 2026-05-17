import React, { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  HelpCircle,
  ChevronRight } from
'lucide-react';
import { ConfidenceLevel, SeverityLevel } from '../types';
export const Badge = ({
  children,
  variant = 'default',
  className = ''




}: {children: React.ReactNode;variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';className?: string;}) => {
  const variants = {
    default: 'bg-zinc-100 text-zinc-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    outline: 'border border-zinc-200 text-zinc-600'
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      
      {children}
    </span>);

};
export const ConfidenceBadge = ({ level }: {level: ConfidenceLevel;}) => {
  const config = {
    high: {
      color: 'success',
      label: 'Supported',
      icon: CheckCircle2
    },
    medium: {
      color: 'default',
      label: 'Partial',
      icon: Info
    },
    low: {
      color: 'warning',
      label: 'Weak',
      icon: AlertTriangle
    },
    unverified: {
      color: 'warning',
      label: 'Outside Scope',
      icon: HelpCircle
    },
    conflicted: {
      color: 'danger',
      label: 'Contradicted',
      icon: AlertTriangle
    }
  } as const;
  const { color, label, icon: Icon } = config[level];
  return (
    <Badge variant={color as any} className="gap-1">
      <Icon className="w-3 h-3" />
      {label}
    </Badge>);

};
export const SeverityBadge = ({ level }: {level: SeverityLevel;}) => {
  const config = {
    critical: {
      color: 'danger',
      label: 'Critical'
    },
    notable: {
      color: 'warning',
      label: 'Notable'
    },
    minor: {
      color: 'default',
      label: 'Minor'
    }
  } as const;
  return (
    <Badge variant={config[level].color as any}>{config[level].label}</Badge>);

};
export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  }>(
  ({ className = '', variant = 'primary', ...props }, ref) => {
    const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none';
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
      secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200',
      outline:
      'border border-zinc-300 bg-transparent hover:bg-zinc-50 text-zinc-900',
      ghost: 'hover:bg-zinc-100 text-zinc-700'
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} h-9 px-4 py-2 ${className}`}
        {...props} />);


  });
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer






}: {isOpen: boolean;onClose: () => void;title: string;children: React.ReactNode;footer?: React.ReactNode;}) => {
  return (
    <AnimatePresence>
      {isOpen &&
      <>
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed inset-0 z-50 bg-zinc-900/50 backdrop-blur-sm"
          onClick={onClose} />
        
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20
            }}
            className="pointer-events-auto grid w-full max-w-4xl gap-4 border bg-white p-6 shadow-xl rounded-xl"
            role="dialog"
            aria-modal="true">
            
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
                <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-zinc-100 transition-colors">
                
                  <X className="w-5 h-5 text-zinc-500" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-y-auto pr-2">
                {children}
              </div>
              {footer &&
            <div className="flex justify-end gap-2 pt-4 border-t mt-2">
                  {footer}
                </div>
            }
            </motion.div>
          </div>
        </>
      }
    </AnimatePresence>);

};
export const StatusPill = ({
  label,
  tone = 'amber'



}: {label: string;tone?: 'amber' | 'blue' | 'red' | 'emerald' | 'zinc';}) => {
  const tones = {
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    red: 'bg-red-50 text-red-800 border-red-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    zinc: 'bg-zinc-100 text-zinc-700 border-zinc-200'
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${tones[tone]}`}>
      
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {label}
    </span>);

};
export const Sheet = ({
  isOpen,
  onClose,
  title,
  status,
  headerActions,
  filters,
  children,
  footer









}: {isOpen: boolean;onClose: () => void;title: string;status?: React.ReactNode;headerActions?: React.ReactNode;filters?: React.ReactNode;children: React.ReactNode;footer?: React.ReactNode;}) => {
  return (
    <AnimatePresence>
      {isOpen &&
      <>
          {/* Subtle backdrop — only over the document area, leaves sidebar visible */}
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          className="fixed top-14 bottom-0 left-0 right-96 z-30 bg-zinc-900/20 backdrop-blur-[2px]"
          onClick={onClose} />
        
          <motion.aside
          initial={{
            x: '100%'
          }}
          animate={{
            x: 0
          }}
          exit={{
            x: '100%'
          }}
          transition={{
            type: 'spring',
            damping: 32,
            stiffness: 320
          }}
          className="fixed top-14 bottom-0 right-96 z-40 w-full max-w-[920px] bg-white border-l border-zinc-200 shadow-2xl flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label={title}>
          
            {/* Header */}
            <header className="border-b border-zinc-200 bg-white px-6 py-4 flex items-start justify-between gap-4 shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">{status}</div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-zinc-900 truncate">
                    {title}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {headerActions}
                <button
                onClick={onClose}
                aria-label="Close panel"
                className="rounded-md p-1.5 hover:bg-zinc-100 transition-colors text-zinc-500">
                
                  <X className="w-4 h-4" />
                </button>
              </div>
            </header>

            {/* Filters strip */}
            {filters &&
          <div className="border-b border-zinc-100 bg-zinc-50/60 px-6 py-2.5 shrink-0">
                {filters}
              </div>
          }

            {/* Body */}
            <div className="flex-1 overflow-y-auto">{children}</div>

            {/* Footer */}
            {footer &&
          <div className="border-t border-zinc-200 bg-zinc-50/80 px-6 py-3 shrink-0">
                {footer}
              </div>
          }
          </motion.aside>
        </>
      }
    </AnimatePresence>);

};
export const FilterChip = ({
  active,
  onClick,
  children,
  count





}: {active?: boolean;onClick?: () => void;children: React.ReactNode;count?: number;}) =>
<button
  onClick={onClick}
  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-colors border ${active ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}>
  
    {children}
    {count !== undefined &&
  <span
    className={`text-[10px] tabular-nums ${active ? 'text-white/70' : 'text-zinc-400'}`}>
    
        {count}
      </span>
  }
  </button>;