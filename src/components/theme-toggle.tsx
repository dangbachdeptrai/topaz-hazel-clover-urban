import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function isDark() {
  try {
    return localStorage.getItem("ltc-theme") !== "light";
  } catch {
    return true;
  }
}

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const d = isDark();
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("ltc-theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-11 place-items-center rounded-[12px] border border-border bg-bg-elevated text-gold"
      aria-label={dark ? "Chuyển sang Bạch Ngọc Kinh" : "Chuyển sang Đêm Dạ Minh Châu"}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
