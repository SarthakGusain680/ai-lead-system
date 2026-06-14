// A small colored label showing status or score
interface BadgeProps {
  text: string;
  type?: "status" | "score";
}

export default function Badge({ text, type = "status" }: BadgeProps) {
  const getColor = () => {
    // Score colors
    if (text === "HOT") return "bg-red-500 text-white";
    if (text === "MEDIUM") return "bg-yellow-500 text-black";
    if (text === "COLD") return "bg-blue-500 text-white";

    // Status colors
    if (text === "NEW") return "bg-purple-500 text-white";
    if (text === "CONTACTED") return "bg-blue-500 text-white";
    if (text === "QUALIFIED") return "bg-green-500 text-white";
    if (text === "CLOSED") return "bg-gray-500 text-white";

    return "bg-gray-600 text-white";
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getColor()}`}>
      {text}
    </span>
  );
}