import { useNavigate, useParams } from 'react-router-dom';

export default function EventDetailsPage() {
  const params = useParams<{ eventId: string; clubId?: string }>();
  const navigate = useNavigate();

  return (
    <div style={{ padding: 32 }}>
      <div
        style={{
          maxWidth: 720,
          margin: '0 auto',
          padding: 24,
          borderRadius: 12,
          background: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h1 style={{ margin: '0 0 12px', fontSize: 22, color: '#1f2937' }}>
          Event details
        </h1>
        <p style={{ margin: '0 0 8px', color: '#374151' }}>
          eventId: <strong>{params.eventId ?? 'unknown'}</strong>
        </p>
        {params.clubId ? (
          <p style={{ margin: '0 0 16px', color: '#374151' }}>
            clubId: <strong>{params.clubId}</strong>
          </p>
        ) : null}
        <p style={{ margin: '0 0 24px', color: '#6b7280' }}>
          The full event details view is coming soon.
        </p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #d1d5db',
            background: '#ffffff',
            color: '#1f2937',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
