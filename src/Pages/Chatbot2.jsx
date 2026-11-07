import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../utils/auth";

// Local image imports from assets
import plumberImage from "../assets/plumber.jpg";
import electricianImage from "../assets/worker-profile.jpg";
import carpenterImage from "../assets/carpenter.webp";
import mechanicImage from "../assets/mechanic.jpeg";
import hairdresserImage from "../assets/hairdresser.jpeg";
import painterImage from "../assets/painter.jpg";
import electricalInstallationImage from "../assets/electrical-installation.jpeg";
import electricianWorkImage from "../assets/electrician-work.jpeg";
import interiorLightingImage from "../assets/interior-lighting.jpeg";
import wallLightImage from "../assets/wall-light.jpeg";

// Default comprehensive list of verified workers
const DEFAULT_WORKERS = [
  {
    id: 1,
    name: "Ben Okafor",
    skill: "Electrician",
    profession: "Electrician",
    location: "Nsukka",
    rating: "4.8",
    reviews: 24,
    phone: "+234 803 123 4567",
    verified: true,
    available: true,
    image: electricianImage,
  },
  {
    id: 2,
    name: "Michael Udo",
    skill: "Plumber",
    profession: "Plumber",
    location: "Nsukka",
    rating: "4.7",
    reviews: 18,
    phone: "+234 802 987 6543",
    verified: true,
    available: true,
    image: plumberImage,
  },
  {
    id: 3,
    name: "David Eze",
    skill: "Carpenter",
    profession: "Carpenter",
    location: "Enugu",
    rating: "4.9",
    reviews: 31,
    phone: "+234 814 555 0192",
    verified: true,
    available: true,
    image: carpenterImage,
  },
  {
    id: 4,
    name: "Samuel Obi",
    skill: "Painter",
    profession: "Painter",
    location: "Nsukka",
    rating: "4.6",
    reviews: 15,
    phone: "+234 806 777 8899",
    verified: true,
    available: true,
    image: painterImage,
  },
  {
    id: 5,
    name: "Emmanuel Ikechukwu",
    skill: "Mechanic",
    profession: "Mechanic",
    location: "Enugu",
    rating: "4.8",
    reviews: 22,
    phone: "+234 818 333 4455",
    verified: true,
    available: true,
    image: mechanicImage,
  },
  {
    id: 6,
    name: "Chidera Nwosu",
    skill: "Hairdresser",
    profession: "Hairdresser",
    location: "Nsukka",
    rating: "4.7",
    reviews: 19,
    phone: "+234 805 222 1100",
    verified: true,
    available: true,
    image: hairdresserImage,
  },
  {
    id: 7,
    name: "Blessing Aliyu",
    skill: "Tailor",
    profession: "Tailor",
    location: "Enugu",
    rating: "4.9",
    reviews: 27,
    phone: "+234 812 444 7788",
    verified: true,
    available: true,
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 8,
    name: "Ibrahim Danjuma",
    skill: "Welder",
    profession: "Welder",
    location: "Nsukka",
    rating: "4.7",
    reviews: 14,
    phone: "+234 807 888 9911",
    verified: true,
    available: true,
    image: "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: 9,
    name: "Kelechi Okon",
    skill: "Bricklayer",
    profession: "Bricklayer",
    location: "Enugu",
    rating: "4.6",
    reviews: 12,
    phone: "+234 810 999 0022",
    verified: true,
    available: true,
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=500&q=80",
  },
];

// Rich multi-dialect dictionary for Nigerian professions and intent
const SKILL_MAP = {
  plumber: [
    "plumber",
    "pipe",
    "water",
    "leak",
    "leaking",
    "tap",
    "toilet",
    "pump",
    "paipu",
    "bututu",
    "famfo",
    "pọmba",
    "sink",
    "drain",
    "burst",
  ],
  electrician: [
    "electrician",
    "electric",
    "light",
    "wire",
    "wiring",
    "nepa",
    "socket",
    "bulb",
    "ọkụ",
    "wuta",
    "ina",
    "generator",
    "current",
    "spark",
    "switch",
    "fuse",
  ],
  carpenter: [
    "carpenter",
    "wood",
    "furniture",
    "chair",
    "table",
    "door",
    "bed",
    "cabinet",
    "wardrobe",
    "kafunta",
    "katako",
    "shelf",
    "roof",
  ],
  tailor: [
    "tailor",
    "fashion",
    "sew",
    "cloth",
    "clothes",
    "dress",
    "designer",
    "tela",
    "riga",
    "akwa",
    "native",
    "agbada",
    "senator",
    "suit",
    "alteration",
  ],
  mechanic: [
    "mechanic",
    "car",
    "engine",
    "motor",
    "vehicle",
    "keke",
    "makaniki",
    "brake",
    "oil",
    "radiator",
    "gear",
    "auto",
  ],
  painter: [
    "painter",
    "paint",
    "fenti",
    "wall",
    "brush",
    "color",
    "distemper",
  ],
  hairdresser: [
    "hairdresser",
    "hair",
    "salon",
    "braid",
    "plait",
    "wig",
    "styling",
    "weaves",
  ],
  barber: [
    "barber",
    "cut",
    "haircut",
    "shave",
    "beard",
    "wanzami",
    "asuwata",
    "fade",
  ],
  bricklayer: [
    "bricklayer",
    "block",
    "build",
    "mason",
    "cement",
    "foundation",
    "plaster",
  ],
  welder: [
    "welder",
    "weld",
    "iron",
    "metal",
    "gate",
    "burglary",
    "tank",
  ],
};

const LOCATIONS = [
  "nsukka",
  "enugu",
  "lagos",
  "abuja",
  "onitsha",
  "awka",
  "abakpa",
  "ogbete",
  "ikeja",
  "lekki",
  "yaba",
  "surulere",
  "portharcourt",
  "port harcourt",
  "ibadan",
  "owerri",
  "asaba",
  "benin",
  "kano",
  "calabar",
  "uyo",
];

function extractIntent(text, workers) {
  const lower = text.toLowerCase();
  let skill = null;
  let location = null;

  
  const dynamicSkills = [
    ...new Set(
      workers.map((w) => (w.skill || w.profession || "").toLowerCase()).filter(Boolean),
    ),
  ];
  dynamicSkills.sort((a, b) => b.length - a.length);

  for (const s of dynamicSkills) {
    if (lower.includes(s)) {
      skill = s;
      break;
    }
  }


  if (!skill) {
    for (const [mainSkill, keywords] of Object.entries(SKILL_MAP)) {
      if (keywords.some((k) => lower.includes(k))) {
        skill = mainSkill;
        break;
      }
    }
  }

  
  for (const loc of LOCATIONS) {
    if (lower.includes(loc)) {
      location = loc;
      break;
    }
  }

  return { skill, location };
}



const SUGGESTIONS = [
  {
    id: "plumber",
    pidgin: "Find plumber to fix leaking pipe or tap",
    english: "Find a plumber for leaking pipes or tap repairs",
    promptPidgin: "I need verified plumber for pipe and tap repair",
    promptEnglish: "I need a verified plumber for plumbing and pipe repairs",
  },
  {
    id: "electrician",
    pidgin: "Find electrician for NEPA wire or socket issue",
    english: "Hire an electrician for wiring & lighting faults",
    promptPidgin: "I dey look for reliable electrician for wire work",
    promptEnglish: "I am looking for a qualified electrician for electrical work",
  },
  {
    id: "carpenter",
    pidgin: "Find carpenter to make chair, bed or door",
    english: "Find a carpenter for furniture & door repairs",
    promptPidgin: "I need good carpenter for clean woodwork",
    promptEnglish: "I need an experienced carpenter for furniture and woodwork",
  },
  {
    id: "tailor",
    pidgin: "Find tailor to sew native wear or alter cloth",
    english: "Get a tailor for custom sewing & alterations",
    promptPidgin: "I need sharp tailor to sew native wear",
    promptEnglish: "I need a professional tailor for custom clothing",
  },
];



let idSequence = 1000;
function createUniqueId() {
  idSequence += 1;
  return idSequence;
}

function getFormattedTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Chatbot2({ workers: propWorkers = [] }) {
  const navigate = useNavigate();

  // Language preference stored in component state only (not localStorage)
  const [language, setLanguage] = useState("pidgin");

  // Current user — fetched from server session, not localStorage
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("User");

  // Workers — fetched from backend API, not localStorage
  const [allWorkers, setAllWorkers] = useState(propWorkers.length > 0 ? propWorkers : []);

  
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== "undefined" ? window.innerWidth < 768 : false;
  });

  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== "undefined" ? window.innerWidth >= 768 : true;
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

 
  const [chats, setChats] = useState([
    {
      id: 1,
      title: "New Chat",
      createdAt: "Today",
      messages: [],
    },
  ]);

  const [activeChatId, setActiveChatId] = useState(1);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [workerReviews, setWorkerReviews] = useState([]);
  const [loadingWorkerDetails, setLoadingWorkerDetails] = useState(false);

  // In-Chatbot Report Worker Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("Unprofessional or Abusive Behavior");
  const [reportDetails, setReportDetails] = useState("");
  const [reportName, setReportName] = useState("");
  const [reportPhone, setReportPhone] = useState("");
  const [reportEmail, setReportEmail] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportNotice, setReportNotice] = useState("");

  // In-Chatbot Review Submission State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load current user from session and workers + chat history from backend database
  useEffect(() => {
    async function loadInitialData() {
      // 1. Get current user from server session (cookie)
      const user = await getCurrentUser();
      if (user) {
        setUserName(user.name || "User");
        if (user.role?.toLowerCase() === "artisan") {
          try {
            const wRes = await fetch("http://localhost:5000/api/workers?all=true", { credentials: "include" });
            const wData = await wRes.json();
            const myW = (wData.workers || []).find((w) => w.user_id === user.id || String(w.user_id) === String(user.id));
            if (myW && myW.verified === true) {
              setUserRole("Verified Artisan");
            } else {
              setUserRole("Pending Artisan");
            }
          } catch {
            setUserRole("Pending Artisan");
          }
        } else {
          setUserRole("Customer");
        }
      }

      // 2. Fetch workers from backend database
      try {
        const res = await fetch("http://localhost:5000/api/workers", {
          credentials: "include",
        });
        const data = await res.json();
        const workerList = data.workers || data.data || [];
        if (workerList.length > 0) {
          setAllWorkers(workerList);
        }
      } catch (err) {
        console.error("Failed to load workers from database:", err);
      }

      // 3. Fetch user's persistent chat conversations from database
      try {
        const histRes = await fetch("http://localhost:5000/api/chat/history", {
          credentials: "include",
        });
        const histData = await histRes.json();
        if (histData.success && Array.isArray(histData.conversations) && histData.conversations.length > 0) {
          const loaded = histData.conversations.map((c) => ({
            id: c.id,
            title: c.title || "Previous Chat",
            createdAt: c.created_at ? new Date(c.created_at).toLocaleDateString() : "Saved",
            messages: Array.isArray(c.messages) ? c.messages : [],
          }));
          setChats(loaded);
          setActiveChatId(loaded[0].id);
        }
      } catch (err) {
        console.warn("Could not load chat history from database:", err.message);
      }
    }

    loadInitialData();
  }, []);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
  };

 
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, isTyping]);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const hasUserMessages = (activeChat?.messages || []).length > 0;

  
  const handleSelectWorker = async (worker) => {
    setSelectedWorker(worker);
    setWorkerReviews([]);
    setReviewComment("");
    setReviewRating(5);
    setReviewMessage("");
    setReviewError("");
    if (!worker?.id) return;
    try {
      setLoadingWorkerDetails(true);
      const res = await fetch(`http://localhost:5000/api/workers/${worker.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setSelectedWorker(data.data);
      }
      const revRes = await fetch(`http://localhost:5000/api/workers/${worker.id}/reviews`);
      const revData = await revRes.json();
      if (revData.success && Array.isArray(revData.reviews)) {
        setWorkerReviews(revData.reviews);
      } else {
        setWorkerReviews([]);
      }
    } catch (e) {
      console.warn("Could not load worker details:", e);
      setWorkerReviews([]);
    } finally {
      setLoadingWorkerDetails(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWorker?.id || !reviewComment.trim()) return;
    try {
      setSubmittingReview(true);
      setReviewError("");
      setReviewMessage("");
      const res = await fetch(`http://localhost:5000/api/workers/${selectedWorker.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          user_name: userName && userName !== "User" ? userName : "Customer",
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        setWorkerReviews((prev) => [data.review, ...prev]);
        setReviewComment("");
        setReviewRating(5);
        setReviewMessage("Thank you! Your review has been published.");
        // Refresh worker profile details for updated rating and count
        const refRes = await fetch(`http://localhost:5000/api/workers/${selectedWorker.id}`);
        const refData = await refRes.json();
        if (refData.success && refData.data) {
          setSelectedWorker(refData.data);
        }
      } else {
        setReviewError(data.message || "Could not save review.");
      }
    } catch (err) {
      console.error("Review submission error:", err);
      setReviewError("Network error submitting review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const persistChat = async (chatId, title, messages) => {
    try {
      await fetch("http://localhost:5000/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: chatId,
          title,
          messages,
          language,
        }),
      });
    } catch (e) {
      console.warn("Chat persistence error:", e);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason || !reportDetails.trim()) {
      alert("Please select a reason and describe the issue.");
      return;
    }

    try {
      setSubmittingReport(true);
      const res = await fetch("http://localhost:5000/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          worker_id: selectedWorker?.id,
          reporter_name: reportName.trim() || userName || "Anonymous Customer",
          reporter_phone: reportPhone.trim(),
          reporter_email: reportEmail.trim(),
          reason: reportReason,
          details: reportDetails.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReportNotice("Report submitted! WorkConnect admin has been notified.");
        setTimeout(() => {
          setShowReportModal(false);
          setReportNotice("");
          setReportDetails("");
        }, 2200);
      } else {
        alert(data.message || "Failed to submit report.");
      }
    } catch (err) {
      alert("Network error. Please make sure the backend server is running.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleNewChat = () => {
    const newChat = {
      id: createUniqueId(),
      title: "New Chat",
      createdAt: "Just now",
      messages: [],
    };
    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    try {
      fetch(`http://localhost:5000/api/chat/history/${chatId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch (err) {}

    if (chats.length <= 1) {
      handleNewChat();
      return;
    }
    const filtered = chats.filter((c) => c.id !== chatId);
    setChats(filtered);
    if (activeChatId === chatId) {
      setActiveChatId(filtered[0].id);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const executeSearch = async (queryText) => {
    const textToSend = queryText.trim();
    if (!textToSend) return;

    const userMsgId = createUniqueId();
    const newUserMsg = {
      id: userMsgId,
      from: "user",
      text: textToSend,
      timestamp: getFormattedTime(),
    };

    const chatTitle =
      activeChat.title === "New Chat" ||
      activeChat.title === "New Search"
        ? textToSend.length > 24
          ? textToSend.slice(0, 24) + "..."
          : textToSend
        : activeChat.title;

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              title: chatTitle,
              messages: [...c.messages, newUserMsg],
            }
          : c,
      ),
    );
    setInput("");
    setIsTyping(true);

    try {
      // 1. Query Gemini AI backend with Supabase database matching
      const res = await fetch("http://localhost:5000/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: textToSend,
          language,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const botMsg = {
          id: createUniqueId(),
          from: "bot",
          text: data.reply,
          workers: data.workers || [],
          skill: data.matchedSkill,
          location: data.matchedLocation,
          timestamp: getFormattedTime(),
        };

        const updatedMessages = [...(activeChat.messages || []), newUserMsg, botMsg];

        setChats((prev) =>
          prev.map((c) =>
            c.id === activeChatId
              ? { ...c, title: chatTitle, messages: updatedMessages }
              : c,
          ),
        );
        setIsTyping(false);

        // Persist to database
        persistChat(activeChatId, chatTitle, updatedMessages);
        return;
      }
    } catch (err) {
      console.warn("Backend chat request failed, falling back to local search:", err);
    }

    // 2. Fallback to local matching if backend API is unavailable
    const { skill, location } = extractIntent(textToSend, allWorkers);

    let results = [];
    if (skill) {
      results = allWorkers.filter((w) => {
        const wSkill = (w.skill || w.profession || "").toLowerCase();
        const wLoc = (w.location || w.address || "").toLowerCase();
        const matchesSkill = wSkill.includes(skill);
        const matchesLocation = location ? wLoc.includes(location) : true;
        return matchesSkill && matchesLocation;
      });

      if (results.length === 0 && location) {
        results = allWorkers.filter((w) => {
          const wSkill = (w.skill || w.profession || "").toLowerCase();
          return wSkill.includes(skill);
        });
      }
    }

    let botResponseText;
    if (language === "pidgin") {
      if (results.length > 0) {
        const locText = location ? ` for ${location.toUpperCase()}` : "";
        botResponseText = `E don set! 🎉 I don find ${results.length} verified ${skill || "worker"}${locText} wey fit help you. Check their details below:`;
      } else if (skill) {
        botResponseText = `Chai, I no see any verified ${skill} for ${location || "this area"} right now. You fit check nearby places like Enugu or Nsukka!`;
      } else {
        botResponseText = `I never quite grab the work wey you need. Try ask: "I need plumber for Nsukka" or "Electrician for Enugu" or tap any suggestion above!`;
      }
    } else {
      if (results.length > 0) {
        const locText = location ? ` in ${location.toUpperCase()}` : "";
        botResponseText = `Here are ${results.length} verified ${skill || "worker"}(s)${locText} available to help you. Review their details below:`;
      } else if (skill) {
        botResponseText = `Sorry, no verified ${skill} was found in ${location || "this location"}. Try searching for nearby areas or another trade.`;
      } else {
        botResponseText = `I couldn't identify the specific worker service you need. Try asking like: "Find a plumber in Nsukka" or select a suggestion above.`;
      }
    }

    const botMsg = {
      id: createUniqueId(),
      from: "bot",
      text: botResponseText,
      workers: results,
      skill,
      location,
      timestamp: getFormattedTime(),
    };

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              messages: [...c.messages, botMsg],
            }
          : c,
      ),
    );
    setIsTyping(false);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    executeSearch(input);
  };

  const handleSuggestionClick = (tab) => {
    const prompt = language === "pidgin" ? tab.promptPidgin : tab.promptEnglish;
    executeSearch(prompt);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#ffffff", 
        color: "#1f2937",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
    

      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(2px)",
            zIndex: 45,
          }}
        />
      )}

     
      <aside
        style={{
          width: "280px",
          maxWidth: "82vw",
          backgroundColor: "#ff6a00",
          borderRight: "1px solid #ea580c",
          display: "flex",
          flexDirection: "column",
          transition: isMobile
            ? "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
            : "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          zIndex: 50,
          position: isMobile ? "fixed" : "relative",
          top: 0,
          bottom: 0,
          left: 0,
          transform: isMobile
            ? isSidebarOpen
              ? "translateX(0)"
              : "translateX(-100%)"
            : "none",
          ...(isMobile
            ? {}
            : {
                width: isSidebarOpen ? "280px" : "0px",
                minWidth: isSidebarOpen ? "280px" : "0px",
              }),
        }}
      >
       

        <div
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "34px",
                height: "34px",
                borderRadius: "10px",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ff6a00",
                fontWeight: "800",
                fontSize: "17px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              }}
            >
              W
            </div>
            <div>
              <div
                style={{
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: "15px",
                  letterSpacing: "-0.2px",
                }}
              >
                WorkConnect <span style={{ color: "#fff0e6" }}>AI</span>
              </div>
              <div style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "11px" }}>
                Artisan Assistant
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            title="Collapse Sidebar"
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.85)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#ffffff")}
            onMouseOut={(e) =>
              (e.currentTarget.style.color = "rgba(255, 255, 255, 0.85)")
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
            </svg>
          </button>
        </div>

        

        <div style={{ padding: "14px 14px 8px" }}>
          <button
            onClick={handleNewChat}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "11px 14px",
              borderRadius: "10px",
              background: "#ffffff",
              color: "#ea580c",
              border: "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "14px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.12)",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#fff7ed")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#ffffff")}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Start New Chat</span>
          </button>
        </div>

        

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "10px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "3px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "6px 8px",
              color: "rgba(255, 255, 255, 0.75)",
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            <span>Recent Chats</span>
            <span style={{ fontSize: "10px", opacity: 0.9 }}>{chats.length}</span>
          </div>

          {chats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <div
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "9px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: isActive
                    ? "rgba(255, 255, 255, 0.25)"
                    : "transparent",
                  color: "#ffffff",
                  border: isActive
                    ? "1px solid rgba(255, 255, 255, 0.45)"
                    : "1px solid transparent",
                  transition: "all 0.15s ease",
                  fontSize: "13px",
                  fontWeight: isActive ? "700" : "500",
                }}
                onMouseOver={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.15)";
                }}
                onMouseOut={(e) => {
                  if (!isActive)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ flexShrink: 0, opacity: 0.9 }}
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chat.title}
                  </span>
                </div>

                {chats.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    title="Delete chat"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.7)",
                      cursor: "pointer",
                      padding: "2px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#ffffff")}
                    onMouseOut={(e) =>
                      (e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)")
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid rgba(255, 255, 255, 0.2)",
            backgroundColor: "rgba(0, 0, 0, 0.08)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "#ffffff",
              color: "#ea580c",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "13px",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
              flexShrink: 0,
            }}
          >
            {userName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "CV"}
          </div>

          <div style={{ lineHeight: "1.25", flex: 1, minWidth: 0 }}>
            <div
              style={{
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userName}
            </div>
            <div
              style={{
                color: "rgba(255, 255, 255, 0.85)",
                fontSize: "11px",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                marginTop: "2px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                  display: "inline-block",
                }}
              />
              {userRole}
            </div>
          </div>
        </div>
      </aside>

      

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff", 
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {selectedWorker ? (
         
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 60,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              overflow: "hidden",
              backgroundColor: "#f8fafc",
            }}
          >
            

            <header
              style={{
                height: "60px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: isMobile ? "0 12px" : "0 20px",
                zIndex: 10,
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setSelectedWorker(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#f1f5f9",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: isMobile ? "6px 10px" : "7px 14px",
                  color: "#0f172a",
                  fontSize: isMobile ? "12px" : "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#ff6a00";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.borderColor = "#ff6a00";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.color = "#0f172a";
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                <span>Back</span>
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    color: "#0f172a",
                    fontWeight: "700",
                    fontSize: isMobile ? "13px" : "14px",
                    maxWidth: isMobile ? "140px" : "none",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedWorker.name}
                </span>
                {selectedWorker.banned ? (
                  <span
                    style={{
                      backgroundColor: "#fee2e2",
                      color: "#b91c1c",
                      padding: "2px 7px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    🚫 Suspended
                  </span>
                ) : selectedWorker.verified ? (
                  <span
                    style={{
                      backgroundColor: "#dcfce7",
                      color: "#16a34a",
                      padding: "2px 7px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    ✓ Verified
                  </span>
                ) : (
                  <span
                    style={{
                      backgroundColor: "#fef3c7",
                      color: "#b45309",
                      padding: "2px 7px",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "700",
                    }}
                  >
                    ⏳ Pending
                  </span>
                )}
              </div>
            </header>

          

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: isMobile ? "14px 12px 30px" : "24px 20px",
              }}
            >
              <div
                style={{
                  maxWidth: "800px",
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: isMobile ? "14px" : "20px",
                }}
              >
                

                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                  }}
                >
                 

                  <div
                    style={{
                      height: isMobile ? "90px" : "120px",
                      background:
                        "linear-gradient(135deg, #ff6a00 0%, #ff8c00 100%)",
                    }}
                  />

                  

                  <div
                    style={{
                      padding: isMobile ? "0 16px 18px" : "0 24px 24px",
                      marginTop: isMobile ? "-40px" : "-50px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "12px",
                        marginBottom: "14px",
                      }}
                    >
                      {selectedWorker.image || selectedWorker.photo ? (
                        <img
                          src={selectedWorker.image || selectedWorker.photo}
                          alt={selectedWorker.name}
                          style={{
                            width: isMobile ? "76px" : "96px",
                            height: isMobile ? "76px" : "96px",
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "4px solid #ffffff",
                            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                            backgroundColor: "#f1f5f9",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: isMobile ? "76px" : "96px",
                            height: isMobile ? "76px" : "96px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #ff8a28, #ed4a08)",
                            color: "#ffffff",
                            fontSize: isMobile ? "28px" : "36px",
                            fontWeight: "800",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "4px solid #ffffff",
                            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.15)",
                            flexShrink: 0,
                          }}
                        >
                          {(selectedWorker.name || "A").charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {!selectedWorker.banned && selectedWorker.phone ? (
                          <a
                            href={`tel:${selectedWorker.phone}`}
                            style={{
                              textDecoration: "none",
                              backgroundColor: "#ff6a00",
                              color: "#ffffff",
                              padding: isMobile ? "8px 14px" : "9px 18px",
                              borderRadius: "10px",
                              fontSize: "12px",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              boxShadow: "0 2px 8px rgba(255, 106, 0, 0.25)",
                            }}
                          >
                            <span>📞</span>
                            <span>Call {selectedWorker.phone}</span>
                          </a>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => setShowReportModal(true)}
                          style={{
                            backgroundColor: "#ffffff",
                            color: "#dc2626",
                            border: "1.5px solid #fca5a5",
                            padding: isMobile ? "8px 12px" : "9px 16px",
                            borderRadius: "10px",
                            fontSize: "12px",
                            fontWeight: "700",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            cursor: "pointer",
                          }}
                        >
                          <span>🚨</span>
                          <span>Report Artisan</span>
                        </button>
                      </div>
                    </div>

                    {selectedWorker.banned && (
                      <div
                        style={{
                          backgroundColor: "#fee2e2",
                          border: "1.5px solid #ef4444",
                          color: "#991b1b",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          marginBottom: "12px",
                          fontSize: "13px",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>🚫</span>
                        <span>This artisan's account has been suspended by administration.</span>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <h1
                          style={{
                            margin: "0 0 4px",
                            fontSize: isMobile ? "20px" : "24px",
                            fontWeight: "800",
                            color: "#0f172a",
                          }}
                        >
                          {selectedWorker.name}
                        </h1>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: isMobile ? "13px" : "14px",
                            fontWeight: "600",
                            color: "#ff6a00",
                          }}
                        >
                          <span>
                            {selectedWorker.skill || selectedWorker.profession}
                          </span>
                          <span style={{ color: "#cbd5e1" }}>•</span>
                          <span style={{ color: "#64748b" }}>
                            📍 {selectedWorker.location}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          backgroundColor: "#fef3c7",
                          color: "#b45309",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontWeight: "700",
                          fontSize: "13px",
                        }}
                      >
                        <span>★</span>
                        <span>
                          {workerReviews.length > 0
                            ? (
                                workerReviews.reduce(
                                  (sum, r) => sum + Number(r.rating || 5),
                                  0
                                ) / workerReviews.length
                              ).toFixed(1)
                            : selectedWorker.rating
                            ? Number(selectedWorker.rating).toFixed(1)
                            : "New"}
                        </span>
                        <span
                          style={{
                            color: "#92400e",
                            fontSize: "11px",
                            fontWeight: "500",
                          }}
                        >
                          ({workerReviews.length} review{workerReviews.length !== 1 ? "s" : ""})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

               

                {/* 2. REAL ARTISAN STATS GRID */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr 1fr"
                      : "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
                      Experience
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: "700", color: "#0f172a", marginTop: "4px" }}>
                      {selectedWorker.experience || "Not specified"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                      Field service experience
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
                      Working Hours
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", marginTop: "4px" }}>
                      {selectedWorker.working_hours || "08:00 – 18:00"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {Array.isArray(selectedWorker.available_days) && selectedWorker.available_days.length > 0
                        ? selectedWorker.available_days.join(", ")
                        : selectedWorker.available_days || "Monday – Saturday"}
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
                      Estimated Rate
                    </div>
                    <div style={{ fontSize: "15px", fontWeight: "700", color: "#ff6a00", marginTop: "4px" }}>
                      {selectedWorker.hourly_rate || "Negotiable"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                      Discuss details before starting
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: "500" }}>
                      Verification Status
                    </div>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: "700",
                        color: selectedWorker.banned ? "#dc2626" : selectedWorker.verified ? "#16a34a" : "#b45309",
                        marginTop: "4px",
                      }}
                    >
                      {selectedWorker.banned
                        ? "Account Suspended"
                        : selectedWorker.verified
                        ? "100% Verified"
                        : "Pending Verification"}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                      {selectedWorker.verified
                        ? "Vetted by WorkConnect Admin"
                        : "Awaiting admin confirmation"}
                    </div>
                  </div>
                </div>

                

                {/* 3. REAL ABOUT ARTISAN */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#0f172a",
                      margin: "0 0 10px",
                    }}
                  >
                    About {selectedWorker.name}
                  </h2>
                  <p
                    style={{
                      margin: "0",
                      fontSize: "14px",
                      lineHeight: "1.7",
                      color: "#475569",
                    }}
                  >
                    {selectedWorker.about && selectedWorker.about.trim()
                      ? selectedWorker.about
                      : "This artisan has not provided a custom bio description yet."}
                  </p>
                </div>

               

                {/* 4. REAL TRADE & LOCATION DETAILS */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#0f172a",
                      margin: "0 0 12px",
                    }}
                  >
                    Trade & Location
                  </h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <span
                      style={{
                        backgroundColor: "#fff7ed",
                        color: "#c2410c",
                        border: "1px solid #fed7aa",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      Trade: {selectedWorker.skill || selectedWorker.profession}
                    </span>
                    <span
                      style={{
                        backgroundColor: "#f0fdf4",
                        color: "#166534",
                        border: "1px solid #bbf7d0",
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      📍 Base Location: {selectedWorker.location}
                    </span>
                    {selectedWorker.phone && (
                      <span
                        style={{
                          backgroundColor: "#f8fafc",
                          color: "#334155",
                          border: "1px solid #e2e8f0",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        📞 Contact: {selectedWorker.phone}
                      </span>
                    )}
                  </div>
                </div>

               

                {/* 5. WORK PORTFOLIO (REAL UPLOADS ONLY) */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#0f172a",
                      margin: "0 0 14px",
                    }}
                  >
                    Portfolio / Past Work
                  </h2>
                  {Array.isArray(selectedWorker.portfolio) &&
                  selectedWorker.portfolio.filter(Boolean).length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile
                          ? "repeat(2, 1fr)"
                          : "repeat(auto-fill, minmax(160px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {selectedWorker.portfolio.filter(Boolean).map((imgUrl, i) => (
                        <div
                          key={i}
                          style={{
                            borderRadius: "10px",
                            overflow: "hidden",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <img
                            src={imgUrl}
                            alt={`${selectedWorker.name} past work ${i + 1}`}
                            style={{
                              width: "100%",
                              height: "120px",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              padding: "6px 8px",
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#334155",
                              textAlign: "center",
                              backgroundColor: "#f8fafc",
                            }}
                          >
                            Work Photo {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        margin: "0",
                        color: "#94a3b8",
                        fontSize: "13px",
                        fontStyle: "italic",
                      }}
                    >
                      No portfolio photos uploaded yet by this artisan.
                    </p>
                  )}
                </div>

               

                {/* 6. REAL CUSTOMER REVIEWS + DROP A REVIEW FORM */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <h2
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#0f172a",
                        margin: "0",
                      }}
                    >
                      Customer Reviews ({workerReviews.length})
                    </h2>
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#16a34a",
                        fontWeight: "700",
                      }}
                    >
                      ★ {workerReviews.length > 0
                          ? (
                              workerReviews.reduce(
                                (sum, r) => sum + Number(r.rating || 5),
                                0
                              ) / workerReviews.length
                            ).toFixed(1)
                          : selectedWorker.rating
                          ? Number(selectedWorker.rating).toFixed(1)
                          : "New"}{" "}
                      Rating
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {workerReviews.length > 0 ? (
                      workerReviews.map((rev, index) => (
                        <div
                          key={rev.id || index}
                          style={{
                            padding: "12px 14px",
                            borderRadius: "10px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "13px",
                                fontWeight: "700",
                                color: "#0f172a",
                              }}
                            >
                              {rev.user_name || "Customer"}
                            </span>
                            <span style={{ color: "#d97706", fontSize: "13px", letterSpacing: "2px" }}>
                              {"★".repeat(Math.max(1, Math.min(5, Math.round(Number(rev.rating) || 5))))}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "13px",
                              color: "#475569",
                              lineHeight: "1.5",
                            }}
                          >
                            "{rev.comment}"
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#94a3b8",
                              marginTop: "4px",
                            }}
                          >
                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString() : "Verified Customer"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ margin: "0", color: "#94a3b8", fontSize: "13px", fontStyle: "italic" }}>
                        No reviews yet for this artisan. Be the first customer to share your experience below!
                      </p>
                    )}
                  </div>

                  {/* IN-CHAT DROP A REVIEW FORM */}
                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "16px",
                      borderTop: "1px dashed #cbd5e1",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 10px",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "#0f172a",
                      }}
                    >
                      ✍️ Leave a Review for {selectedWorker.name}
                    </h3>

                    {reviewMessage && (
                      <div
                        style={{
                          backgroundColor: "#ecfdf5",
                          color: "#065f46",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          marginBottom: "10px",
                        }}
                      >
                        ✓ {reviewMessage}
                      </div>
                    )}

                    {reviewError && (
                      <div
                        style={{
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          fontSize: "12px",
                          marginBottom: "10px",
                        }}
                      >
                        ⚠ {reviewError}
                      </div>
                    )}

                    <form onSubmit={handleReviewSubmit}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: "600" }}>
                          Your Rating:
                        </span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            style={{
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "18px",
                              color: star <= reviewRating ? "#d97706" : "#cbd5e1",
                              padding: 0,
                            }}
                          >
                            ★
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder={`Share your experience with ${selectedWorker.name} (punctuality, workmanship, fair pricing)...`}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          fontSize: "13px",
                          resize: "vertical",
                          boxSizing: "border-box",
                          outline: "none",
                        }}
                        required
                      />

                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
                        <button
                          type="submit"
                          disabled={submittingReview || !reviewComment.trim()}
                          style={{
                            backgroundColor:
                              submittingReview || !reviewComment.trim() ? "#cbd5e1" : "#ff6a00",
                            color: "#ffffff",
                            border: "none",
                            padding: "8px 18px",
                            borderRadius: "8px",
                            fontSize: "13px",
                            fontWeight: "700",
                            cursor:
                              submittingReview || !reviewComment.trim() ? "not-allowed" : "pointer",
                            transition: "background-color 0.15s ease",
                          }}
                        >
                          {submittingReview ? "Submitting…" : "Post Review"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

               

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: "10px 0 24px",
                  }}
                >
                  <button
                    onClick={() => setSelectedWorker(null)}
                    style={{
                      padding: "10px 24px",
                      borderRadius: "10px",
                      backgroundColor: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      color: "#334155",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    ← Return to Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <header
              style={{
                height: "60px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 20px",
                zIndex: 10,
              }}
            >
             

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {!isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    title="Open Sidebar"
                    style={{
                      background: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      color: "#334155",
                      cursor: "pointer",
                      padding: "7px 9px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                  </button>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      backgroundColor: "#16a34a",
                      boxShadow: "0 0 6px #16a34a",
                    }}
                  />
                  <span
                    style={{
                      color: "#0f172a",
                      fontWeight: "600",
                      fontSize: "14px",
                    }}
                  >
                    WorkConnect Assistant
                  </span>
                </div>
              </div>

              

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#f1f5f9",
                    borderRadius: "20px",
                    padding: "3px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                 

                  <button
                    onClick={() => handleLanguageChange("pidgin")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "6px 12px",
                      borderRadius: "16px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: language === "pidgin" ? "700" : "500",
                      cursor: "pointer",
                      backgroundColor:
                        language === "pidgin" ? "#ff6a00" : "transparent",
                      color: language === "pidgin" ? "#ffffff" : "#64748b",
                      transition: "all 0.15s ease",
                      boxShadow:
                        language === "pidgin"
                          ? "0 2px 6px rgba(255, 106, 0, 0.3)"
                          : "none",
                    }}
                  >
                    <span>Pidgin</span>
                    {language === "pidgin" && (
                      <span
                        style={{
                          fontSize: "9px",
                          background: "rgba(255,255,255,0.3)",
                          padding: "1px 4px",
                          borderRadius: "6px",
                        }}
                      >
                        Default
                      </span>
                    )}
                  </button>

                  
                  <button
                    onClick={() => handleLanguageChange("english")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "6px 12px",
                      borderRadius: "16px",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: language === "english" ? "700" : "500",
                      cursor: "pointer",
                      backgroundColor:
                        language === "english" ? "#ff6a00" : "transparent",
                      color: language === "english" ? "#ffffff" : "#64748b",
                      transition: "all 0.15s ease",
                      boxShadow:
                        language === "english"
                          ? "0 2px 6px rgba(255, 106, 0, 0.3)"
                          : "none",
                    }}
                  >
                    <span>English</span>
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    color: "#64748b",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#fef2f2";
                    e.currentTarget.style.borderColor = "#fca5a5";
                    e.currentTarget.style.color = "#dc2626";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#ffffff";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Log out</span>
                </button>
              </div>
            </header>
           
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "800px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  margin: "auto 0",
                }}
              >
                
                {!hasUserMessages && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "20px 0 10px",
                    }}
                  >
                    <h1
                      style={{
                        color: "#0f172a",
                        fontSize: "28px",
                        fontWeight: "700",
                        margin: "0 0 8px",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      Welcome back,{" "}
                      <span style={{ color: "#ff6a00" }}>{userName}</span>!
                    </h1>

                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "16px",
                        margin: "0 0 32px",
                      }}
                    >
                      {language === "pidgin"
                        ? "Which worker you dey look for today?"
                        : "Which worker are you looking for today?"}
                    </p>

                    {/* 4 MINIMAL SUGGESTION CARDS */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "12px",
                        textAlign: "left",
                      }}
                    >
                      {SUGGESTIONS.map((sug) => (
                        <button
                          key={sug.id}
                          onClick={() => handleSuggestionClick(sug)}
                          style={{
                            backgroundColor: "#ffffff",
                            border: "1px solid #e2e8f0",
                            borderRadius: "12px",
                            padding: "14px 16px",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            color: "#334155",
                            fontSize: "14px",
                            fontWeight: "500",
                            lineHeight: "1.4",
                            textAlign: "left",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = "#ff6a00";
                            e.currentTarget.style.backgroundColor = "#fffbf5";
                            e.currentTarget.style.color = "#0f172a";
                            e.currentTarget.style.transform = "translateY(-1px)";
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = "#e2e8f0";
                            e.currentTarget.style.backgroundColor = "#ffffff";
                            e.currentTarget.style.color = "#334155";
                            e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          {language === "pidgin" ? sug.pidgin : sug.english}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MESSAGE STREAM */}
                {activeChat?.messages.map((msg) => {
                  const isUser = msg.from === "user";

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        gap: "12px",
                        justifyContent: isUser ? "flex-end" : "flex-start",
                        width: "100%",
                      }}
                    >
                      {/* Bot Avatar */}
                      {!isUser && (
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "#ff6a00",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "13px",
                            flexShrink: 0,
                          }}
                        >
                          AI
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        style={{
                          maxWidth: isUser ? "75%" : "85%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isUser ? "flex-end" : "flex-start",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: isUser ? "#ff6a00" : "#f8fafc",
                            color: isUser ? "#ffffff" : "#0f172a",
                            border: isUser ? "none" : "1px solid #e2e8f0",
                            padding: "12px 16px",
                            borderRadius: isUser
                              ? "16px 16px 4px 16px"
                              : "16px 16px 16px 4px",
                            fontSize: "14px",
                            lineHeight: "1.6",
                            whiteSpace: "pre-wrap",
                            boxShadow: isUser
                              ? "0 2px 8px rgba(255, 106, 0, 0.25)"
                              : "0 1px 3px rgba(0,0,0,0.03)",
                          }}
                        >
                          {msg.text}
                        </div>

                        <span
                          style={{
                            fontSize: "11px",
                            color: "#94a3b8",
                            marginTop: "4px",
                            padding: "0 4px",
                          }}
                        >
                          {msg.timestamp}
                        </span>

                        {/* Worker Results Cards */}
                        {msg.workers && msg.workers.length > 0 && (
                          <div
                            style={{
                              width: "100%",
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fill, minmax(230px, 1fr))",
                              gap: "14px",
                              marginTop: "14px",
                            }}
                          >
                            {msg.workers.map((worker) => (
                              <div
                                key={worker.id}
                                style={{
                                  backgroundColor: "#ffffff",
                                  border: "1px solid #e2e8f0",
                                  borderRadius: "12px",
                                  overflow: "hidden",
                                  display: "flex",
                                  flexDirection: "column",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                  transition: "all 0.2s ease",
                                }}
                                onMouseOver={(e) =>
                                  (e.currentTarget.style.borderColor = "#ff6a00")
                                }
                                onMouseOut={(e) =>
                                  (e.currentTarget.style.borderColor = "#e2e8f0")
                                }
                              >
                                {/* Photo: Real photo or Initial Badge */}
                                <div
                                  style={{
                                    position: "relative",
                                    width: "100%",
                                    height: "135px",
                                    backgroundColor: "#f1f5f9",
                                  }}
                                >
                                  {worker.image || worker.photo ? (
                                    <img
                                      src={worker.image || worker.photo}
                                      alt={worker.name}
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                      }}
                                    />
                                  ) : (
                                    <div
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        background: "linear-gradient(135deg, #ff8a28 0%, #ea580c 100%)",
                                        color: "#ffffff",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: "52px",
                                          height: "52px",
                                          borderRadius: "50%",
                                          backgroundColor: "rgba(255,255,255,0.25)",
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          fontSize: "24px",
                                          fontWeight: "800",
                                        }}
                                      >
                                        {(worker.name || "A").charAt(0).toUpperCase()}
                                      </div>
                                      <span style={{ fontSize: "11px", fontWeight: "600", opacity: 0.9 }}>
                                        No Profile Photo
                                      </span>
                                    </div>
                                  )}

                                  <div
                                    style={{
                                      position: "absolute",
                                      top: "8px",
                                      right: "8px",
                                      backgroundColor: "#ffffff",
                                      color: "#16a34a",
                                      padding: "2px 7px",
                                      borderRadius: "10px",
                                      fontSize: "11px",
                                      fontWeight: "700",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "3px",
                                      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                                    }}
                                  >
                                    <span>✓</span>
                                    <span>Verified</span>
                                  </div>
                                </div>

                                {/* Details */}
                                <div
                                  style={{
                                    padding: "12px",
                                    display: "flex",
                                    flexDirection: "column",
                                    flex: 1,
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      marginBottom: "2px",
                                    }}
                                  >
                                    <h3
                                      style={{
                                        margin: "0",
                                        fontSize: "14px",
                                        fontWeight: "700",
                                        color: "#0f172a",
                                      }}
                                    >
                                      {worker.name}
                                    </h3>
                                    <div
                                      style={{
                                        color: "#d97706",
                                        fontSize: "12px",
                                        fontWeight: "700",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "2px",
                                      }}
                                    >
                                      <span>★</span>
                                      <span>{worker.rating ? Number(worker.rating).toFixed(1) : "New"}</span>
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      color: "#ff6a00",
                                      fontSize: "12px",
                                      fontWeight: "600",
                                      marginBottom: "6px",
                                    }}
                                  >
                                    <span>
                                      {worker.skill || worker.profession}
                                    </span>
                                    <span style={{ color: "#cbd5e1" }}>•</span>
                                    <span style={{ color: "#64748b" }}>
                                      📍 {worker.location}
                                    </span>
                                  </div>

                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "#94a3b8",
                                      marginBottom: "12px",
                                    }}
                                  >
                                    {Number(worker.reviews) > 0
                                      ? `${worker.reviews} verified review${Number(worker.reviews) !== 1 ? "s" : ""}`
                                      : "New Artisan"}
                                  </div>

                                  {/* Action button: View Profile directly inside chat */}
                                  <div style={{ marginTop: "auto" }}>
                                    <button
                                      onClick={() => handleSelectWorker(worker)}
                                      style={{
                                        width: "100%",
                                        backgroundColor: "#ff6a00",
                                        border: "none",
                                        color: "#ffffff",
                                        padding: "8px 0",
                                        borderRadius: "8px",
                                        fontSize: "13px",
                                        fontWeight: "700",
                                        cursor: "pointer",
                                        transition: "all 0.15s ease",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px",
                                        boxShadow:
                                          "0 2px 6px rgba(255, 106, 0, 0.25)",
                                      }}
                                      onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          "#e65f00";
                                      }}
                                      onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                          "#ff6a00";
                                      }}
                                    >
                                      <span>Profile</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* User Avatar */}
                      {isUser && (
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "#0f172a",
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "700",
                            fontSize: "12px",
                            flexShrink: 0,
                          }}
                        >
                          {userName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase() || "ME"}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Typing status */}
                {isTyping && (
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      alignSelf: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        background: "#ff6a00",
                        color: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "13px",
                      }}
                    >
                      AI
                    </div>
                    <div
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        padding: "10px 16px",
                        borderRadius: "14px",
                        color: "#64748b",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span>
                        {language === "pidgin"
                          ? "I dey search correct worker for you..."
                          : "Searching verified artisans for you..."}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>

            {/* 3. INPUT BAR (Clean Floating Card at Bottom) */}
            <div
              style={{
                padding: "12px 20px 20px",
                backgroundColor: "#ffffff",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "800px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "16px",
                  padding: "6px 10px 6px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#ff6a00";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "#cbd5e1";
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    language === "pidgin"
                      ? "Type wetin you need... e.g. 'I need plumber for Nsukka' or 'Electrician for Enugu'"
                      : "Type what you need... e.g. 'I need a plumber in Nsukka' or 'Electrician in Enugu'"
                  }
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#0f172a",
                    fontSize: "14px",
                    padding: "8px 0",
                  }}
                />

                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    backgroundColor: input.trim() ? "#ff6a00" : "#f1f5f9",
                    color: input.trim() ? "#ffffff" : "#94a3b8",
                    border: "none",
                    cursor: input.trim() ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>

              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "11px",
                  marginTop: "8px",
                  textAlign: "center",
                }}
              >
                {language === "pidgin"
                  ? "WorkConnect AI fit help you find verified workers sharp-sharp. Verify work before payment."
                  : "WorkConnect AI matches you with verified local artisans. Confirm details prior to payment."}
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── IN-CHATBOT REPORT ARTISAN MODAL ─────────────────────────── */}
      {showReportModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={() => setShowReportModal(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              width: "100%",
              maxWidth: "520px",
              borderRadius: "16px",
              padding: "26px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "22px" }}>🚨</span>
                <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Report Artisan</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <p style={{ color: "#64748b", fontSize: "13px", margin: "12px 0 16px" }}>
              File a complaint against <strong>{selectedWorker?.name}</strong> (Trade: {selectedWorker?.skill || selectedWorker?.profession}, ID #{selectedWorker?.id}). WorkConnect admin will investigate.
            </p>

            {reportNotice && (
              <div style={{ backgroundColor: "#ecfdf5", color: "#065f46", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "14px" }}>
                {reportNotice}
              </div>
            )}

            <form onSubmit={handleReportSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "5px" }}>
                  Reason *
                </label>
                <select
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px" }}
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                >
                  <option value="Unprofessional or Abusive Behavior">Unprofessional or Abusive Behavior</option>
                  <option value="Payment Fraud / Scam / Overcharging">Payment Fraud / Scam / Overcharging</option>
                  <option value="Did Not Show Up / Abandoned Work">Did Not Show Up / Abandoned Work</option>
                  <option value="Poor Quality / Damaged Property">Poor Quality / Damaged Property</option>
                  <option value="Impersonation / Fake Credentials">Impersonation / Fake Credentials</option>
                  <option value="Other Safety or Quality Issue">Other Safety or Quality Issue</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "5px" }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    style={{ width: "100%", padding: "9px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }}
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "5px" }}>
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+234..."
                    style={{ width: "100%", padding: "9px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }}
                    value={reportPhone}
                    onChange={(e) => setReportPhone(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "5px" }}>
                  Your Email
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  style={{ width: "100%", padding: "9px 10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", boxSizing: "border-box" }}
                  value={reportEmail}
                  onChange={(e) => setReportEmail(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", marginBottom: "5px" }}>
                  What Happened? *
                </label>
                <textarea
                  rows="4"
                  placeholder="Explain clearly what took place..."
                  style={{ width: "100%", padding: "10px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  style={{ padding: "9px 16px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  style={{ padding: "9px 18px", background: "#dc2626", color: "#ffffff", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "700" }}
                >
                  {submittingReport ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}