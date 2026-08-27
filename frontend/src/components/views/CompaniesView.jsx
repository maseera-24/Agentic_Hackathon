import React from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Briefcase, 
  Award, 
  Layers, 
  ExternalLink,
  ArrowRight
} from 'lucide-react';

export default function CompaniesView() {
  const { setActiveView } = usePlacement();

  const companies = [
    {
      id: 'COMP_GOOGLE',
      name: 'Google India',
      tier: 'Tier-1 (Dream Company)',
      location: 'Bengaluru / Hyderabad',
      roles: ['Software Development Engineer - I (SDE-1)'],
      ctc: '₹ 32.5 LPA',
      minCgpa: 7.5,
      rounds: 'Coding OA (90m) &rarr; 2 Tech DSA Rounds &rarr; Googliness'
    },
    {
      id: 'COMP_MSFT',
      name: 'Microsoft',
      tier: 'Tier-1 (Dream Company)',
      location: 'Hyderabad / Noida',
      roles: ['Cloud Solutions & Software Engineer'],
      ctc: '₹ 28.0 LPA',
      minCgpa: 7.5,
      rounds: 'Codility OA &rarr; Cloud DSA Tech Round &rarr; Leadership Fit'
    },
    {
      id: 'COMP_TCS',
      name: 'Tata Consultancy Services (TCS)',
      tier: 'Tier-2 (Core & Digital)',
      location: 'Pan India',
      roles: ['TCS Digital / Prime Engineer'],
      ctc: '₹ 9.0 - 11.5 LPA',
      minCgpa: 7.0,
      rounds: 'TCS NQT Advanced Test &rarr; Tech &amp; Managerial &rarr; HR'
    },
    {
      id: 'COMP_INFOSYS',
      name: 'Infosys',
      tier: 'Tier-2 (Specialist & DSE)',
      location: 'Mysuru / Bengaluru',
      roles: ['Specialist Programmer (SP)'],
      ctc: '₹ 9.5 LPA',
      minCgpa: 6.8,
      rounds: 'HackWithInfy Coding &rarr; Specialist Technical Interview'
    },
    {
      id: 'COMP_ACCENTURE',
      name: 'Accenture',
      tier: 'Tier-2 (Consulting & Advanced Associate)',
      location: 'Bengaluru / Hyderabad',
      roles: ['Advanced Application Engineering Analyst'],
      ctc: '₹ 6.5 - 8.5 LPA',
      minCgpa: 6.5,
      rounds: 'Cognitive Assessment &rarr; Coding Test &rarr; Tech/HR'
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
              Module 15 &middot; Corporate Partners
            </span>
            <span className="text-xs text-slate-500">Tier-1 &amp; Tier-2 Repository</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Recruiting Companies &amp; Job Profiles
          </h2>
          <p className="text-xs text-slate-500">
            Registered campus hiring organizations, CTC packages, and structured interview formats.
          </p>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {companies.map((comp) => (
          <div
            key={comp.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-700 text-lg border border-slate-200">
                    {comp.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{comp.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{comp.location}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {comp.tier}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400">CTC Package</div>
                  <div className="font-bold text-indigo-700 mt-0.5">{comp.ctc}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400">Min CGPA Cutoff</div>
                  <div className="font-bold text-slate-800 mt-0.5">&ge; {comp.minCgpa}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="font-bold text-slate-700 mb-1">Interview Round Pipeline:</div>
                <div 
                  className="text-[11px] text-slate-600 font-mono leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: comp.rounds }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Hiring Batch: 2026</span>
              <button
                onClick={() => setActiveView('drives')}
                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
              >
                <span>View Drive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
