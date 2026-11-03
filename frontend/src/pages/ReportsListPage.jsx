import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileBarChart, BookOpen, ChevronRight, Search, Video } from 'lucide-react';
import { apiFetch } from '../utils/api';

export default function ReportsListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiFetch('/api/dashboard/teacher');
        if (res.ok) {
          const json = await res.json();
          setCourses(json.courses || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div
        style={{
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span className="badge badge-info">Archive</span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Classroom Reports</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Lecture Reports & Analytics Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Select any curriculum section to inspect individual lecture reports, timelines, and AI intervention suggestions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/teacher/live" className="btn btn-primary">
            <Video size={16} /> New Live Lecture
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <BookOpen size={18} color="#818CF8" /> Available Course Sections
            </h2>
          </div>
          <div style={{ width: '260px' }}>
            <input
              type="text"
              placeholder="Search courses or codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px' }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div className="live-pulse-dot" style={{ margin: '0 auto 12px auto' }} />
            Loading course directories...
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Course Code</th>
                  <th>Recorded Sessions</th>
                  <th>Avg Attention</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '28px' }}>
                      No matching courses found.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: '#FFF' }}>{c.name}</td>
                      <td>
                        <span className="badge badge-info">{c.code}</span>
                      </td>
                      <td>{c.session_count} lectures</td>
                      <td style={{ fontWeight: 700, color: (c.average_engagement || 0) >= 70 ? '#34D399' : '#FCD34D' }}>
                        {(c.average_engagement || 0).toFixed(1)}%
                      </td>
                      <td>
                        <Link
                          to={`/teacher/courses/${c.id}`}
                          className="btn btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '12px' }}
                        >
                          View Sessions <ChevronRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
