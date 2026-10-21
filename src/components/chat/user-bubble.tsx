interface UserBubbleProps {
  text: string;
}

export function UserBubble({ text }: UserBubbleProps) {
  return (
    <div className="flex justify-end chat-enter">
      <div className="max-w-md sm:max-w-lg bg-accent text-text-inverse rounded-2xl rounded-tr-xs px-4 sm:px-5 py-3 shadow-subtle text-sm sm:text-base leading-relaxed">
        {text}
      </div>
    </div>
  );
}
