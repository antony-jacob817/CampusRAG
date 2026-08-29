/**
 * Grounding & Validation Agent:
 * Computes grounding confidence score, validates whether retrieved context
 * is sufficient to formulate an accurate, hallucination-resistant response,
 * and determines if standard fallback must be emitted.
 */

const FALLBACK_UNGROUNDED_MESSAGE = 
  'The requested information is not available in the verified college knowledge base. Please contact the relevant department office directly.';

const validateGrounding = ({
  retrievedChunks = [],
  topScore = 0,
  minThreshold = 0.65,
}) => {
  // If no chunks qualified or top similarity is below threshold
  if (!retrievedChunks || retrievedChunks.length === 0 || topScore < minThreshold) {
    return {
      isGrounded: false,
      confidenceScore: topScore > 0 ? Number(topScore.toFixed(3)) : 0.0,
      fallbackMessage: FALLBACK_UNGROUNDED_MESSAGE,
      reason: `Retrieved chunks score (${topScore}) is below required minimum threshold (${minThreshold}).`,
      action: 'HALT_GENERATION_EMIT_FALLBACK',
    };
  }

  // Compute aggregate confidence score based on top score and chunk depth
  const avgScore = retrievedChunks.reduce((sum, c) => sum + c.score, 0) / retrievedChunks.length;
  
  // Weight top score 70%, average score 30%
  const confidenceScore = Math.min(
    1.0,
    Number((topScore * 0.7 + avgScore * 0.3).toFixed(3))
  );

  return {
    isGrounded: true,
    confidenceScore,
    fallbackMessage: null,
    reason: `Verified ${retrievedChunks.length} grounded document chunk(s) with max similarity ${topScore}.`,
    action: 'PROCEED_TO_GENERATION',
  };
};

module.exports = {
  validateGrounding,
  FALLBACK_UNGROUNDED_MESSAGE,
};
