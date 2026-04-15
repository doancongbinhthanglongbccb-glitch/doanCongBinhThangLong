import { Phone, Search } from "lucide-react";
import { useState } from "react";

type TopBarProps = {
  hotlineLabel: string;
  hotlineValue: string;
};

const TopBar = ({ hotlineLabel, hotlineValue }: TopBarProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  const now = new Date();
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const dateStr = `${days[now.getDay()]}, ${now.getDate().toString().padStart(2, "0")}/${(now.getMonth() + 1).toString().padStart(2, "0")}/${now.getFullYear()} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")} GMT+7`;

  return (
    <div className="bg-topbar text-primary-foreground text-sm">
      <div className="container flex items-center justify-between py-1.5">
        <div className="flex items-center gap-2">
          <Phone className="w-3.5 h-3.5" />
          <span className="font-medium">{hotlineLabel}</span>
          <span className="opacity-90">{hotlineValue}</span>
          <span className="mx-2 opacity-50">|</span>
          <span className="opacity-90">{dateStr}</span>
        </div>
        <div className="flex items-center gap-3">
          {searchOpen && (
            <input
              type="text"
              placeholder="Nhập từ khóa cần tìm..."
              className="px-3 py-1 rounded text-foreground text-sm w-48 outline-none"
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          )}
          <button onClick={() => setSearchOpen(!searchOpen)} className="hover:opacity-80">
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
