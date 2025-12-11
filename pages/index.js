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

// *** Simple, Clean Inline Styles ***
const styles = {
  container: { maxWidth: '900px', margin: '30px auto', padding: '30px', boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)', borderRadius: '15px', backgroundColor: '#FFFFFF', border: '1px solid #E0E0E0' },
  title: { textAlign: 'center', color: '#0056b3', borderBottom: '3px solid #B3D9FF', paddingBottom: '15px', marginBottom: '20px' },
  subtitle: { textAlign: 'center', color: '#003366', marginBottom: '35px', fontStyle: 'italic', fontSize: '1.1em' },
  form: { display: 'flex', flexDirection: 'column', gap: '25px', padding: '30px', borderRadius: '10px', backgroundColor: '#F9F9F9', border: '1px solid #EEE' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontWeight: 'bold', marginBottom: '8px', color: '#003366', fontSize: '1.05em' },
  textInput: { padding: '12px', borderRadius: '6px', border: '1px solid #0056b3', fontSize: '16px' },
  fileInput: { padding: '12px', border: '1px solid #0056b3', borderRadius: '6px' },
  button: { 
    padding: '15px', 
    backgroundColor: '#007BFF', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '17px', 
    marginTop: '15px', 
    transition: 'background-color 0.3s' 
  },
  loading: { color: '#007BFF', textAlign: 'center', marginTop: '20px', fontStyle: 'italic' },
  error: { color: '#DC3545', textAlign: 'center', marginTop: '20px', padding: '10px', backgroundColor: '#F8D7DA', border: '1px solid #DC3545', borderRadius: '4px' },
  resultContainer: { marginTop: '50px', padding: '30px', border: '3px solid #007BFF', borderRadius: '15px', backgroundColor: '#E6F0FF' },
  resultTitle: { color: '#0056b3', borderBottom: '2px solid #007BFF', paddingBottom: '10px', marginBottom: '20px' },
  markdownOutput: {
    whiteSpace: 'pre-wrap', // Keeps the Markdown formatting structure
    fontFamily: 'monospace',
    backgroundColor: '#FFFFFF',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #DDD',
    fontSize: '1em',
    lineHeight: '1.6',
    color: '#333',
  }
};