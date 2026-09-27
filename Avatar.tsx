interface Props {
  initials: string;
  gradientClass: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  online?: boolean;
}

const SIZES = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const DOT_SIZES = {
  xs: "w-2 h-2 border",
  sm: "w-2.5 h-2.5 border-[1.5px]",
  md: "w-2.5 h-2.5 border-2",
  lg: "w-3 h-3 border-2",
  xl: "w-3.5 h-3.5 border-2",
};

export default function Avatar({ initials, gradientClass, size = "md", online }: Props) {
  return (
    <div className="relative flex-shrink-0">
      <div className={`${SIZES[size]} rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center font-bold text-white shadow-sm`}>
        {initials}
      </div>
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 rounded-full border-white dark:border-[#0D1F12] ${DOT_SIZES[size]} ${online ? "bg-emerald-400" : "bg-slate-300 dark:bg-slate-600"}`} />
      )}
    </div>
  );
}
