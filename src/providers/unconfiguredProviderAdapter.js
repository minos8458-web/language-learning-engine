// Explicit fail-closed production adapter for the first Mock milestone.
// No vendor SDK, credential lookup, network request, prompt, or raw payload is used.

function createUnconfiguredProviderAdapter() {
  return Object.freeze({
    async generateStructuredContent() {
      throw new Error('AI generation provider is not configured');
    },
    async validateGeneratedContent() {
      throw new Error('AI generation validator is not configured');
    },
  });
}

module.exports = { createUnconfiguredProviderAdapter };
