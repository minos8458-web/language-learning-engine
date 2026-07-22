// Production composition root for the AC-018 first Mock milestone.

const contentEngine = require('../engines/contentEngine');
const { createAiGenerationEngine } = require('../engines/aiGenerationEngine');
const { createGenerationEngine } = require('../engines/generationEngine');
const { createUnconfiguredProviderAdapter } = require('../providers/unconfiguredProviderAdapter');

function createGenerationComposition() {
  const providerAdapter = createUnconfiguredProviderAdapter();
  const aiGenerationEngine = createAiGenerationEngine({ providerAdapter });
  const generationEngine = Object.freeze(
    createGenerationEngine({ aiGenerationEngine, contentEngine })
  );
  return Object.freeze({ generationEngine });
}

const { generationEngine } = createGenerationComposition();

module.exports = { generationEngine, createGenerationComposition };
