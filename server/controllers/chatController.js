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
  const lower = text.toLowerCase();
  let matchedSkill = null;
  let matchedLocation = null;

  for (const skill of KNOWN_SKILLS) {
    if (lower.includes(skill)) {
      matchedSkill = skill;
      break;
    }
  }

  // Handle common colloquial variations
  if (!matchedSkill) {
    if (lower.includes('light') || lower.includes('nepa') || lower.includes('wire') || lower.includes('spark') || lower.includes('current')) matchedSkill = 'electrician';
    else if (lower.includes('water') || lower.includes('tap') || lower.includes('pipe') || lower.includes('leak') || lower.includes('drain')) matchedSkill = 'plumber';
    else if (lower.includes('wood') || lower.includes('chair') || lower.includes('table') || lower.includes('roof') || lower.includes('door') || lower.includes('bed')) matchedSkill = 'carpenter';
    else if (lower.includes('cloth') || lower.includes('sew') || lower.includes('dress') || lower.includes('native') || lower.includes('agbada') || lower.includes('senator')) matchedSkill = 'tailor';
    else if (lower.includes('car') || lower.includes('motor') || lower.includes('engine') || lower.includes('brake') || lower.includes('gear')) matchedSkill = 'mechanic';
    else if (lower.includes('paint') || lower.includes('wall') || lower.includes('color')) matchedSkill = 'painter';
    else if (lower.includes('hair') || lower.includes('braid') || lower.includes('barber') || lower.includes('wig')) matchedSkill = 'hairdresser';
    else if (lower.includes('iron') || lower.includes('gate') || lower.includes('weld')) matchedSkill = 'welder';
    else if (lower.includes('block') || lower.includes('cement') || lower.includes('mason')) matchedSkill = 'bricklayer';
  }

  for (const loc of KNOWN_LOCATIONS) {
    if (lower.includes(loc)) {
      matchedLocation = loc;
      break;
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
    const { message, language = 'pidgin' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        reply: language === 'pidgin'
          ? 'Abeg type wetin you need make I assist you!'
          : 'Please enter a message so I can assist you.'
      });
    }

    const isPidgin = language.toLowerCase() === 'pidgin';
    const { matchedSkill, matchedLocation } = extractKeywords(message);

    // 1. Fetch matching workers from Supabase (ONLY verified & non-banned workers)
    let matchedWorkers = [];
    try {
      let query = supabase.from('workers').select('*').eq('verified', true).neq('banned', true);

      if (matchedSkill) {
        query = query.ilike('skill', `%${matchedSkill}%`);
      }
      if (matchedLocation) {
        query = query.ilike('location', `%${matchedLocation}%`);
      }

      const { data: workers, error: dbError } = await query.limit(6);
      if (!dbError && workers && workers.length > 0) {
        matchedWorkers = workers;
      } else if (matchedSkill) {
        // Fallback: search just by skill if location specific didn't return any
        const { data: fallbackWorkers } = await supabase
          .from('workers')
          .select('*')
          .eq('verified', true)
          .neq('banned', true)
          .ilike('skill', `%${matchedSkill}%`)
          .limit(4);
        if (fallbackWorkers) matchedWorkers = fallbackWorkers;
      }
    } catch (dbErr) {
      console.warn('Supabase worker query notice:', dbErr.message);
    }

    // 2. Generate response using Google Gemini AI (if valid API key configured)
    let aiReply = '';

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are WorkConnect AI, a smart, friendly Nigerian assistant for WorkConnect (connecting users with verified local artisans).

User language: ${isPidgin ? 'Nigerian Pidgin English (e.g., "How far", "I don find", "No wahala")' : 'Standard English'}.
User message: "${message}"

Artisans in database: ${matchedWorkers.length > 0 ? `${matchedWorkers.length} verified artisan(s) found in database` : 'None directly found'}.

Instructions:
1. Respond ${isPidgin ? 'strictly in natural Nigerian Pidgin English' : 'in friendly, professional Standard English'}.
2. Keep response to 2 sentences maximum.
3. If artisans were found, invite user to check the profile cards below.
4. If not found, tell user to mention their trade (plumber, electrician, etc.) and town.
5. Do not write names in markdown list; cards appear below.
        `.trim();

        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiReply = response.text().trim();
      } catch (geminiError) {
        console.warn('Gemini API call notice, falling back to conversational generator:', geminiError.message);
      }
    }

    // 3. Robust multi-lingual conversational reply if Gemini wasn't called or failed
    if (!aiReply) {
      aiReply = generateConversationalReply(
        message,
        isPidgin,
        matchedSkill,
        matchedLocation,
        matchedWorkers.length
      );
    }

    return res.json({
      success: true,
      reply: aiReply,
      matchedSkill,
      matchedLocation,
      workers: matchedWorkers
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
