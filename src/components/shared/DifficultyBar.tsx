interface DifficultyBarProps {
  easy: number;
  medium: number;
  hard: number;
  onChange?: (values: { easy: number; medium: number; hard: number }) => void;
}

export function DifficultyBar({ easy, medium, hard }: DifficultyBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-muted">
        <div className="bg-hnxgreen transition-all" style={{ width: `${easy}%` }} />
        <div className="bg-warning transition-all" style={{ width: `${medium}%` }} />
        <div className="bg-destructive transition-all" style={{ width: `${hard}%` }} />
      </div>
      <div className="flex justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-hnxgreen" />Easy {easy}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warning" />Medium {medium}%
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-destructive" />Hard {hard}%
        </span>
      </div>
    </div>
  );
}
