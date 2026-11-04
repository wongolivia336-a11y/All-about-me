import { forwardRef } from "react";

interface RoomExitButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const RoomExitButton = forwardRef<HTMLButtonElement, RoomExitButtonProps>(function RoomExitButton(
  { onClick, disabled = false },
  ref,
) {
  return (
    <button
      ref={ref}
      className="room-exit"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Return to Index"
      title="Return to Index"
    >
      <span aria-hidden="true" />
    </button>
  );
});
