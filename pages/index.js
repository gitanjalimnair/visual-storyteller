import { useState, useRef } from 'react';

// Function to convert the uploaded file into a Base64 string
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // Crucial: Only get the Base64 data part after the comma
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export default function VisualStoryteller() {
  const [vibeKeyword, setVibeKeyword] = useState('');
  const [storyResult, setStoryResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setStoryResult('');

    const imageFile = fileInputRef.current.files[0];

    if (!imageFile || !vibeKeyword) {
      setError("Please upload an image and enter a Vibe Keyword!");
      setLoading(false);
      return;
    }

    try {
      // 1. Convert image to Base64
      const imageBase64 = await fileToBase64(imageFile);

      // 2. Call the secure Vercel API endpoint (/api/storyteller)
      const response = await fetch('/api/storyteller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64, vibeKeyword }),
      });

      // Handle the Vercel API response cleanly
      const data = await response.json();

      if (!response.ok) {
        // Use the error message returned from the backend's catch block
        throw new Error(data.message || 'Server error. Check Vercel logs.');
      }

      // 3. Get the Markdown text result
      setStoryResult(data.output);

    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during Vibe Check.");
    } finally {
      setLoading(false);
    }
  };
  
  // Renders the Markdown output directly as a pre-formatted block for quick display
  const MarkdownRenderer = ({ markdown }) => (
    <pre style={styles.markdownOutput}>{markdown}</pre>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🖼️ The Visual Storyteller ✍️</h1>
      <p style={styles.subtitle}>Let the Lens Poet analyze your image and craft a structured, metaphorical report.</p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>1. Upload your image:</label>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            disabled={loading}
            style={styles.fileInput} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>2. Enter your Guiding Vibe Keyword:</label>
          <input
            type="text"
            value={vibeKeyword}
            onChange={(e) => setVibeKeyword(e.target.value)}
            placeholder="e.g., Nostalgia, Future Shock, Hidden Conflict"
            disabled={loading}
            required
            style={styles.textInput}
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Analyzing Visuals...' : '✨ Generate Story'}
        </button>
      </form>

      {error && <p style={styles.error}>Error: {error}</p>}
      
      {loading && <p style={styles.loading}>Analyzing Visuals... Please wait 10-15 seconds for the creative analysis.</p>}

      {storyResult && (
        <div style={styles.resultContainer}>
          <h2 style={styles.resultTitle}>The Lens Poet's Report</h2>
          <MarkdownRenderer markdown={storyResult} />
        </div>
      )}
    </div>
  );
}

// *** Upgraded, Modern Inline Styles (Replace your current styles object with this) ***
const styles = {
  container: { 
    maxWidth: '800px', 
    margin: '50px auto', 
    padding: '40px', 
    borderRadius: '24px', 
    backgroundColor: '#ffffff', 
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.06)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  title: { 
    textAlign: 'center', 
    color: '#1e293b', 
    fontSize: '2.5rem',
    fontWeight: '800',
    letterSpacing: '-0.05em',
    marginBottom: '10px'
  },
  subtitle: { 
    textAlign: 'center', 
    color: '#64748b', 
    marginBottom: '40px', 
    fontSize: '1.1rem',
    lineHeight: '1.6'
  },
  form: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '24px', 
    padding: '32px', 
    borderRadius: '16px', 
    backgroundColor: '#f8fafc', 
    border: '1px solid #e2e8f0' 
  },
  inputGroup: { 
    display: 'flex', 
    flexDirection: 'column',
    gap: '8px'
  },
  label: { 
    fontWeight: '600', 
    color: '#334155', 
    fontSize: '0.95rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  textInput: { 
    padding: '14px 16px', 
    borderRadius: '12px', 
    border: '1px solid #cbd5e1', 
    fontSize: '16px',
    backgroundColor: '#ffffff',
    color: '#1e293b',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  fileInput: { 
    padding: '25px', 
    border: '2px dashed #cbd5e1', 
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    textAlign: 'center',
    cursor: 'pointer'
  },
  button: { 
    padding: '16px', 
    backgroundColor: '#0f172a', // Sleek off-black/dark navy
    color: '#ffffff', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontSize: '1rem', 
    fontWeight: '600',
    marginTop: '10px', 
    transition: 'background-color 0.2s ease',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
  },
  loading: { 
    color: '#64748b', 
    textAlign: 'center', 
    marginTop: '30px', 
    fontStyle: 'italic',
    animation: 'pulse 2s infinite'
  },
  error: { 
    color: '#991b1b', 
    textAlign: 'center', 
    marginTop: '25px', 
    padding: '16px', 
    backgroundColor: '#fef2f2', 
    border: '1px solid #fee2e2', 
    borderRadius: '12px',
    fontWeight: '500'
  },
  resultContainer: { 
    marginTop: '50px', 
    padding: '40px', 
    borderRadius: '20px', 
    backgroundColor: '#fafafa', 
    border: '1px solid #e5e5e5' 
  },
  resultTitle: { 
    color: '#111111', 
    fontSize: '1.75rem',
    fontWeight: '700',
    letterSpacing: '-0.03em',
    borderBottom: '1px solid #e5e5e5', 
    paddingBottom: '15px', 
    marginBottom: '25px' 
  },
  markdownOutput: {
    whiteSpace: 'pre-wrap', 
    fontFamily: 'inherit', // Switched from ugly monospace to clean system font
    fontSize: '1.05rem',
    lineHeight: '1.8',
    color: '#262626',
  }
};