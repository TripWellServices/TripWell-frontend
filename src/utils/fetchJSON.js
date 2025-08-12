// utils/fetchJSON.js
// Helper to safely fetch and parse JSON responses

export const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, options);
  
  // Check if response is ok
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  
  // Get content type
  const contentType = res.headers.get('content-type');
  
  // Check if it's JSON
  if (!contentType || !contentType.includes('application/json')) {
    // Clone response to read body without consuming it
    const clonedRes = res.clone();
    const text = await clonedRes.text();
    const preview = text.substring(0, 80);
    
    console.error('❌ Expected JSON but got:', {
      contentType,
      status: res.status,
      url,
      bodyPreview: preview + (text.length > 80 ? '...' : '')
    });
    
    throw new Error(`Expected JSON but got ${contentType}. Response preview: ${preview}`);
  }
  
  // Parse JSON
  return await res.json();
};
