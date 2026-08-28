import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  X,
  CheckCircle,
  Brain,
  ShieldCheck,
  Sparkles,
  Sliders
} from 'lucide-react';

export default function WhyModal() {
  const { whyModal, closeWhyModal } = usePlacement();

  if (!whyModal.isOpen) return null;

  const confidencePercent = Math.round((whyModal.confidence || 0.95) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1020]/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#151C32] rounded-2xl max-w-xl w-full shadow-2xl border border-[#27324A] overflow-hidden flex flex-col max-h-[90vh] animate-scaleIn text-[#F8FAFC] text-xs">
        {/* Header */}
        <div className="bg-[#0F172A] text-white p-5 flex items-start justify-between border-b border-[#27324A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white shadow-purple flex-shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#7C3AED]/20 px-2 py-0.5 rounded-full text-[#C4B5FD] border border-[#7C3AED]/40">
                  AI Decision &middot; {whyModal.category}
                </span>
                <span className="text-xs font-mono font-bold text-[#4ADE80] bg-[#22C55E]/15 px-2 py-0.5 rounded-full border border-[#22C55E]/30">
                  {confidencePercent}% Confidence
                </span>
              </div>
              <h3 className="font-semibold text-base text-[#F8FAFC] mt-1">
                {whyModal.title}
              </h3>
            </div>
          </div>

          <button
            onClick={closeWhyModal}
            className="text-[#94A3B8] hover:text-white p-1 rounded-lg hover:bg-[#1B2340] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Summary */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
              Evaluation Summary
            </h4>
            <div className="p-3.5 rounded-xl bg-[#0F172A] border border-[#27324A] text-[#CBD5E1] text-xs font-medium leading-relaxed">
              {whyModal.reasons[0] || 'The AI Agent evaluated the candidate profile against company eligibility and fitment requirements.'}
            </div>
          </div>

          {/* Detailed Decision Factors */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#7C3AED]" />
              Evaluation Criteria Breakdown
            </h4>
            <div className="space-y-2">
              {whyModal.reasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-[#1B2340] border border-[#27324A] text-xs text-[#CBD5E1]"
                >
                  <CheckCircle className="w-4 h-4 text-[#4ADE80] flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Variables Considered */}
          {whyModal.factors && whyModal.factors.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                Variables Included
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {whyModal.factors.map((f, i) => (
                  <span key={i} className="text-xs bg-[#0F172A] text-[#CBD5E1] font-medium px-2.5 py-1 rounded-md border border-[#27324A]">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Action */}
          <div className="p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FCD34D] mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
              Recommended Officer Action
            </h4>
            <p className="text-xs text-[#CBD5E1] leading-relaxed font-medium">
              {whyModal.recommendedAction || 'TPO may approve this recommendation or override criteria for special academic dispensations.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0F172A] border-t border-[#27324A] flex items-center justify-between">
          <span className="text-xs text-[#94A3B8]">
            AI Governance &middot; Explainable Placement Intelligence
          </span>
          <button
            onClick={closeWhyModal}
            className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white rounded-xl text-xs font-bold shadow-purple transition-all cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
