// Reusable card container
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-slate-800 rounded-xl p-6 border border-slate-700 ${className}`}>
      {children}
    </div>
  );
}