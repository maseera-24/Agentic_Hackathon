import React, { useState, useEffect } from 'react';
import { usePlacement } from '../../context/PlacementContext';
import { api } from '../../api/client';
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ExternalLink,
  MapPin,
  Briefcase,
  Sparkles,
  FileText,
  X,
  Search,
  Globe,
  Mail,
  Phone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function OfficerCompaniesView() {
  const { setOfficerTab, addToast } = usePlacement();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');

  // Modals
  const [createCompanyModal, setCreateCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [viewingCompany, setViewingCompany] = useState(null);
  const [addJdModal, setAddJdModal] = useState(null); // company object

  const [companyForm, setCompanyForm] = useState({
    name: '',
    industry: 'Software & Technology Services',
    tier: 'Tier-1 (Dream Company)',
    location: 'Bengaluru / Hyderabad',
    website: 'https://',
    description: '',
    contact_person: '',
    contact_email: '',
    contact_phone: ''
  });

  const [jdForm, setJdForm] = useState({
    role_title: '',
    package: '₹ 18.0 LPA',
    min_cgpa: 7.5,
    max_backlogs: 0,
    allowed_branches: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science'],
    required_skills: 'Python, C++, Data Structures, Algorithms, SQL',
    preferred_skills: 'System Design, Cloud, Docker',
    description: ''
  });

  const [rawJdText, setRawJdText] = useState('');
  const [parsingJd, setParsingJd] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.getCompanies();
      setCompanies(data || []);
    } catch (e) {
      console.error(e);
      addToast('Error', 'Failed to load recruiting companies.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter(c => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      c.name?.toLowerCase().includes(q) ||
      c.industry?.toLowerCase().includes(q) ||
      c.location?.toLowerCase().includes(q);
    const matchesIndustry = industryFilter === 'All' || c.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  const handleOpenCreateCompany = () => {
    setEditingCompany(null);
    setCompanyForm({
      name: '',
      industry: 'Software & Technology Services',
      tier: 'Tier-1 (Dream Company)',
      location: 'Bengaluru / Hyderabad',
      website: 'https://',
      description: '',
      contact_person: '',
      contact_email: '',
      contact_phone: ''
    });
    setCreateCompanyModal(true);
  };

  const handleOpenEditCompany = (company) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name || '',
      industry: company.industry || 'Software & Technology Services',
      tier: company.tier || 'Tier-1 (Dream Company)',
      location: company.location || 'Bengaluru / Hyderabad',
      website: company.website || 'https://',
      description: company.description || '',
      contact_person: company.contact_person || '',
      contact_email: company.contact_email || '',
      contact_phone: company.contact_phone || ''
    });
    setCreateCompanyModal(true);
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await api.updateCompany(editingCompany.id, companyForm);
        addToast('Company Updated', `${companyForm.name} updated successfully.`, 'success');
      } else {
        await api.createCompany(companyForm);
        addToast('Company Registered', `${companyForm.name} added to MongoDB.`, 'success');
      }
      setCreateCompanyModal(false);
      await fetchCompanies();
    } catch (err) {
      addToast('Error', err.message || 'Failed to save company.', 'error');
    }
  };

  const handleDeleteCompany = async (companyId, companyName) => {
    if (!window.confirm(`Delete ${companyName} and remove all linked JDs?`)) return;
    try {
      await api.deleteCompany(companyId);
      addToast('Company Removed', `${companyName} deleted from database.`, 'info');
      await fetchCompanies();
    } catch (err) {
      addToast('Error', err.message || 'Failed to delete company.', 'error');
    }
  };

  const handleAiParseJd = async () => {
    if (!rawJdText.trim()) return;
    setParsingJd(true);
    try {
      const res = await api.parseJD(rawJdText);
      if (res) {
        setJdForm({
          role_title: res.role_title || res.role || jdForm.role_title,
          package: res.ctc || jdForm.package,
          min_cgpa: res.min_cgpa ?? jdForm.min_cgpa,
          max_backlogs: res.max_backlogs ?? jdForm.max_backlogs,
          allowed_branches: res.branches || jdForm.allowed_branches,
          required_skills: (res.required_skills || []).join(', ') || jdForm.required_skills,
          preferred_skills: (res.preferred_skills || []).join(', ') || jdForm.preferred_skills,
          description: rawJdText
        });
        addToast('AI Extracted Requirements', 'Structured criteria populated into form.', 'success');
      }
    } catch (e) {
      addToast('Error', 'Failed to parse JD text.', 'error');
    } finally {
      setParsingJd(false);
    }
  };

  const handleSaveJd = async (e) => {
    e.preventDefault();
    if (!addJdModal) return;
    try {
      const payload = {
        role_title: jdForm.role_title,
        ctc: jdForm.package,
        package: jdForm.package,
        min_cgpa: parseFloat(jdForm.min_cgpa) || 7.0,
        max_backlogs: parseInt(jdForm.max_backlogs) || 0,
        allowed_branches: jdForm.allowed_branches,
        required_skills: jdForm.required_skills.split(',').map(s => s.trim()).filter(Boolean),
        preferred_skills: jdForm.preferred_skills.split(',').map(s => s.trim()).filter(Boolean),
        description: jdForm.description
      };
      await api.addCompanyJD(addJdModal.id, payload);
      addToast('JD Attached', `Job Description added to ${addJdModal.name}.`, 'success');
      setAddJdModal(null);
      await fetchCompanies();
    } catch (err) {
      addToast('Error', err.message || 'Failed to attach JD.', 'error');
    }
  };

  const handleCreateDriveFromJd = async (company, role) => {
    try {
      const payload = {
        company_name: company.name,
        role_title: role.title || role.role_title,
        package: role.ctc || role.package || 'Best in Industry',
        ctc: role.ctc || role.package || 'Best in Industry',
        location: company.location || 'Bengaluru',
        description: role.description || company.description || 'Campus recruitment drive.',
        application_deadline: '2026-09-25',
        drive_date: '2026-09-30',
        drive_status: 'ACTIVE',
        status: 'Active',
        requirements: {
          min_cgpa: role.min_cgpa ?? 7.0,
          max_backlogs: role.max_backlogs ?? 0,
          branches: role.allowed_branches || ['Computer Science & Engineering', 'Information Technology'],
          graduation_year: 2026,
          required_skills: role.required_skills || ['Python', 'SQL', 'DSA']
        }
      };
      await api.createPlacementDrive(payload);
      addToast('Placement Drive Activated', `Drive published for ${company.name} (${payload.role_title}).`, 'success');
      setOfficerTab('drives');
    } catch (err) {
      addToast('Error', err.message || 'Failed to create drive.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-8 text-[#F8FAFC]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#F8FAFC]">
            Company &amp; JD Management ({companies.length})
          </h2>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Manage recruiting corporate partners, extract job descriptions with AI, and launch campus placement drives.
          </p>
        </div>

        <button
          onClick={handleOpenCreateCompany}
          className="px-4 py-2 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-purple cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#151C32] border border-[#27324A] p-4 rounded-2xl shadow-soft">
        <div className="relative sm:col-span-2">
          <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company name, industry, location..."
            className="w-full pl-9 pr-3 py-2 bg-[#111827] border border-[#334155] rounded-xl text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          />
        </div>

        <div>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
          >
            <option value="All">All Industries</option>
            <option value="Software & Technology Services">Software &amp; Technology</option>
            <option value="Cloud & Enterprise Software">Cloud &amp; Enterprise</option>
            <option value="IT Services & Consulting">IT Services &amp; Consulting</option>
            <option value="E-Commerce & Retail Tech">E-Commerce &amp; Retail</option>
            <option value="Financial Technology">Fintech &amp; Banking</option>
          </select>
        </div>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[#94A3B8]">
          Loading recruiting partners from MongoDB...
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="py-16 text-center bg-[#151C32] rounded-2xl border border-[#27324A] text-xs text-[#94A3B8] shadow-soft">
          No companies found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map(company => {
            const rolesCount = (company.roles || []).length;
            const drivesCount = company.total_drives || 0;

            return (
              <div
                key={company.id}
                className="bg-[#151C32] border border-[#27324A] rounded-2xl p-5 sm:p-6 shadow-soft hover:border-[#7C3AED] hover:shadow-soft-md transition-all flex flex-col justify-between space-y-4 text-xs group"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/20 text-[#A78BFA] flex items-center justify-center font-bold text-base border border-[#7C3AED]/40 flex-shrink-0 group-hover:scale-105 transition-transform">
                        {company.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-[#F8FAFC] group-hover:text-[#A78BFA] transition-colors">
                          {company.name}
                        </h3>
                        <div className="text-[11px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#94A3B8]" />
                          <span>{company.location || 'Pan India'}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#0F172A] text-[#A78BFA] border border-[#27324A]">
                      {company.tier || 'Tier-1'}
                    </span>
                  </div>

                  <p className="text-[#CBD5E1] text-[11px] line-clamp-2 leading-relaxed">
                    {company.description || 'Enterprise recruiting partner.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-[#0F172A] p-3 rounded-xl border border-[#27324A] text-[11px]">
                    <div>
                      <span className="text-[#94A3B8] block text-[10px]">Job Descriptions</span>
                      <span className="font-semibold text-[#F8FAFC]">{rolesCount} Roles</span>
                    </div>
                    <div>
                      <span className="text-[#94A3B8] block text-[10px]">Active Drives</span>
                      <span className="font-semibold text-[#A78BFA]">{drivesCount} Published</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#27324A] flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => setViewingCompany(company)}
                    className="p-1.5 rounded-xl border border-[#27324A] hover:border-[#7C3AED] hover:bg-[#1B2340] text-[#A78BFA] font-medium text-xs flex items-center gap-1 cursor-pointer"
                    title="View JDs & Details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>JDs ({rolesCount})</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setAddJdModal(company);
                        setRawJdText('');
                        setJdForm({
                          role_title: '',
                          package: '₹ 18.0 LPA',
                          min_cgpa: 7.5,
                          max_backlogs: 0,
                          allowed_branches: ['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence & Data Science'],
                          required_skills: 'Python, C++, Data Structures, Algorithms, SQL',
                          preferred_skills: 'System Design, Cloud, Docker',
                          description: ''
                        });
                      }}
                      className="p-1.5 rounded-xl bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 text-[#C4B5FD] border border-[#7C3AED]/40 text-xs font-medium cursor-pointer"
                      title="Attach new JD"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEditCompany(company)}
                      className="p-1.5 rounded-xl border border-[#27324A] hover:border-[#7C3AED] hover:bg-[#1B2340] text-[#A78BFA] cursor-pointer"
                      title="Edit Company"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteCompany(company.id, company.name)}
                      className="p-1.5 rounded-xl border border-[#27324A] hover:bg-rose-950/40 text-[#EF4444] cursor-pointer"
                      title="Delete Company"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Company Modal */}
      {createCompanyModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleSaveCompany} className="bg-[#151C32] w-full max-w-lg rounded-2xl border border-[#27324A] p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-scaleIn text-[#F8FAFC] text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27324A]">
              <h3 className="font-semibold text-sm text-[#F8FAFC]">
                {editingCompany ? `Edit ${editingCompany.name}` : 'Add Recruiting Company'}
              </h3>
              <button type="button" onClick={() => setCreateCompanyModal(false)} className="p-1 text-[#94A3B8] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[#CBD5E1] font-medium mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  placeholder="e.g. Google India"
                  required
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Industry</label>
                  <select
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  >
                    <option value="Software & Technology Services">Software &amp; Technology</option>
                    <option value="Cloud & Enterprise Software">Cloud &amp; Enterprise</option>
                    <option value="IT Services & Consulting">IT Services</option>
                    <option value="E-Commerce & Retail Tech">E-Commerce</option>
                    <option value="Financial Technology">Fintech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Hiring Tier</label>
                  <select
                    value={companyForm.tier}
                    onChange={(e) => setCompanyForm({ ...companyForm, tier: e.target.value })}
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  >
                    <option value="Tier-1 (Dream Company)">Tier-1 (Dream)</option>
                    <option value="Tier-2 (Core Engineering)">Tier-2 (Core)</option>
                    <option value="Tier-3 (Mass Recruitment)">Tier-3 (Mass)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={companyForm.location}
                    onChange={(e) => setCompanyForm({ ...companyForm, location: e.target.value })}
                    placeholder="e.g. Bengaluru / Hyderabad"
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Website</label>
                  <input
                    type="text"
                    value={companyForm.website}
                    onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                    placeholder="https://company.com"
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#CBD5E1] font-medium mb-1">Description</label>
                <textarea
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  placeholder="Overview of company and hiring domains..."
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl p-2.5 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={companyForm.contact_person}
                    onChange={(e) => setCompanyForm({ ...companyForm, contact_person: e.target.value })}
                    placeholder="e.g. Campus Recruiter"
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={companyForm.contact_email}
                    onChange={(e) => setCompanyForm({ ...companyForm, contact_email: e.target.value })}
                    placeholder="recruitment@company.com"
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#27324A] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreateCompanyModal(false)}
                className="px-4 py-2 rounded-xl border border-[#27324A] hover:bg-[#1B2340] text-[#CBD5E1] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold shadow-purple cursor-pointer"
              >
                Save Company
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Attach JD Modal with AI Text Parser */}
      {addJdModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151C32] w-full max-w-xl rounded-2xl border border-[#27324A] p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-scaleIn text-[#F8FAFC] text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27324A]">
              <div>
                <h3 className="font-semibold text-sm text-[#F8FAFC]">
                  Create Job Description &middot; {addJdModal.name}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-0.5">Attach JD requirements or parse with AI.</p>
              </div>
              <button type="button" onClick={() => setAddJdModal(null)} className="p-1 text-[#94A3B8] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Parse Box */}
            <div className="bg-[#0F172A] border border-[#27324A] rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#A78BFA] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                  Paste Raw JD &amp; Auto-Extract
                </span>
                <button
                  type="button"
                  onClick={handleAiParseJd}
                  disabled={parsingJd}
                  className="px-3 py-1 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-lg text-[11px] font-semibold shadow-purple cursor-pointer"
                >
                  {parsingJd ? 'Extracting...' : 'Extract Fields'}
                </button>
              </div>
              <textarea
                value={rawJdText}
                onChange={(e) => setRawJdText(e.target.value)}
                placeholder="Paste JD text here (e.g. Role: Software Engineer, Min CGPA: 7.5, Backlogs: 0, Skills: Python, SQL, C++)..."
                className="w-full bg-[#111827] border border-[#334155] rounded-lg p-2.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all h-20"
              />
            </div>

            <form onSubmit={handleSaveJd} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Job Role Title</label>
                  <input
                    type="text"
                    value={jdForm.role_title}
                    onChange={(e) => setJdForm({ ...jdForm, role_title: e.target.value })}
                    placeholder="e.g. Software Development Engineer (SDE-1)"
                    required
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">CTC Package</label>
                  <input
                    type="text"
                    value={jdForm.package}
                    onChange={(e) => setJdForm({ ...jdForm, package: e.target.value })}
                    placeholder="e.g. ₹ 24.0 LPA"
                    required
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all font-semibold font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Minimum CGPA Cutoff</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={jdForm.min_cgpa}
                    onChange={(e) => setJdForm({ ...jdForm, min_cgpa: parseFloat(e.target.value) || 7.0 })}
                    required
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[#CBD5E1] font-medium mb-1">Max Active Backlogs Allowed</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={jdForm.max_backlogs}
                    onChange={(e) => setJdForm({ ...jdForm, max_backlogs: parseInt(e.target.value) || 0 })}
                    required
                    className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#CBD5E1] font-medium mb-1">Required Technical Skills</label>
                <input
                  type="text"
                  value={jdForm.required_skills}
                  onChange={(e) => setJdForm({ ...jdForm, required_skills: e.target.value })}
                  placeholder="Python, Java, C++, SQL, DSA"
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#CBD5E1] font-medium mb-1">Preferred Skills / Tools</label>
                <input
                  type="text"
                  value={jdForm.preferred_skills}
                  onChange={(e) => setJdForm({ ...jdForm, preferred_skills: e.target.value })}
                  placeholder="System Design, Docker, Cloud, PyTorch"
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl px-3 py-2 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                />
              </div>

              <div>
                <label className="block text-[#CBD5E1] font-medium mb-1">Job Description Notes</label>
                <textarea
                  value={jdForm.description}
                  onChange={(e) => setJdForm({ ...jdForm, description: e.target.value })}
                  placeholder="Selection rounds and JD overview..."
                  className="w-full bg-[#111827] border border-[#334155] rounded-xl p-2.5 text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all h-20"
                />
              </div>

              <div className="pt-3 border-t border-[#27324A] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddJdModal(null)}
                  className="px-4 py-2 rounded-xl border border-[#27324A] hover:bg-[#1B2340] text-[#CBD5E1] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white font-semibold shadow-purple cursor-pointer"
                >
                  Attach JD to Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Company JDs & Launch Placement Drive Modal */}
      {viewingCompany && (
        <div className="fixed inset-0 z-50 bg-[#0B1020]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#151C32] w-full max-w-2xl rounded-2xl border border-[#27324A] p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-scaleIn text-[#F8FAFC] text-xs shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#27324A]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[#F8FAFC]">{viewingCompany.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#C4B5FD] font-semibold border border-[#7C3AED]/40">
                    {viewingCompany.tier || 'Tier-1'}
                  </span>
                </div>
                <p className="text-xs text-[#94A3B8] mt-0.5">{viewingCompany.industry} &middot; {viewingCompany.location}</p>
              </div>

              <button onClick={() => setViewingCompany(null)} className="p-1 text-[#94A3B8] hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* JDs List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-[#F8FAFC]">
                  Job Descriptions &amp; Roles ({(viewingCompany.roles || []).length})
                </span>
                <button
                  onClick={() => {
                    setAddJdModal(viewingCompany);
                    setViewingCompany(null);
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-purple cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New JD</span>
                </button>
              </div>

              {(viewingCompany.roles || []).length === 0 ? (
                <div className="p-8 text-center bg-[#0F172A] rounded-xl border border-[#27324A] text-[#94A3B8]">
                  No job descriptions attached yet. Click "+ New JD" to add one.
                </div>
              ) : (
                <div className="space-y-3">
                  {(viewingCompany.roles || []).map((role, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#0F172A] border border-[#27324A] space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-sm text-[#F8FAFC]">{role.title || role.role_title}</div>
                          <div className="text-xs text-[#A78BFA] font-semibold font-mono mt-0.5">
                            {role.ctc || role.package}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCreateDriveFromJd(viewingCompany, role)}
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:from-[#4338CA] hover:to-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 shadow-purple transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Launch Drive</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#CBD5E1]">
                        <div><span className="font-semibold text-[#94A3B8]">Min CGPA:</span> &ge; {role.min_cgpa ?? '7.0'}</div>
                        <div><span className="font-semibold text-[#94A3B8]">Backlogs Allowed:</span> {role.max_backlogs ?? 0}</div>
                      </div>

                      {role.required_skills && (
                        <div>
                          <span className="text-[#94A3B8] text-[10px] uppercase font-semibold block mb-1">Required Skills:</span>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(role.required_skills) ? role.required_skills : String(role.required_skills).split(',')).map((sk, i) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-[#7C3AED]/20 text-[#C4B5FD] border border-[#7C3AED]/40 text-[10px] font-medium">
                                {sk.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#27324A] flex justify-end">
              <button
                onClick={() => setViewingCompany(null)}
                className="px-4 py-2 rounded-xl border border-[#27324A] hover:bg-[#1B2340] text-[#CBD5E1] font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
