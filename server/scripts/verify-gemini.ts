// PATHPILOT — LIVE GEMINI CONNECTIVITY & MODEL VERIFICATION SCRIPT
// Directive: PP-DEMO-FINAL-VERIFY-2026-01 (Blocker 4)
// Security: NEVER prints, logs, or exposes GEMINI_API_KEY

import { GoogleGenAI } from '@google/genai';
import { env } from '../src/config/env.js';
import { sanitizeGeminiError } from '../src/config/gemini.js';

async function main() {
  const apiKey = env.GEMINI_API_KEY;
  const configuredModel = env.GEMINI_MODEL;

  console.log('=== GEMINI LIVE VERIFICATION ===');
  console.log('API Key Present:', Boolean(apiKey && apiKey.trim().length > 0));
  console.log('Configured GEMINI_MODEL:', configuredModel);
  console.log('Configured Timeout (ms):', env.GEMINI_TIMEOUT_MS);

  if (!apiKey || apiKey.trim().length === 0) {
    console.error('❌ GEMINI_API_KEY is missing in server/.env');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

  // 1. Test configured model directly with timeout race
  console.log(`\n1. Testing configured model '${configuredModel}'...`);
  try {
    const start = Date.now();
    const res = await Promise.race([
      ai.models.generateContent({
        model: configuredModel,
        contents: 'Reply with exactly: PATHPILOT GEMINI OK'
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMED_OUT')), env.GEMINI_TIMEOUT_MS)
      )
    ]);
    console.log(`✅ SUCCESS (${Date.now() - start}ms)`);
    console.log('Model Version:', res.modelVersion || configuredModel);
    console.log('Response Text:', (res.text || '').trim());
    console.log('Usage Metadata:', JSON.stringify(res.usageMetadata || {}));
  } catch (err) {
    const sanitized = sanitizeGeminiError(err);
    console.log('❌ Configured model failed (sanitized):', JSON.stringify(sanitized));
  }

  // 2. Discover available models from API for this key
  console.log('\n2. Listing supported models on this API key...');
  const candidates: string[] = [];
  try {
    const pager = await ai.models.list();
    for await (const m of pager) {
      if (m.name && m.name.toLowerCase().includes('gemini')) {
        const shortName = m.name.replace(/^models\//, '');
        const actions = (m as any).supportedActions || (m as any).supportedGenerationMethods || [];
        console.log(` - ${shortName} (actions: ${JSON.stringify(actions)})`);
        if (shortName.includes('flash') || shortName.includes('pro')) {
          candidates.push(shortName);
        }
      }
    }
  } catch (err) {
    const sanitized = sanitizeGeminiError(err);
    console.log('❌ List models failed (sanitized):', JSON.stringify(sanitized));
  }

  // 3. Test candidate models (including fast non-deprecated Gemini 3.x models)
  const fallbackCandidates = [
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.7-flash'
  ];

  console.log('\n3. Testing candidate models for live generateContent...');
  let firstSuccessModel: string | null = null;
  for (const modelName of fallbackCandidates) {
    if (modelName === configuredModel) continue;
    try {
      const start = Date.now();
      const res = await Promise.race([
        ai.models.generateContent({
          model: modelName,
          contents: 'Reply with two words: GEMINI READY'
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('TIMED_OUT')), env.GEMINI_TIMEOUT_MS)
        )
      ]);
      console.log(` ✅ Candidate '${modelName}' SUCCEEDED in ${Date.now() - start}ms -> "${(res.text || '').trim()}" (version: ${res.modelVersion || modelName})`);
      if (!firstSuccessModel) firstSuccessModel = modelName;
    } catch (err) {
      const sanitized = sanitizeGeminiError(err);
      console.log(` ❌ Candidate '${modelName}' failed: [${sanitized.code}] ${sanitized.message}`);
    }
  }

  // 4. Verify Timeout Behavior using a 1ms timeout boundary
  console.log('\n4. Testing configured timeout race guard...');
  try {
    await Promise.race([
      ai.models.generateContent({
        model: firstSuccessModel || configuredModel,
        contents: 'Write a 200-word essay.'
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMED_OUT')), 1)
      )
    ]);
    console.log(' ⚠️ 1ms timeout did not trigger before response.');
  } catch (err) {
    const sanitized = sanitizeGeminiError(err);
    console.log(` ✅ Timeout guard triggered cleanly -> [${sanitized.code}] ${sanitized.message}`);
  }
}

main().catch((err) => {
  console.error('Fatal error (sanitized):', sanitizeGeminiError(err));
  process.exit(1);
});
