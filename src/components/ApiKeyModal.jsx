import { useState } from 'react';
import { Key, Bike } from 'lucide-react';

export default function ApiKeyModal({ onSubmit, onDemoMode }) {
    const [token, setToken] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (token.trim()) {
            onSubmit(token.trim());
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <Bike size={28} style={{ color: '#22c55e' }} />
                    <div className="modal-title">MTB Trail Recommender</div>
                </div>

                <p className="modal-subtitle">
                    Enter your IMS (Israel Meteorological Service) API token for live weather data.
                    Get a free token by emailing{' '}
                    <a href="mailto:ims@ims.gov.il" style={{ color: '#3b82f6' }}>ims@ims.gov.il</a>.
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        className="modal-input"
                        type="text"
                        placeholder="Paste your IMS API token..."
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        autoFocus
                    />

                    <div className="modal-actions">
                        <button type="submit" className="btn-primary" disabled={!token.trim()}>
                            <Key size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                            Connect to IMS
                        </button>
                        <button type="button" className="btn-secondary" onClick={onDemoMode}>
                            Demo Mode
                        </button>
                    </div>
                </form>

                <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '1rem', lineHeight: '1.5' }}>
                    Demo mode uses simulated weather data to preview the app without an API token.
                </p>
            </div>
        </div>
    );
}
