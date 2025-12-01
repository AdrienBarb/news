"use client";

export default function EndCard() {
  return (
    <div className="aspect-[4/5] w-full rounded-lg bg-background overflow-hidden flex flex-col items-center gap-2">
      <div className="flex-1 flex flex-col items-center justify-center border rounded-lg p-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-primary font-playfair-display">
            That's all for today!
          </h2>
          <p className="text-base font-bold font-archivo text-muted-foreground">
            Come back tomorrow for more news
          </p>
        </div>
      </div>
    </div>
  );
}

