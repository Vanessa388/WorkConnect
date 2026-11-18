// controllers/chatController.js - Gemini AI & Artisan Matcher + Chat History Persistence
const { GoogleGenerativeAI } = require('@google/generative-ai');
const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'workconnect-dev-secret-change-in-production';
const COOKIE_NAME = 'wc_session';

// Initialize Google Gemini AI SDK with API Key
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey.startsWith('AIzaSy')) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (err) {
    console.warn('Could not initialize GoogleGenerativeAI:', err.message);
  }
} else {
  console.warn('Notice: GEMINI_API_KEY does not start with AIzaSy. Using intelligent built-in conversational AI engine.');
}

// Known skills for quick database keyword matching
const KNOWN_SKILLS = [
  'plumber',
  'electrician',
  'carpenter',
  'tailor',
  'painter',
  'mechanic',
  'hairdresser',
  'welder',
  'cleaner',
  'ac technician',
  'generator',
  'bricklayer'
];

// Known Nigerian locations
const KNOWN_LOCATIONS = [
  'nsukka',
  'enugu',
  'lagos',
  'abuja',
  'owerri',
  'awka',
  'port harcourt',
  'ibadan',
  'benin',
  'calabar'
];


function extractKeywords(text) {
  const lower = text.toLowerCase().trim();
  let matchedSkill = null;
  let matchedLocation = null;

  // Match exact profession names and common variations
  const skillAliases = {
    plumber: ["plumber", "plumbing"],
    electrician: ["electrician", "electrical", "electricians"],
    carpenter: ["carpenter", "carpentry"],
    tailor: ["tailor", "tailoring", "fashion designer"],
    painter: ["painter", "painting"],
    mechanic: ["mechanic", "mechanics", "auto mechanic"],
    hairdresser: [
      "hairdresser",
      "hair stylist",
      "hairdresser",
      "hairstylist",
      "hair stylist",
      "hair salon",
      "hair braider",
      "braider",
      "braiding",
      "wig maker",
      "wig installation",
    ],
    welder: ["welder", "welding"],
    cleaner: ["cleaner", "cleaning"],
    "ac technician": ["ac technician", "air conditioner", "air conditioning"],
    generator: ["generator repair", "generator technician"],
    bricklayer: ["bricklayer", "mason", "bricklaying"],
  };

  for (const [skill, aliases] of Object.entries(skillAliases)) {
    if (aliases.some((alias) => lower.includes(alias))) {
      matchedSkill = skill;
      break;
    }
  }

  // Match locations
  for (const loc of KNOWN_LOCATIONS) {
    if (lower.includes(loc)) {
      matchedLocation = loc;
      break;
    }
  }

  // Only use these descriptions when no profession was detected
  if (!matchedSkill) {
    if (
      lower.includes("light") ||
      lower.includes("nepa") ||
      lower.includes("wire") ||
      lower.includes("spark")
    ) {
      matchedSkill = "electrician";
    } else if (
      lower.includes("water") ||
      lower.includes("tap") ||
      lower.includes("pipe") ||
      lower.includes("leak")
    ) {
      matchedSkill = "plumber";
    } else if (
      lower.includes("wood") ||
      lower.includes("chair") ||
      lower.includes("table") ||
      lower.includes("door")
    ) {
      matchedSkill = "carpenter";
    } else if (
      lower.includes("cloth") ||
      lower.includes("sew") ||
      lower.includes("dress") ||
      lower.includes("agbada")
    ) {
      matchedSkill = "tailor";
    } else if (
      lower.includes("car") ||
      lower.includes("motor") ||
      lower.includes("engine")
    ) {
      matchedSkill = "mechanic";
    } else if (lower.includes("paint") || lower.includes("wall")) {
      matchedSkill = "painter";
    } else if (
      lower.includes("hair") ||
      lower.includes("braid") ||
      lower.includes("barber") ||
      lower.includes("wig")
    ) {
      matchedSkill = "hairdresser";
    }
  }

  return { matchedSkill, matchedLocation };
}

/**
 * Intelligent Fallback Conversational Engine for Pidgin & English
 */
function generateConversationalReply(message, isPidgin, matchedSkill, matchedLocation, count) {
  const lower = message.toLowerCase();

  // Greetings
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('how far') || lower.includes('wetin dey') || lower.includes('good morning') || lower.includes('good afternoon') || lower.includes('kedu')) {
    if (isPidgin) {
      return "How far! I dey well well. I be your WorkConnect assistant. Wetin you need today? Whether na light work, pipe leak, carpentry or mechanic, just tell me your area!";
    } else {
      return "Hello! I am your WorkConnect AI assistant. How can I help you today? Whether you need a plumber, electrician, carpenter, or tailor, just let me know what you need and your location!";
    }
  }

  // Who are you / about
  if (lower.includes('who are you') || lower.includes('who you be') || lower.includes('wetin you fit do') || lower.includes('what can you do')) {
    if (isPidgin) {
      return "I be WorkConnect AI! My work na to help you find trusted, verified artisans for Nigeria sharp-sharp. Tell me wetin spoil for your house or office, make I show you verified experts!";
    } else {
      return "I am WorkConnect AI! I help homeowners and businesses find verified, background-checked skilled artisans across Nigeria. Just tell me what service you need and where!";
    }
  }

  // If workers found
  if (count > 0) {
    const locStr = matchedLocation ? ` for ${matchedLocation.toUpperCase()}` : "";
    const skillStr = matchedSkill ? ` ${matchedSkill}` : " artisan";
    if (isPidgin) {
      return `E don set! 🎉 I don search our database and see ${count} verified${skillStr}(s)${locStr} wey fit sort your work quick. Tap their profile cards below to inspect their work or call them directly!`;
    } else {
      return `Great news! I found ${count} verified${skillStr}(s)${locStr} in our database. Click their profile cards below to inspect their photos, experience, and contact them directly.`;
    }
  }

  // Skill matched but 0 workers in that specific location
  if (matchedSkill) {
    if (isPidgin) {
      return `I see say na ${matchedSkill} you dey find, but no verified one dey registered for ${matchedLocation || 'that exact area'} right now. Try check nearby towns like Nsukka or Enugu!`;
    } else {
      return `You are looking for a ${matchedSkill}, but we currently have no verified artisans registered in ${matchedLocation || 'that specific area'}. Please consider checking nearby areas such as Nsukka or Enugu.`;
    }
  }

  // General help fallback
  if (isPidgin) {
    return "I hear you! Abeg tell me the exact work wey spoil (e.g. 'I need electrician for Nsukka' or 'Plumber for Enugu pipe leak') make I bring out verified workers for you sharp-sharp.";
  } else {
    return "I am here to help. Please mention the specific service you need and your city (e.g., 'Find a plumber in Nsukka' or 'Electrician in Enugu') so I can recommend verified professionals.";
  }
}

/**
 * POST /api/chat/message
 * Handles chatbot queries using Google Gemini AI + Supabase worker search + multi-lingual fallback
 */
exports.handleChatMessage = async (req, res) => {
  try {
    const { message, language = "pidgin", history = [] } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        reply:
          language === "pidgin"
            ? "Abeg type wetin you need make I assist you!"
            : "Please enter a message so I can assist you.",
      });
    }

    const isPidgin = language.toLowerCase() === "pidgin";

    // Handle greetings without searching for workers
    const greetingMessage = message.trim().toLowerCase();

    const isGreeting =
      /^(hi|hello|hey|hey there|hi there|good morning|good afternoon|good evening|how are you|how are you doing|what's up|whats up|how far|how you dey|sup)[.!?,\s]*$/i.test(
        greetingMessage,
      );

    if (isGreeting) {
      return res.json({
        success: true,
        reply: isPidgin
          ? "Hello! 😊 Welcome to WorkConnect. How I fit help you today?"
          : "Hello! 😊 Welcome to WorkConnect. How can I help you today?",
        matchedSkill: null,
        matchedLocation: null,
        workers: [],
      });
    }

    // First, use the existing keyword matching as a fallback
    let { matchedSkill, matchedLocation } = extractKeywords(message);

    // Then allow Gemini to understand the customer's actual request
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        const prompt = `
You are an intelligent service-request detector for WorkConnect.

Read the customer's conversation and identify:
1. The profession or service they need.
2. Their requested location.

AVAILABLE PROFESSIONS:
${JSON.stringify(KNOWN_SKILLS)}

PREVIOUS CONVERSATION:
${JSON.stringify(Array.isArray(history) ? history.slice(-10) : [])}

LATEST MESSAGE:
${message}

RULES:
- Understand descriptions of problems, not just profession names.
- Use previous messages to understand follow-up questions.
- If the customer changes their location, use the new location.
- If the customer has not mentioned a profession, return null for skill.
- If the customer has not mentioned a location, return null for location.
- Only select a profession from the AVAILABLE PROFESSIONS list.
- Do not assume a location that the customer has not provided.

Return ONLY valid JSON in this exact format:
{
  "skill": "plumber",
  "location": "Nsukka"
}

Use null when either value is unknown.
`;

        const result = await model.generateContent(prompt);
        const responseText = (await result.response).text();

        const detected = JSON.parse(responseText);

        // Accept only professions supported by WorkConnect
        if (
          typeof detected.skill === "string" &&
          KNOWN_SKILLS.includes(detected.skill.toLowerCase())
        ) {
          matchedSkill = detected.skill.toLowerCase();
        } else if (detected.skill === null) {
          matchedSkill = null;
        }

        // Accept a location only when Gemini returns a valid string
        if (typeof detected.location === "string" && detected.location.trim()) {
          matchedLocation = detected.location.trim().slice(0, 80);
        } else if (detected.location === null) {
          matchedLocation = null;
        }
      } catch (error) {
        console.warn("Gemini intent detection notice:", error.message);
      }
    }

    // 1. Fetch matching workers from Supabase (ONLY verified & non-banned workers)

    // 1. Search for workers only when profession AND location are known
    let matchedWorkers = [];

    if (matchedSkill && matchedLocation) {
      try {
        const { data: workers, error: dbError } = await supabase
          .from("workers")
          .select("*")
          .eq("verified", true)
          .neq("banned", true)
          .ilike("skill", `%${matchedSkill}%`)
          .ilike("location", `%${matchedLocation}%`)
          .limit(6);

        if (dbError) {
          console.warn("Supabase worker query notice:", dbError.message);
        } else if (workers) {
          matchedWorkers = workers;
        }
      } catch (dbErr) {
        console.warn("Supabase worker query notice:", dbErr.message);
      }
    }

    // 2. Generate response using Google Gemini AI

    let aiReply = "";

    // Keep only the last 10 conversation messages
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
        });

        const prompt = `
You are WorkConnect AI, a friendly and helpful Nigerian assistant.

Your job is to help customers find skilled artisans on WorkConnect.

LANGUAGE:
${isPidgin ? "Reply in natural Nigerian Pidgin English." : "Reply in friendly Standard English."}

PREVIOUS CONVERSATION:
${JSON.stringify(recentHistory)}

LATEST CUSTOMER MESSAGE:
${message}

DATABASE SEARCH RESULTS:

${JSON.stringify(
  matchedWorkers.map((worker) => ({
    id: worker.id,
    name: worker.name,
    skill: worker.skill || worker.profession,
    location: worker.location,
    rating: worker.rating,
    reviews: worker.reviews,
  })),
  null,
  2,
)}

INSTRUCTIONS:
1. Understand the latest message using the previous conversation for context.
2. If the customer is just greeting you, greet them naturally.
3. If the customer has not explained what service they need, politely ask.
4. If a profession is detected but the location is missing, ask for their location.
5. If verified workers were found, invite the customer to view the worker cards below.
6. If no workers were found, explain this honestly and ask whether they would like to try another location.
7. Only discuss workers included in the DATABASE SEARCH RESULTS.
8. Never invent worker names, ratings, prices, locations, or availability.
9. Never claim that a worker was found unless the database search confirms it.
10. Do not generate worker cards or repeat worker details unnecessarily. The frontend displays the cards.
11. If workers were found, explain briefly that the customer can view their profiles below.

Your response:
    `.trim();

        const result = await model.generateContent(prompt);
        aiReply = (await result.response).text().trim();
      } catch (geminiError) {
        console.warn("Gemini API call notice:", geminiError.message);
      }
    }

    // 3. Use the existing conversational fallback if Gemini fails
    if (!aiReply) {
      aiReply = generateConversationalReply(
        message,
        isPidgin,
        matchedSkill,
        matchedLocation,
        matchedWorkers.length,
      );
    }

    return res.json({
      success: true,
      reply: aiReply,
      matchedSkill,
      matchedLocation,
      workers: matchedWorkers,
    });
  } catch (err) {
    console.error('Server error in handleChatMessage:', err.message);
    res.status(500).json({
      success: false,
      reply: 'An error occurred while processing your request. Please try again.',
      workers: []
    });
  }
};

/**
 * GET /api/chat/history
 * Fetches user's saved chat sessions from Supabase
 */
exports.getChatHistory = async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch {
        // guest or expired
      }
    }

    let query = supabase.from('chat_conversations').select('*').order('updated_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null).limit(10);
    }

    const { data, error } = await query;

    if (error) {
      // Table might not exist yet in Supabase
      console.warn('Chat history fetch notice:', error.message);
      return res.json({ success: true, conversations: [] });
    }

    res.json({
      success: true,
      conversations: data || []
    });
  } catch (err) {
    console.warn('Chat history error:', err.message);
    res.json({ success: true, conversations: [] });
  }
};

/**
 * POST /api/chat/history
 * Saves or updates a conversation in Supabase
 */
exports.saveChatHistory = async (req, res) => {
  try {
    const { id, title = 'New Chat', messages = [], language = 'pidgin' } = req.body;
    const token = req.cookies[COOKIE_NAME];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch {
        // guest
      }
    }

    // Try to update existing or insert new
    if (id && typeof id === 'number') {
      const { data: updated, error: updateErr } = await supabase
        .from('chat_conversations')
        .update({
          title,
          messages,
          language,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .maybeSingle();

      if (!updateErr && updated) {
        return res.json({ success: true, conversation: updated });
      }
    }

    // Insert new
    const { data: newChat, error: insertErr } = await supabase
      .from('chat_conversations')
      .insert([
        {
          user_id: userId,
          title,
          messages,
          language,
        }
      ])
      .select()
      .maybeSingle();

    if (insertErr) {
      console.warn('Chat save notice:', insertErr.message);
      return res.json({ success: true, saved: false, message: insertErr.message });
    }

    res.json({ success: true, conversation: newChat });
  } catch (err) {
    console.warn('Save chat history error:', err.message);
    res.json({ success: true, saved: false });
  }
};

/**
 * DELETE /api/chat/history/:id
 */
exports.deleteChatHistory = async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('chat_conversations').delete().eq('id', id);
    res.json({ success: true, message: 'Chat deleted.' });
  } catch (err) {
    res.json({ success: true });
  }
};
