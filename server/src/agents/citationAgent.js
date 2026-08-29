/**
 * Citation Agent:
 * Extracts clean metadata, document titles, estimated page numbers,
 * chunk indices, and snippet highlights to generate structured citation items
 * for the UI citation drawer and inline chips.
 */

const generateCitations = (chunks = []) => {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  const citations = [];
  const seenKeys = new Set();

  for (const chunk of chunks) {
    const key = `${chunk.documentId || chunk.title}_p${chunk.pageNumber || 1}_c${chunk.chunkIndex || 0}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);

    // Extract a representative snippet (first 180 chars or meaningful sentence)
    const rawText = chunk.text || '';
    const snippet = rawText.length > 200 
      ? rawText.substring(0, 197).trim() + '...' 
      : rawText.trim();

    citations.push({
      documentId: chunk.documentId || chunk.id || 'doc-ref',
      title: chunk.title || 'Official Campus Notice',
      pageNumber: chunk.pageNumber || 1,
      chunkIndex: chunk.chunkIndex || 0,
      snippet,
      similarityScore: chunk.score || 0,
      department: chunk.department || 'general',
      badgeLabel: `[Doc: ${chunk.title}, p.${chunk.pageNumber || 1}]`,
    });
  }

  return citations;
};

module.exports = {
  generateCitations,
};
