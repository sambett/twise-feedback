// Event configurations for the Universal Feedback Platform

export interface EventConfig {
  id: string;
  title: string;
  subtitle: string;
  activityLabel: string;
  feedbackLabel: string;
  feedbackPlaceholder: string;
  activities: string[];
  theme: {
    background: string;
    titleGradient: string;
    buttonGradient: string;
    buttonHover: string;
    accent: string;
  };
}

export const eventConfigs: Record<string, EventConfig> = {
  // Original TWISE Night (Competition Challenge)
  "twise-night": {
    id: "twise-night",
    title: "TWISE Night Feedback",
    subtitle: "Share your research experience with us!",
    activityLabel: "Select The Activity You Liked The Most!",
    feedbackLabel: "What did you learn?",
    feedbackPlaceholder: "Share your thoughts about this research activity...",
    activities: [
      "AI Workshop & Innovation",
      "Healthcare & Biotech",
      "Environmental Projects",
      "Smart Cities & IoT",
      "Social Impact Research",
      "Quantum Computing Demo",
      "Robotics Lab",
      "VR Research Experience"
    ],
    theme: {
      background: "from-indigo-900 via-purple-900 to-blue-900",
      titleGradient: "from-indigo-300 to-purple-300",
      buttonGradient: "from-indigo-600 to-purple-600",
      buttonHover: "from-indigo-700 to-purple-700",
      accent: "indigo-400"
    }
  },

  // Wedding Event (Different Industry Demo)
  "sam-wedding": {
    id: "sam-wedding",
    title: "Sam's Wedding ✨",
    subtitle: "Help us make this day perfect!",
    activityLabel: "What aspect would you like to rate?",
    feedbackLabel: "Share your thoughts about this special day",
    feedbackPlaceholder: "Tell us about your experience at the wedding...",
    activities: [
      "Venue & Decoration",
      "Food & Catering",
      "Music & Entertainment",
      "Photography & Videography",
      "Overall Atmosphere",
      "Wedding Ceremony",
      "Reception Party"
    ],
    theme: {
      background: "from-rose-800 via-pink-800 to-purple-800",
      titleGradient: "from-rose-200 to-pink-200",
      buttonGradient: "from-rose-600 to-pink-600",
      buttonHover: "from-rose-700 to-pink-700",
      accent: "rose-400"
    }
  },

  // Business Product Demo (Corporate Use Case)
  "techflow-demo": {
    id: "techflow-demo",
    title: "TechFlow Product Demo",
    subtitle: "Your feedback shapes our future",
    activityLabel: "Which aspect would you like to evaluate?",
    feedbackLabel: "What are your thoughts on this feature?",
    feedbackPlaceholder: "Share your feedback on the product demonstration...",
    activities: [
      "User Interface Design",
      "Core Features & Functionality",
      "Performance & Speed",
      "Ease of Use",
      "Pricing Strategy",
      "Overall Product Concept",
      "Market Fit"
    ],
    theme: {
      background: "from-slate-800 via-gray-800 to-zinc-800",
      titleGradient: "from-slate-200 to-gray-200",
      buttonGradient: "from-slate-600 to-gray-600",
      buttonHover: "from-slate-700 to-gray-700",
      accent: "slate-400"
    }
  }
};

// Helper function to get event config or fallback to TWISE
export const getEventConfig = (eventId: string): EventConfig => {
  return eventConfigs[eventId] || eventConfigs["twise-night"];
};

// Get all available events for admin panel
export const getAllEvents = (): EventConfig[] => {
  return Object.values(eventConfigs);
};
