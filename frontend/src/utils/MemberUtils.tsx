export const getRatingColor = (rating) => {
    if (rating >= 3000) return "bg-gradient-to-r from-red-700 via-orange-600 to-yellow-400 bg-clip-text text-transparent  drop-shadow-lg";
    if (rating >= 2600) return "text-red-600";
    if (rating >= 2400) return "text-red-600";
    if (rating >= 2100) return "text-orange-500";
    if (rating >= 1900) return "text-purple-500";
    if (rating >= 1600) return "text-blue-500";
    if (rating >= 1400) return "text-cyan-400";
    if (rating >= 1200) return "text-green-500";
    return "text-gray-400";
};

