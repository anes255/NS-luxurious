import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ThemeControl = () => {
  const [currentTheme, setCurrentTheme] = useState({
    primary: '#e91e63',
    secondary: '#f06292',
    accent: '#ec407a',
    background: 'linear-gradient(135deg, #ffeef8 0%, #fff0f5 50%, #fdf2f8 100%)',
    cardBackground: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(253,242,248,0.7))',
    textColor: '#4a4a4a',
    borderColor: '#f8bbd9',
    themeName: 'Pink Theme'
  });
  const [presetThemes, setPresetThemes] = useState({});
  const [customTheme, setCustomTheme] = useState(currentTheme);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadCurrentTheme();
    loadPresetThemes();
  }, []);

  useEffect(() => {
    setCustomTheme(currentTheme);
    applyThemeToCSS(currentTheme);
  }, [currentTheme]);

  const loadCurrentTheme = async () => {
    try {
      const response = await axios.get('/theme');
      setCurrentTheme(response.data);
      applyThemeToCSS(response.data);
    } catch (error) {
      console.error('Error loading current theme:', error);
    }
  };

  const loadPresetThemes = async () => {
    try {
      const response = await axios.get('/theme/presets');
      setPresetThemes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading preset themes:', error);
      setLoading(false);
    }
  };

  const applyThemeToCSS = (theme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primary);
    root.style.setProperty('--secondary-color', theme.secondary);
    root.style.setProperty('--accent-color', theme.accent);
    root.style.setProperty('--text-color', theme.textColor);
    root.style.setProperty('--border-color', theme.borderColor);
    root.style.setProperty('--background-gradient', theme.background);
    root.style.setProperty('--card-background', theme.cardBackground);
    
    document.body.style.background = theme.background;
    document.body.style.color = theme.textColor;
    document.body.style.transition = 'all 0.3s ease';
  };

  const handleApplyPresetTheme = async (themeName) => {
    try {
      setLoading(true);
      const response = await axios.post(`/theme/preset/${themeName}`, {}, {
        headers: {
          'email': 'nessbusiness66@gmail.com',
          'password': 'lavieestbelle070478'
        }
      });
      
      if (response.data.theme) {
        setCurrentTheme(response.data.theme);
        applyThemeToCSS(response.data.theme);
        setSuccess(`${response.data.theme.themeName} applied successfully! All users will see this theme.`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to apply preset theme');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomThemeUpdate = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/theme', customTheme, {
        headers: {
          'email': 'nessbusiness66@gmail.com',
          'password': 'lavieestbelle070478'
        }
      });
      
      if (response.data.theme) {
        setCurrentTheme(response.data.theme);
        applyThemeToCSS(response.data.theme);
        setSuccess('Custom theme applied successfully! All users will see this theme.');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError('Failed to apply custom theme');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLivePreview = () => {
    applyThemeToCSS(customTheme);
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#333' }}>🎨 Theme Control Center</h1>
          <button 
            onClick={() => window.location.href = '/admin/dashboard'}
            className="btn btn-outline"
          >
            ← Back to Dashboard
          </button>
        </div>

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Preset Themes */}
          <div className="profile-section">
            <h3>🎨 Preset Themes</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Choose from pre-designed themes. Changes will apply to ALL users immediately.
            </p>
            
            {loading ? (
              <div className="loading">
                <div className="spinner"></div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {Object.entries(presetThemes).map(([key, themeData]) => (
                  <div key={key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    border: `2px solid ${themeData.primary}`,
                    borderRadius: '12px',
                    background: `linear-gradient(45deg, ${themeData.primary}15, ${themeData.secondary}15)`,
                    transition: 'all 0.3s ease',
                    transform: currentTheme.themeName === themeData.themeName ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: currentTheme.themeName === themeData.themeName ? '0 4px 20px rgba(0,0,0,0.1)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: `linear-gradient(45deg, ${themeData.primary}, ${themeData.secondary})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '1.2rem'
                      }}>
                        {themeData.themeName.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, color: themeData.primary, fontSize: '1.1rem' }}>
                          {themeData.themeName}
                          {currentTheme.themeName === themeData.themeName && (
                            <span style={{ 
                              marginLeft: '0.5rem', 
                              fontSize: '0.8rem', 
                              color: '#28a745',
                              background: 'rgba(40, 167, 69, 0.1)',
                              padding: '2px 8px',
                              borderRadius: '12px'
                            }}>
                              Active
                            </span>
                          )}
                        </h4>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: themeData.primary,
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}></div>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: themeData.secondary,
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}></div>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: themeData.accent,
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}></div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApplyPresetTheme(key)}
                      className="btn btn-primary"
                      style={{ 
                        padding: '0.75rem 1.5rem', 
                        fontSize: '1rem',
                        opacity: currentTheme.themeName === themeData.themeName ? 0.7 : 1
                      }}
                      disabled={loading || currentTheme.themeName === themeData.themeName}
                    >
                      {loading ? 'Applying...' : 
                       currentTheme.themeName === themeData.themeName ? 'Current' : 'Apply Theme'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Theme Editor */}
          <div className="profile-section">
            <h3>🖌️ Custom Theme Editor</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              Create your own custom theme. Changes will apply to ALL users.
            </p>
            
            <div className="form-group">
              <label>Theme Name</label>
              <input
                type="text"
                value={customTheme.themeName}
                onChange={(e) => setCustomTheme({...customTheme, themeName: e.target.value})}
                className="form-control"
                placeholder="My Custom Theme"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Primary Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={customTheme.primary}
                    onChange={(e) => setCustomTheme({...customTheme, primary: e.target.value})}
                    style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={customTheme.primary}
                    onChange={(e) => setCustomTheme({...customTheme, primary: e.target.value})}
                    className="form-control"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Secondary Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={customTheme.secondary}
                    onChange={(e) => setCustomTheme({...customTheme, secondary: e.target.value})}
                    style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={customTheme.secondary}
                    onChange={(e) => setCustomTheme({...customTheme, secondary: e.target.value})}
                    className="form-control"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Accent Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={customTheme.accent}
                    onChange={(e) => setCustomTheme({...customTheme, accent: e.target.value})}
                    style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={customTheme.accent}
                    onChange={(e) => setCustomTheme({...customTheme, accent: e.target.value})}
                    className="form-control"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Text Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={customTheme.textColor}
                    onChange={(e) => setCustomTheme({...customTheme, textColor: e.target.value})}
                    style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={customTheme.textColor}
                    onChange={(e) => setCustomTheme({...customTheme, textColor: e.target.value})}
                    className="form-control"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Border Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={customTheme.borderColor}
                  onChange={(e) => setCustomTheme({...customTheme, borderColor: e.target.value})}
                  style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={customTheme.borderColor}
                  onChange={(e) => setCustomTheme({...customTheme, borderColor: e.target.value})}
                  className="form-control"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Background Gradient</label>
              <textarea
                value={customTheme.background}
                onChange={(e) => setCustomTheme({...customTheme, background: e.target.value})}
                className="form-control"
                rows="3"
                placeholder="linear-gradient(135deg, #color1, #color2)"
              />
            </div>

            <div className="form-group">
              <label>Card Background</label>
              <textarea
                value={customTheme.cardBackground}
                onChange={(e) => setCustomTheme({...customTheme, cardBackground: e.target.value})}
                className="form-control"
                rows="3"
                placeholder="linear-gradient(135deg, rgba(255,255,255,0.9), rgba(253,242,248,0.7))"
              />
            </div>

            {/* Live Preview Button */}
            <button
              onClick={handleLivePreview}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              👁️ Preview Theme (Local Only)
            </button>

            {/* Theme Preview */}
            <div style={{
              padding: '1.5rem',
              borderRadius: '12px',
              background: customTheme.cardBackground,
              border: `2px solid ${customTheme.borderColor}`,
              marginBottom: '1.5rem'
            }}>
              <h4 style={{ color: customTheme.primary, margin: '0 0 0.5rem 0' }}>Theme Preview</h4>
              <p style={{ color: customTheme.textColor, margin: '0 0 1rem 0' }}>
                This is how your theme will look on the website. Colors and styling will be applied globally.
              </p>
              <div style={{
                background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.secondary})`,
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                display: 'inline-block',
                fontSize: '1rem',
                fontWeight: '500'
              }}>
                Sample Button
              </div>
            </div>

            <button
              onClick={handleCustomThemeUpdate}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}
              disabled={loading}
            >
              {loading ? 'Applying Custom Theme...' : '🎨 Apply Custom Theme to All Users'}
            </button>
          </div>
        </div>

        {/* Current Theme Information */}
        <div className="profile-section" style={{ marginTop: '2rem' }}>
          <h3>ℹ️ Current Active Theme (Visible to All Users)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div>
              <strong>Theme Name:</strong>
              <p style={{ margin: '0.5rem 0', color: currentTheme.primary, fontSize: '1.1rem' }}>
                {currentTheme.themeName}
              </p>
            </div>
            <div>
              <strong>Color Palette:</strong>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: currentTheme.primary,
                    border: '2px solid #ccc',
                    margin: '0 auto 0.25rem'
                  }}></div>
                  <small>Primary</small>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: currentTheme.secondary,
                    border: '2px solid #ccc',
                    margin: '0 auto 0.25rem'
                  }}></div>
                  <small>Secondary</small>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: currentTheme.accent,
                    border: '2px solid #ccc',
                    margin: '0 auto 0.25rem'
                  }}></div>
                  <small>Accent</small>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: currentTheme.textColor,
                    border: '2px solid #ccc',
                    margin: '0 auto 0.25rem'
                  }}></div>
                  <small>Text</small>
                </div>
              </div>
            </div>
            <div>
              <strong>Status:</strong>
              <p style={{ margin: '0.5rem 0', color: '#28a745' }}>
                ✅ Active for all users
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeControl;