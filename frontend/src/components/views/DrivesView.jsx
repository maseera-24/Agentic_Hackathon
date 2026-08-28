import React, { useState, useEffect } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import {
  Briefcase,
  Sparkles,
  FileText,
  CheckCircle,
  ArrowRight,
  Calendar,
  Users,
  Building2,
  Sliders,
  Check
} from 'lucide-react';

export default function DrivesView() {
  const { drives, activeDriveId, setActiveDriveId, setActiveView, addToast } = usePlacement();

const [rawJdText, setRawJdText] = useState('');

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleExtract = async () => {
    setIsExtracting(true);
    try {
      const res = await fetch('/api/drives/parse_jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_text: rawJdText })
      });
      const data = await res.json();
      setExtractedData(data);
      addToast('Requirements Extracted', 'AI converted raw JD into structured criteria.', 'success');
    } catch (e) {
      console.error(e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApproveAndShortlist = () => {
    addToast('Criteria Approved', 'Drive criteria locked. Launching automated student eligibility verification.', 'success');
    setActiveView('eligibility');
  };

  const activeDrive = drives.find(d => d.id === activeDriveId) || drives[0];
  useEffect(() => {
  if (!activeDrive) return;

  const requirements = activeDrive.requirements || {};

  const branches = Array.isArray(requirements.branches)
    ? requirements.branches.join(', ')
    : 'As specified by the company';

  const skills = Array.isArray(requirements.skills)
    ? requirements.skills.join(', ')
    : 'As specified by the company';

  setRawJdText(`${activeDrive.company_name || 'Company'} University Hiring 2026

Position: ${activeDrive.role_title || 'Software Engineer'}

Package: ${activeDrive.ctc || 'Not specified'}

Eligibility Criteria:
- Minimum CGPA: ${requirements.min_cgpa ?? 'Not specified'}
- Maximum Backlogs: ${requirements.max_backlogs ?? 'Not specified'}
- Eligible Branches: ${branches}

Required Technical Skills:
- ${skills}
`);
}, [activeDriveId]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              Module 1 &middot; Operations
            </span>
            <span className="text-xs text-slate-500">Unstructured to Structured Pipeline</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Job Description &amp; Eligibility Extraction Agent
          </h2>
          <p className="text-xs text-slate-500">
            Extracts strict academic constraints, technical stack, interview stages, and documents from enterprise JDs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('eligibility')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <span>Proceed to Eligibility Check</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: JD Input & Extracted Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Raw JD Input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                Raw Company Job Description
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Unstructured Text</span>
            </div>
            <textarea
              rows={16}
              value={rawJdText}
              onChange={(e) => setRawJdText(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed resize-none"
              placeholder="Paste company JD here..."
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Target Company: <strong className="text-slate-800">{activeDrive?.company_name}</strong>
            </span>
            <button
              onClick={handleExtract}
              disabled={isExtracting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isExtracting ? 'Extracting Requirements...' : 'Run AI Extraction'}</span>
            </button>
          </div>
        </div>

        {/* Right Col: Structured Extracted Output */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Structured Extracted Requirements
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Confidence: 96%
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Primary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Min CGPA</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {extractedData ? extractedData.min_cgpa : '7.5'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">Max Backlogs</div>
                  <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                    {extractedData
  ? ['Zero', 'One', 'Two', 'Three', 'Four', 'Five'][extractedData.max_backlogs] || extractedData.max_backlogs
  : 'Zero'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold uppercase text-slate-400">CTC Package</div>
                  <div className="text-base font-extrabold text-indigo-700 mt-0.5">
                    {extractedData ? extractedData.ctc : '₹ 32.5 LPA'}
                  </div>
                </div>
              </div>

              {/* Eligible Branches */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 mb-1">Eligible Branches:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Computer Science & Engineering', 'Information Technology', 'AI & Data Science', 'Electronics & Comm'].map((b, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-medium">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Required & Preferred Skills */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 mb-1">Required Skills:</div>
                <div className="flex flex-wrap gap-1.5">
                  {(extractedData?.required_skills || ['Data Structures', 'Algorithms', 'Python', 'C++', 'SQL', 'System Design']).map((s, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-mono">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interview Rounds Sequence */}
              <div>
                <div className="text-[11px] font-bold text-slate-700 mb-1">Extracted Rounds &amp; Durations:</div>
                <div className="space-y-1.5">
                  {[
                    { round: 'Round 1: Online Coding Challenge', duration: '90 mins', type: 'Assessment' },
                    { round: 'Round 2: Technical Interview 1 (DSA)', duration: '45 mins', type: 'Interview' },
                    { round: 'Round 3: Technical Interview 2 (System Design)', duration: '45 mins', type: 'Interview' },
                    { round: 'Round 4: HR & Fitment', duration: '30 mins', type: 'HR' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-semibold text-slate-800">{r.round}</span>
                      <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                        {r.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={handleApproveAndShortlist}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Approve Requirements &amp; Evaluate Candidates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
