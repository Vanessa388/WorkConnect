// controllers/chatController.js - WorkConnect AI Chatbot (Gemini-powered)
const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'workconnect-dev-secret-change-in-production';
const COOKIE_NAME = 'wc_session';

// Initialize Google Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey.startsWith('AIzaSy')) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('[ChatController] ✓ Gemini AI initialized successfully.');
  } catch (err) {
    console.warn('[ChatController] Could not initialize Gemini AI:', err.message);
  }
} else {
  console.warn('[ChatController] GEMINI_API_KEY is missing or invalid. Falling back to built-in engine.');
}

// All supported skills in the database
const KNOWN_SKILLS = [
  'plumber', 'electrician', 'carpenter', 'tailor', 'painter',
  'mechanic', 'hairdresser', 'barber', 'welder', 'cleaner',
  'ac technician', 'generator technician', 'bricklayer', 'mason',
  'tiler', 'roofer', 'security', 'gateman', 'chef', 'caterer',
];

// Nigerian cities and states
const KNOWN_LOCATIONS = [
  'abuja', 'fct', 'lagos', 'ikeja', 'lekki', 'ajah', 'ikorodu', 'surulere',
  'yaba', 'victoria island', 'vi', 'enugu', 'nsukka', 'awka', 'onitsha', 'nnewi',
  'aba', 'umuahia', 'owerri', 'orlu', 'port harcourt', 'portharcourt', 'uyo',
  'ikot ekpene', 'calabar', 'asaba', 'warri', 'ughelli', 'benin city',
  'ekpoma', 'yenagoa', 'makurdi', 'otukpo', 'jos', 'lafia', 'minna',
  'lokoja', 'ilorin', 'offa', 'ibadan', 'abeokuta', 'ijebu ode', 'osogbo',
  'ile ife', 'akure', 'ado ekiti', 'sagamu', 'kaduna', 'zaria', 'kano',
  'maiduguri', 'damaturu', 'bauchi', 'gombe', 'yola', 'jalingo',
  'potiskum', 'sokoto', 'gusau', 'keffi', 'mararaba', 'karu', 'suleja',
  'gwagwalada', 'bida', 'abakpa', 'ogbete', 'trans ekulu', 'independence layout',
];

// ─────────────────────────────────────────────────────────────
// GEMINI AI: Full conversational assistant prompt
// ─────────────────────────────────────────────────────────────

function buildGeminiPrompt({ message, history, language, pendingSkill, pendingLocation }) {
  const historyText = history.length > 0
    ? history.map(m => `${m.from === 'user' ? 'Customer' : 'Assistant'}: ${m.text}`).join('\n')
    : 'No previous messages.';

  return `You are WorkConnect AI — a friendly, intelligent assistant that helps customers in Nigeria find verified local artisans and skilled workers.

LANGUAGE: ${language === 'pidgin' ? 'Nigerian Pidgin English (casual, warm, street-smart)' : 'Standard Nigerian English (clear, friendly, professional)'}

YOUR JOB:
1. Understand what service the customer needs — even when they describe a problem instead of naming a profession.
2. Understand their location.
3. Have a natural conversation — greet them, ask follow-up questions, handle corrections.
4. NEVER invent or show worker profiles yourself. The app will show real database workers.
5. NEVER claim to know if a specific worker is available unless confirmed.

CONTEXT FROM PREVIOUS MESSAGES:
${historyText}

ALREADY KNOWN FROM CONVERSATION:
- Skill/Service already identified: ${pendingSkill || 'Not yet known'}
- Location already identified: ${pendingLocation || 'Not yet known'}

LATEST CUSTOMER MESSAGE: "${message}"

AVAILABLE SKILLS (use EXACTLY one of these in your JSON, or null):
${JSON.stringify(KNOWN_SKILLS)}

PROBLEM → PROFESSION MAPPING (examples to guide your understanding):
- "my sink is blocked / water not draining / pipe leaking / toilet overflowing" → plumber
- "no light / NEPA issue / socket sparking / ceiling fan not working / wiring fault / bulb not coming on" → electrician
- "my generator won't start / generator spoilt / gen dey knock" → generator technician
- "my AC is not cooling / air conditioner fault / AC dey blow hot" → ac technician
- "my car makes noise / car won't start / engine problem / brake fault / keke spoil" → mechanic
- "I want to sew a dress / make agbada / alter my clothes / need a fashion designer" → tailor
- "my room needs painting / I want to repaint my house / wall dey rough" → painter
- "my door is broken / need furniture / wardrobe repair / wooden shelf" → carpenter
- "need someone to wash my house / deep cleaning / house cleaning" → cleaner
- "iron gate / burglary proof / metal fence / welding job" → welder
- "need to lay tiles / tile my bathroom" → tiler
- "need to lay blocks / building work / foundation / plastering" → bricklayer
- "haircut / beard trim / barbing" → barber
- "hair braiding / wig installation / salon / weave" → hairdresser

RULES:
- If the message is a greeting (hi, hello, good morning, how far, how you dey, kedu, etc.) → reply warmly WITHOUT searching for workers. Set skill and location to null.
- If the customer describes a problem but no location → identify the skill, ask ONLY for location.
- If skill is already known (see ALREADY KNOWN above) and customer just gave a location → use the known skill + new location, then search.
- If the customer corrects themselves ("actually I need a plumber", "I meant Enugu") → update accordingly.
- If neither skill nor location is clear → ask a natural follow-up question.
- Never ask for information the customer has ALREADY provided in the conversation.
- When both skill AND location are known → set intent to "search" so the app can query the database.
- Keep replies SHORT and conversational (2-3 sentences max). No bullet lists unless showing results.

RESPOND WITH VALID JSON ONLY — no markdown, no explanation outside the JSON:
{
  "reply": "Your natural conversational reply here",
  "skill": "one skill from the list above, or null",
  "location": "city/town name as typed by customer or null",
  "intent": "greeting | asking_skill | asking_location | search | correction | general"
}`;
}

// ─────────────────────────────────────────────────────────────
// FALLBACK: Built-in conversational engine (when Gemini is off)
// ─────────────────────────────────────────────────────────────

const SKILL_ALIASES = {
  hairdresser: ['hairdresser', 'hair stylist', 'hairstylist', 'hair salon', 'hair braider', 'braider', 'braiding', 'wig maker', 'wig installation', 'plait hair', 'make hair', 'plait', 'wig', 'weave', 'styling'],
  plumber: ['plumber', 'plumbing', 'leaking tap', 'leaking pipe', 'blocked drain', 'burst pipe', 'pipe leak', 'water pipe', 'sink', 'toilet', 'drain', 'pump', 'borehole'],
  electrician: ['electrician', 'electrical', 'faulty wiring', 'wiring', 'broken socket', 'electrical fault', 'no light', 'power problem', 'nepa', 'socket', 'bulb', 'light', 'wire', 'spark', 'fuse', 'switch'],
  carpenter: ['carpenter', 'carpentry', 'broken furniture', 'wooden door', 'cupboard', 'wardrobe repair', 'wood', 'furniture', 'chair', 'table', 'door', 'bed', 'cabinet', 'shelf'],
  tailor: ['tailor', 'tailoring', 'fashion designer', 'sewing', 'sew my clothes', 'alter my clothes', 'dressmaker', 'dress', 'agbada', 'senator', 'native wear', 'suit', 'cloth', 'clothes', 'alteration'],
  painter: ['painter', 'painting', 'paint my room', 'paint my house', 'paint my wall', 'wall painting', 'wall needs painting', 'room needs painting', 'want to paint', 'repaint', 'fenti'],
  mechanic: ['mechanic', 'auto mechanic', 'car repair', 'my car broke down', 'engine problem', 'car engine', 'car not starting', 'car maintenance', 'car', 'motor', 'vehicle', 'keke', 'brake', 'radiator', 'gear'],
  barber: ['barber', 'barbing', 'haircut', 'hair cut', 'shave', 'beard trim', 'fade', 'wanzami'],
  welder: ['welder', 'welding', 'iron gate', 'metal gate', 'burglary proof', 'metal fence', 'gate', 'iron'],
  cleaner: ['cleaner', 'cleaning', 'house cleaning', 'clean my house', 'deep cleaning', 'wash my house'],
  'ac technician': ['ac technician', 'air conditioner', 'air conditioning', 'ac repair', 'my ac is not working', 'ac dey blow hot', 'ac not cooling'],
  'generator technician': ['generator repair', 'generator technician', 'generator is not working', 'fix my generator', 'my generator has spoilt', 'gen dey knock', 'generator won\'t start', 'generator'],
  bricklayer: ['bricklayer', 'mason', 'bricklaying', 'block work', 'building work', 'plastering', 'foundation', 'cement', 'block'],
  tiler: ['tiler', 'tiling', 'tile', 'tiles', 'lay tiles', 'tile my bathroom'],
};

const GREETINGS = /^(hi|hello|hey|how far|how you dey|wetin dey|good morning|good afternoon|good evening|how are you|sup|what'?s up|kedu|nne|oga)[.!?,\s]*$/i;

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function detectSkillFallback(text) {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // 1. Direct match on KNOWN_SKILLS
  for (const s of KNOWN_SKILLS) {
    const rx = new RegExp(`\\b${escapeRegex(s)}\\b`, 'i');
    if (rx.test(lower)) return s;
  }

  // 2. Exact alias matches with word boundaries to avoid substring false-positives
  // e.g. "dress" must NOT match inside "hairdresser", "car" must NOT match inside "carpenter"
  for (const [skill, aliases] of Object.entries(SKILL_ALIASES)) {
    // Sort aliases by length descending so longer/more specific phrases take priority
    const sortedAliases = [...aliases].sort((a, b) => b.length - a.length);
    for (const alias of sortedAliases) {
      const rx = new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i');
      if (rx.test(lower)) return skill;
    }
  }
  return null;
}

function detectLocationFallback(text) {
  const lower = text.toLowerCase();
  for (const loc of KNOWN_LOCATIONS) {
    if (lower.includes(loc)) return loc;
  }
  return null;
}

function fallbackReply({ message, language, pendingSkill, pendingLocation, matchedSkill, matchedLocation }) {
  const isPidgin = language === 'pidgin';
  const lower = message.toLowerCase().trim();

  // Greeting
  if (GREETINGS.test(lower)) {
    return isPidgin
      ? 'How far! 😊 Welcome to WorkConnect. Wetin you need today? Tell me the kind work wey you dey find and your location, make I help you sharp sharp!'
      : 'Hello! 😊 Welcome to WorkConnect. What service do you need today? Let me know what you are looking for and your location!';
  }

  // Who are you
  if (lower.includes('who are you') || lower.includes('who you be') || lower.includes('what can you do')) {
    return isPidgin
      ? 'I be WorkConnect AI! My work na to help you find trusted, verified artisans across Nigeria. Tell me wetin spoil and your area!'
      : 'I am WorkConnect AI! I help you find verified, trusted artisans anywhere in Nigeria. Tell me what you need and your location!';
  }

  const skill = matchedSkill || pendingSkill;
  const location = matchedLocation || pendingLocation;

  if (!skill) {
    if (location) {
      return isPidgin
        ? `I see say you dey ${location.toUpperCase()}! 😊 Which kind work or artisan you dey find? (e.g. plumber, electrician, generator, carpenter) make I find verified workers for you for ${location}!`
        : `Got it, you are in ${location.toUpperCase()}! 😊 What kind of service or artisan are you looking for? (e.g. plumber, electrician, generator technician, carpenter) so I can find verified workers in ${location}!`;
    }
    return isPidgin
      ? 'Abeg tell me the kind work wey you need. For example: "I need plumber" or "my generator no dey start" — just describe the problem!'
      : 'Please tell me what service you need. For example: "I need a plumber" or "my generator won\'t start" — just describe the problem!';
  }

  if (!location) {
    return isPidgin
      ? `I don understand! Na ${skill} you need. 😊 Which town or area you dey? Tell me your location make I find verified ${skill} for you!`
      : `Got it! You need a ${skill}. 😊 Which town or area are you located in? Share your location and I'll find verified artisans for you!`;
  }

  return isPidgin
    ? `I dey find verified ${skill} for ${location} right now...`
    : `Searching for verified ${skill} workers in ${location}...`;
}

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER: POST /api/chat/message
// ─────────────────────────────────────────────────────────────

exports.handleChatMessage = async (req, res) => {
  try {
    const {
      message,
      language = 'pidgin',
      history = [],
      pendingSkill = null,
      pendingLocation = null,
    } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        reply: language === 'pidgin'
          ? 'Abeg type wetin you need make I assist you!'
          : 'Please enter a message so I can assist you.',
      });
    }

    const isPidgin = language.toLowerCase() === 'pidgin';
    const recentHistory = Array.isArray(history) ? history.slice(-12) : [];

    // Extract previous skill and location from history if not passed in pending parameters
    let effectiveSkill = (typeof pendingSkill === 'string' && pendingSkill.trim()) ? pendingSkill.trim().toLowerCase() : null;
    let effectiveLocation = (typeof pendingLocation === 'string' && pendingLocation.trim()) ? pendingLocation.trim().toLowerCase() : null;

    if (recentHistory.length > 0) {
      for (let i = recentHistory.length - 1; i >= 0; i--) {
        const item = recentHistory[i];
        if (!effectiveSkill) {
          if (item.skill && typeof item.skill === 'string') {
            effectiveSkill = item.skill.trim().toLowerCase();
          } else if (item.from === 'user' && item.text) {
            const detected = detectSkillFallback(item.text);
            if (detected) effectiveSkill = detected;
          }
        }
        if (!effectiveLocation) {
          if (item.location && typeof item.location === 'string') {
            effectiveLocation = item.location.trim().toLowerCase();
          } else if (item.from === 'user' && item.text) {
            const detected = detectLocationFallback(item.text);
            if (detected) effectiveLocation = detected;
          }
        }
        if (effectiveSkill && effectiveLocation) break;
      }
    }

    let matchedSkill = null;
    let matchedLocation = null;
    let aiReply = '';
    let intent = 'general';

    // ── 1. Try Gemini AI first ──────────────────────────────
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = buildGeminiPrompt({
          message,
          history: recentHistory,
          language,
          pendingSkill: effectiveSkill,
          pendingLocation: effectiveLocation,
        });

        const result = await model.generateContent(prompt);
        const responseText = (await result.response).text().trim();

        // Strip markdown code fences if Gemini wraps in ```json
        const clean = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        const parsed = JSON.parse(clean);

        aiReply = parsed.reply || '';
        intent = parsed.intent || 'general';

        // Validate skill
        if (typeof parsed.skill === 'string' && parsed.skill !== 'null') {
          const normalised = parsed.skill.toLowerCase().trim();
          matchedSkill = detectSkillFallback(normalised) || KNOWN_SKILLS.find(s => s === normalised || normalised.includes(s) || s.includes(normalised)) || null;
        }

        // If Gemini didn't extract a skill from the message, try local fallback detection on message
        if (!matchedSkill) {
          matchedSkill = detectSkillFallback(message);
        }

        // Location — accept whatever Gemini says (don't require it to be in our list)
        if (typeof parsed.location === 'string' && parsed.location && parsed.location !== 'null') {
          matchedLocation = parsed.location.trim().toLowerCase();
        }
        if (!matchedLocation) {
          matchedLocation = detectLocationFallback(message);
        }

        console.log(`[Gemini] intent=${intent} skill=${matchedSkill} location=${matchedLocation}`);
      } catch (geminiErr) {
        console.warn('[Gemini] Error — using fallback engine:', geminiErr.message);
      }
    }

    // ── 2. Fallback engine if Gemini failed or is unavailable ──
    if (!aiReply) {
      const isGreeting = GREETINGS.test(message.toLowerCase().trim());
      const msgSkill = detectSkillFallback(message);
      let msgLocation = detectLocationFallback(message);

      // If no recognized location from the list, but effectiveSkill is known and message is short (e.g. "Nsukka", "I am in Awka")
      if (!msgLocation && effectiveSkill && !msgSkill && !isGreeting) {
        const cleaned = message.replace(/^(i am in|i dey in|i dey for|in|at|for|located at|my area is|my location is)\s+/i, '').trim();
        if (cleaned.length >= 2 && cleaned.split(/\s+/).length <= 4) {
          msgLocation = cleaned.toLowerCase();
        }
      }

      // Check for skill overrides / updates
      matchedSkill = msgSkill || effectiveSkill || null;
      matchedLocation = msgLocation || effectiveLocation || null;

      if (isGreeting) {
        intent = 'greeting';
      } else if (!matchedSkill) {
        intent = 'asking_skill';
      } else if (!matchedLocation) {
        intent = 'asking_location';
      } else {
        intent = 'search';
      }

      aiReply = fallbackReply({ message, language, pendingSkill: effectiveSkill, pendingLocation: effectiveLocation, matchedSkill, matchedLocation });
    }

    // ── 3. Use effective context to fill in gaps ──────────────
    if (!matchedSkill && effectiveSkill) matchedSkill = effectiveSkill;
    if (!matchedLocation && effectiveLocation) matchedLocation = effectiveLocation;

    // Greetings should never trigger a database search
    if (intent === 'greeting') {
      return res.json({
        success: true,
        reply: aiReply,
        matchedSkill: null,
        matchedLocation: null,
        workers: [],
        intent,
      });
    }

    // ── 4. Determine Intent and Query Database ──────────────

    // Case A: Neither skill nor location known (e.g. general question or unknown message)
    if (!matchedSkill && !matchedLocation) {
      return res.json({
        success: true,
        reply: aiReply || (isPidgin
          ? 'Abeg tell me the kind work wey you need or your location (e.g. "Plumber for Nsukka" or "I dey Enugu") make I help you find verified workers!'
          : 'Please tell me what service you need or your location (e.g. "Plumber in Nsukka" or "I am in Enugu") so I can find verified workers for you!'),
        matchedSkill: null,
        matchedLocation: null,
        workers: [],
        intent: 'asking_skill',
      });
    }

    // Case B: Only skill known (e.g. "My sink is leaking" -> plumber), ask for town
    if (matchedSkill && !matchedLocation) {
      console.log(`[ChatController] Skill known: "${matchedSkill}". Prompting for location.`);
      return res.json({
        success: true,
        reply: aiReply || (isPidgin
          ? `I don understand! Na ${matchedSkill} you need. 😊 Which town or area you dey?`
          : `Got it! You need a ${matchedSkill}. 😊 Which town or area are you located in?`),
        matchedSkill,
        matchedLocation: null,
        workers: [],
        intent: 'asking_location',
      });
    }

    // Case C: Location is known (with OR without specific skill)
    // Query Supabase for real verified artisans in that location
    let matchedWorkers = [];
    try {
      let query = supabase
        .from('workers')
        .select('*')
        .eq('verified', true)
        .ilike('location', `%${matchedLocation}%`);

      if (matchedSkill === 'hairdresser') {
        query = query.or('skill.ilike.%hair%,skill.ilike.%stylist%,skill.ilike.%salon%,skill.ilike.%braid%');
      } else if (matchedSkill === 'ac technician') {
        query = query.or('skill.ilike.%ac%,skill.ilike.%air condition%');
      } else if (matchedSkill === 'generator technician') {
        query = query.or('skill.ilike.%generator%,skill.ilike.%gen%');
      } else if (matchedSkill === 'mechanic') {
        query = query.or('skill.ilike.%mechanic%,skill.ilike.%auto%');
      } else if (matchedSkill) {
        query = query.ilike('skill', `%${matchedSkill}%`);
      }

      const { data: workers, error: dbError } = await query.limit(6);

      if (dbError) {
        console.warn('[ChatController] Supabase query error:', dbError.message);
      } else if (workers) {
        // Exclude banned workers safely (handles false, null, undefined)
        matchedWorkers = workers.filter(w => w.banned !== true);
      }

      console.log(`[ChatController] Query: skill="${matchedSkill || 'ALL'}", location="${matchedLocation}" -> Returned ${matchedWorkers.length} verified workers`);
    } catch (dbErr) {
      console.warn('[ChatController] DB query failed:', dbErr.message);
    }

    // ── 5. Build Final Reply ──────────────────────────────────
    const locUpper = (matchedLocation || 'your area').toUpperCase();

    if (matchedSkill) {
      // Both skill and location known
      if (matchedWorkers.length > 0) {
        aiReply = isPidgin
          ? `I don find ${matchedWorkers.length} verified ${matchedSkill} worker(s) for ${locUpper}! 🎉 Check their profiles below and contact them directly.`
          : `I found ${matchedWorkers.length} verified ${matchedSkill} worker(s) in ${locUpper}! 🎉 Review their profiles below and contact them directly.`;
      } else {
        aiReply = isPidgin
          ? `Chai! I no see any verified ${matchedSkill} for ${locUpper} right now. 😔 You fit try check another nearby town.`
          : `Sorry, I couldn't find any verified ${matchedSkill} workers in ${locUpper} right now. 😔 Try searching in a nearby town or area.`;
      }
    } else {
      // Location only known (e.g. user said "I dey nsukka")
      if (matchedWorkers.length > 0) {
        aiReply = isPidgin
          ? `I see say you dey ${locUpper}! 🎉 Here are verified artisans available in your area right now. Check their profiles below.`
          : `I see you are in ${locUpper}! 🎉 Here are verified artisans available in your area right now. Review their profiles below,`;
      } else {
        aiReply = isPidgin
          ? `I see say you dey ${locUpper}! 😊 We no get verified workers registered for this exact area yet, but you fit tell me the work you need (e.g. plumber, electrician) or try nearby towns like Enugu or Nsukka!`
          : `I see you are in ${locUpper}! 😊 We don't have verified artisans registered in this exact area yet. You can tell me the service you need or check nearby towns like Enugu or Nsukka!`;
      }
    }

    return res.json({
      success: true,
      reply: aiReply,
      matchedSkill,
      matchedLocation,
      workers: matchedWorkers,
      intent: 'search',
    });

  } catch (err) {
    console.error('[ChatController] Server error:', err.message);
    return res.status(500).json({
      success: false,
      reply: 'An error occurred. Please try again.',
      workers: [],
    });
  }
};

// ─────────────────────────────────────────────────────────────
// CHAT HISTORY — GET, SAVE, DELETE
// ─────────────────────────────────────────────────────────────

exports.getChatHistory = async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch { /* guest */ }
    }

    let query = supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null).limit(10);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[ChatHistory] Fetch notice:', error.message);
      return res.json({ success: true, conversations: [] });
    }

    res.json({ success: true, conversations: data || [] });
  } catch (err) {
    console.warn('[ChatHistory] Error:', err.message);
    res.json({ success: true, conversations: [] });
  }
};

exports.saveChatHistory = async (req, res) => {
  try {
    const { id, title = 'New Chat', messages = [], language = 'pidgin' } = req.body;
    const token = req.cookies[COOKIE_NAME];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch { /* guest */ }
    }

    if (id && typeof id === 'number') {
      const { data: updated, error: updateErr } = await supabase
        .from('chat_conversations')
        .update({ title, messages, language, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (!updateErr && updated) {
        return res.json({ success: true, conversation: updated });
      }
    }

    const { data: newChat, error: insertErr } = await supabase
      .from('chat_conversations')
      .insert([{ user_id: userId, title, messages, language }])
      .select()
      .maybeSingle();

    if (insertErr) {
      console.warn('[ChatHistory] Save notice:', insertErr.message);
      return res.json({ success: true, saved: false, message: insertErr.message });
    }

    res.json({ success: true, conversation: newChat });
  } catch (err) {
    console.warn('[ChatHistory] Save error:', err.message);
    res.json({ success: true, saved: false });
  }
};

exports.deleteChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('chat_conversations').delete().eq('id', id);
    res.json({ success: true, message: 'Chat deleted.' });
  } catch (err) {
    res.json({ success: true });
  }
};
