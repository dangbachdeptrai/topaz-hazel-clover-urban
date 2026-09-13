import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MatchmakingSearch({
  ranked,
  onCancel,
  title,
  hint,
}: {
  ranked: boolean;
  onCancel: () => void;
  title?: string;
  hint?: string;
}) {
  return (
    <div className="py-10 text-center">
      <div className="relative mx-auto grid size-24 place-items-center">
        <span className="seek-ring absolute inset-0 rounded-full border border-gold/40" />
        <span className="seek-ring absolute inset-2 rounded-full border border-primary/35 [animation-delay:400ms]" />
        <Loader2 className="size-8 animate-spin text-gold" />
      </div>
      <p className="mt-6 font-display text-2xl font-semibold">
        {title ?? (ranked ? "Đang dò đối thủ cùng cảnh giới" : "Đang tìm đối thủ trên Lôi Đài")}
      </p>
      <p className="mt-2 text-sm text-muted">
        {hint ??
          (ranked
            ? "Ghép theo Elo. Nếu vắng người, cao thủ ảo sẽ vào sau vài giây."
            : "Nếu vắng người, cao thủ ảo sẽ vào sau khoảng 7 giây.")}
      </p>
      <Button variant="outline" className="mt-8" onClick={onCancel}>
        Hủy tìm trận
      </Button>
    </div>
  );
}
