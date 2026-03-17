import { type ReactNode, createContext, useContext, useState, useRef, useEffect, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const SelectContext = createContext<{
  value: string;
  onValueChange: (v: string) => void;
  open: boolean;
  setOpen: (o: boolean) => void;
}>({ value: "", onValueChange: () => {}, open: false, setOpen: () => {} });

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children?: ReactNode;
}

function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </SelectContext.Provider>
  );
}

function SelectTrigger({ className, children, ...props }: HTMLAttributes<HTMLButtonElement>) {
  const ctx = useContext(SelectContext);
  return (
    <button
      className={cn(
        "flex items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
      {children}
      <svg className="ml-1 h-3 w-3 opacity-50" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5l3 3 3-3" /></svg>
    </button>
  );
}

function SelectValue() {
  const ctx = useContext(SelectContext);
  return <span>{ctx.value}</span>;
}

function SelectContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ctx = useContext(SelectContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctx.open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) ctx.setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ctx.open, ctx]);

  if (!ctx.open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children?: ReactNode;
}

function SelectItem({ value, className, children, ...props }: SelectItemProps) {
  const ctx = useContext(SelectContext);
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        ctx.value === value && "bg-accent text-accent-foreground",
        className,
      )}
      onClick={() => { ctx.onValueChange(value); ctx.setOpen(false); }}
      {...props}
    >
      {children}
    </div>
  );
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
