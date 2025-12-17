import React from "react";

interface BrutalBoxProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const BrutalBox: React.FC<BrutalBoxProps> = ({
  children,
  className = "",
  title,
}) => (
  <div
    className={`border-4 border-black bg-white shadow-hard p-6 relative ${className}`}
  >
    {title && (
      <div className="absolute -top-5 left-4 bg-brutal-yellow border-4 border-black px-2 py-1 transform -rotate-1 z-10">
        <span className="font-display font-bold uppercase text-lg tracking-wider">
          {title}
        </span>
      </div>
    )}
    {children}
  </div>
);

interface BrutalButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent";
  loading?: boolean;
}

export const BrutalButton: React.FC<BrutalButtonProps> = ({
  children,
  variant = "primary",
  loading,
  className = "",
  ...props
}) => {
  const bgColors = {
    primary: "bg-brutal-black text-white hover:bg-gray-800",
    secondary: "bg-white text-black hover:bg-gray-100",
    accent: "bg-brutal-red text-white hover:bg-red-600",
  };

  return (
    <button
      className={`
        border-4 border-black 
        font-mono font-bold uppercase tracking-widest
        py-3 px-6 
        shadow-hard active:shadow-hard-active active:translate-x-[6px] active:translate-y-[6px] 
        transition-all duration-100
        disabled:opacity-50 disabled:cursor-not-allowed
        ${bgColors[variant]} 
        ${className}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "PROCESSING..." : children}
    </button>
  );
};

interface BrutalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const BrutalInput: React.FC<BrutalInputProps> = ({
  label,
  required,
  className = "",
  ...props
}) => (
  <div className="flex flex-col gap-2 mb-4">
    <label className="font-mono font-bold uppercase text-sm border-l-4 border-black pl-2 flex justify-between">
      <span>{label}</span>
      {required && (
        <span className="text-brutal-red text-xs font-black">* REQ</span>
      )}
    </label>
    <input
      className={`
        bg-transparent border-4 border-black p-3 
        font-mono focus:outline-none focus:bg-brutal-yellow focus:shadow-hard-sm
        transition-all
        ${required ? "border-l-[6px]" : ""}
        ${className}
      `}
      {...props}
    />
  </div>
);

interface BrutalTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const BrutalTextArea: React.FC<BrutalTextAreaProps> = ({
  label,
  required,
  className = "",
  ...props
}) => (
  <div className="flex flex-col gap-2 mb-4">
    <label className="font-mono font-bold uppercase text-sm border-l-4 border-black pl-2 flex justify-between">
      <span>{label}</span>
      {required && (
        <span className="text-brutal-red text-xs font-black">* REQ</span>
      )}
    </label>
    <textarea
      className={`
        bg-transparent border-4 border-black p-3 
        font-mono focus:outline-none focus:bg-brutal-yellow focus:shadow-hard-sm
        min-h-[120px]
        transition-all
        ${required ? "border-l-[6px]" : ""}
        ${className}
      `}
      {...props}
    />
  </div>
);

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export const BrutalCheckbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
}) => (
  <div
    onClick={onChange}
    className={`
      cursor-pointer border-4 border-black p-2 flex items-center gap-3
      transition-all hover:shadow-hard-sm
      ${checked ? "bg-brutal-blue text-white" : "bg-white text-black"}
    `}
  >
    <div
      className={`w-6 h-6 border-4 border-current flex items-center justify-center`}
    >
      {checked && <div className="w-3 h-3 bg-current" />}
    </div>
    <span className="font-mono font-bold uppercase text-sm">{label}</span>
  </div>
);

interface BrutalTagInputProps {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export const BrutalTagInput: React.FC<BrutalTagInputProps> = ({
  label,
  tags,
  onChange,
  placeholder = "TYPE AND ENTER...",
  suggestions = [],
}) => {
  const [input, setInput] = React.useState("");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
  };

  const addTag = (value: string) => {
    const trimmed = value.trim().toUpperCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="mb-6">
      <label className="font-mono font-bold uppercase text-sm border-l-4 border-black pl-2 mb-2 block">
        {label}
      </label>

      <div className="border-4 border-black p-2 bg-white min-h-[60px] flex flex-wrap gap-2 focus-within:shadow-hard-sm transition-all">
        {tags.map((tag) => (
          <span
            key={tag}
            className="bg-brutal-black text-white px-2 py-1 font-bold uppercase text-sm flex items-center gap-2"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-brutal-red"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-grow bg-transparent outline-none font-mono uppercase font-bold min-w-[150px]"
        />
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-xs font-bold uppercase opacity-50 self-center">
            SUGGESTIONS:
          </span>
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => addTag(s)}
              className="text-xs border-2 border-black px-2 hover:bg-black hover:text-white transition-colors uppercase font-bold"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
