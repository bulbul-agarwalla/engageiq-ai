import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';

export default function ReportsListPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a' }}>
          Lecture Reports Directory
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Select a course below to drill down into individual session reports and AI pedagogical interventions.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Available Course Sections</h2>
        </div>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Loading courses...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Code</th>
                  <th>Recorded Sessions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8' }}>
                      No courses available.
                    </td>
                  </tr>
                ) : (
                  courses.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '600' }}>{c.name}</td>
                      <td><span className="badge badge-info">{c.code}</span></td>
                      <td>{c.session_count} lectures</td>
                      <td>
                        <Link to={`/teacher/courses/${c.id}`} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '12px' }}>
                          View Sessions & Reports
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
