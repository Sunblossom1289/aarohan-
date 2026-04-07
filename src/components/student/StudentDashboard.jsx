import React from 'react';
import { PROGRAMS } from '../../utils/constants';
import { getStatusBadge } from '../../utils/helpers';

export function StudentDashboard({ state, dispatch, onNavigate }) {
  const { user } = state;
  const program = PROGRAMS.find(p => p.id === user.program);
  
  const tests = [
    { id: 'aptitude', name: 'Aptitude Test', status: user.aptitudeStatus, icon: 'fa-brain' },
    { id: 'personality', name: 'Personality Test', status: user.personalityStatus, icon: 'fa-user-circle' },
    { id: 'interest', name: 'Interest Test', status: user.interestStatus, icon: 'fa-heart' }
  ];
  
  const allTestsComplete = tests.every(t => t.status === 'completed');
  
  return (
    <div>
      {/* UPDATE 1: Header flexbox to put Welcome on left and Program on right */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Welcome, {user.name || 'Student'}!</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0' }}>Your learning journey starts here</p>
        </div>
        
        {/* Current Program Tag moved to header */}
        <div style={{ 
          background: '#f8fbff', 
          padding: '10px 20px', 
          borderRadius: '12px', 
          border: '1px solid #e1e8ed',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '14px', color: '#4a7a96' }}>Current Program: </span>
          <strong style={{ fontSize: '16px', color: '#0e2b3c' }}>{program?.name || 'N/A'}</strong>
        </div>
      </div>

      {/* Profile Completion Alert Banner */}
      {!user.profileCompleted && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
          padding: '16px 24px', marginBottom: '24px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: '#78350f',
          boxShadow: '0 4px 16px rgba(251, 191, 36, 0.3)',
          border: '1px solid #f59e0b'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', flexShrink: 0
          }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '2px' }}>Profile Incomplete</strong>
            <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>Complete your profile to unlock career assessments and get personalized results.</span>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            style={{
              padding: '10px 24px', fontSize: '14px', fontWeight: 600,
              background: 'rgba(255,255,255,0.95)', color: '#92400e',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            <i className="fas fa-user-edit"></i> Complete Profile
          </button>
        </div>
      )}

      {/* UPDATE 2: Grid changed to 3 columns (repeat(3, 1fr)) */}
      <div className="grid mb-24" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        
        {/* Box 1: Tests Completed */}
        <div className="stat-card" style={{ position: 'relative' }}>
          <div className="stat-value">{tests.filter(t => t.status === 'completed').length}/{tests.length}</div>
          <div className="stat-label">Test Sections Completed</div>
        </div>

        {/* Box 2: Mentorship Sessions */}
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '16px' }}>
            <div className="stat-value">{user.counselingCredits || 0}</div>
            <div className="stat-label">Mentorship Sessions</div>
          </div>
          <button
            className="btn"
            onClick={() => onNavigate('upgrade')}
            style={{
              marginTop: 'auto', // Pushes button to bottom
              width: '100%',     // Full width button
              padding: '10px 16px',
              fontSize: 'var(--font-size-sm)',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-teal-600) 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-base)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <i className="fas fa-arrow-up-right-dots"></i> View Plans
          </button>
        </div>

        {/* Box 3: Test Sessions */}
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '16px' }}>
            <div className="stat-value">{user.testCredits || 0}</div>
            <div className="stat-label">Test Sessions</div>
          </div>
          <button
            className="btn"
            onClick={() => onNavigate('upgrade')}
            style={{
              marginTop: 'auto', // Pushes button to bottom
              width: '100%',     // Full width button
              padding: '10px 16px',
              fontSize: 'var(--font-size-sm)',
              background: 'linear-gradient(135deg, #e68161 0%, #d97046 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-base)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <i className="fas fa-arrow-up-right-dots"></i> View Plans
          </button>
        </div>
      </div>

      {/* Profile Info and Quick Actions Grid */}
      <div className="grid grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Profile Information</h3>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>School: </strong> {user.school || 'Not set'}
            </div>
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>Grade: </strong> {user.grade || 'Not set'}
            </div>
            <div style={{ marginBottom: 'var(--space-12)' }}>
              <strong>District: </strong> {user.district || 'Not set'}
            </div>
            {!user.profileCompleted && (
              <button
                className="btn btn-primary mt-16"
                onClick={() => onNavigate('profile')}
              >
                Complete Profile
              </button>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div className="card-body flex flex-col gap-12">
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('tests')}
            >
              <i className="fas fa-clipboard-list"></i> Take Tests
            </button>
            {allTestsComplete && (
              <button
                className="btn btn-outline"
                onClick={() => onNavigate('results')}
              >
                <i className="fas fa-chart-bar"></i> View Results
              </button>
            )}
            {program?.counselingEligible && (
              <button
                className="btn btn-outline"
                onClick={() => onNavigate('counseling')}
              >
                <i className="fas fa-calendar-alt"></i> Book Mentorship Session
              </button>
            )}
            <button
              className="btn btn-outline"
              onClick={() => onNavigate('support')}
            >
              <i className="fas fa-headset"></i> Get Support
            </button>
            <button
              className="btn btn-outline"
              onClick={() => onNavigate('career-encyclopedia')}
            >
              <i className="fas fa-book-open"></i> Career Encyclopedia
            </button>
          </div>
        </div>
      </div>

      {/* Assessment Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Assessment Status</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-3 gap-16">
            {tests.map(test => {
              const badge = getStatusBadge(test.status);
              return (
                <div
                  key={test.id}
                  className="card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => test.status !== 'completed' && onNavigate('tests', test.id)}
                >
                  <div className="flex items-center gap-12 mb-12">
                    <i className={`fas ${test.icon}`} style={{ fontSize: '24px', color: 'var(--color-primary)' }}></i>
                    <h4>{test.name}</h4>
                  </div>
                  <span className={`badge ${badge.class}`}>{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}