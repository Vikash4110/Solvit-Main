import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Calendar,
  Star,
  User,
  Languages,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const API = 'http://localhost:8000/api/v1/booking';
const todayISO = new Date().toISOString().split('T')[0];

const BrowseCounselor = () => {
  const navigate = useNavigate();
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flash, setFlash] = useState({});

  /* UI filters */
  const [search, setSearch] = useState('');
  const [spec, setSpec] = useState('all');
  const [gender, setGender] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const SPECIALIZATIONS = [
    'Mental Health',
    'Career Counselling',
    'Relationship Counselling',
    'Life Coaching',
    'Financial Counselling',
    'Academic Counselling',
    'Health and Wellness Counselling',
  ];

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/available-counselors`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include',
        });
        const j = await r.json();
        setCounselors(j.counselors || []);
      } catch (e) {
        console.error(e);
        setFlash({ type: 'error', text: 'Failed to load counselors' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Navigate to counselor booking page
  const bookCounselor = (counselorId) => {
    navigate(`/book-counselor/${counselorId}`);
  };

  /* Filter counselors */
  const visible = counselors.filter((c) => {
    const bySearch =
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.specialization.toLowerCase().includes(search.toLowerCase());

    const bySpec = spec === 'all' || c.specialization === spec;
    const byGender = gender === 'all' || c.gender === gender;

    if (!bySearch || !bySpec || !byGender) return false;

    if (!dateFilter) return true;

    // keep counselors that have at least one slot on selected date
    return c.availableSlots.some(
      (s) =>
        s.status === 'available' && 
        new Date(s.date).toDateString() === new Date(dateFilter).toDateString()
    );
  });

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* heading */}
      <header className="mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-800">
          <Users className="w-7 h-7 text-blue-600" />
          Browse Counselors
        </h1>
        <p className="text-gray-600">
          Find the right counselor and book a session that works for you
        </p>
      </header>

      {/* flash message */}
      {flash.text && (
        <div
          className={`mb-6 flex items-center gap-2 p-4 rounded-lg border
          ${
            flash.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {flash.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          {flash.text}
        </div>
      )}

      {/* filters */}
      <section className="bg-white border rounded-xl shadow-sm p-6 mb-8">
        <div className="grid gap-4 md:grid-cols-4">
          {/* search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search counselor..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* specialization */}
          <select
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Specializations</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          {/* gender */}
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Genders</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>

          {/* date */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            min={todayISO}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      {/* counselors list */}
      {visible.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No counselors match your filters.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((c) => (
            <article key={c._id} className="bg-white border rounded-xl shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* avatar */}
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  {c.profilePicture ? (
                    <img
                      src={c.profilePicture}
                      alt={c.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-blue-600" />
                  )}
                </div>

                {/* info */}
                <div className="text-center space-y-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{c.fullName}</h3>
                  <p className="text-blue-600 font-medium text-sm">{c.specialization}</p>

                  {/* extras */}
                  <div className="flex justify-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      4.8
                    </span>
                    <span>{c.gender}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {c.availableSlots?.length || 0} slots
                    </span>
                  </div>

                  {/* languages */}
                  {c.application?.languages?.length > 0 && (
                    <div className="flex justify-center gap-1">
                      {c.application.languages.map(lang => (
                        <span key={lang} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {lang}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* summary */}
                  {c.application?.professionalSummary && (
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {c.application.professionalSummary}
                    </p>
                  )}
                </div>

                {/* Book Counselor button */}
                <button
                  onClick={() => bookCounselor(c._id)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Book Counselor
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCounselor;
