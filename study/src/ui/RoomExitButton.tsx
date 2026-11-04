import { forwardRef } from "react";
import { useLanguage } from "../i18n";

interface RoomExitButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const RoomExitButton = forwardRef<HTMLButtonElement, RoomExitButtonProps>(function RoomExitButton(
  { onClick, disabled = false },
  ref,
) {
  const { copy } = useLanguage();
  return (
    <button
      ref={ref}
      className="room-exit"
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={copy.returnToIndex}
      title={copy.returnToIndex}
    >
      <span aria-hidden="true" />
    </button>
  );
});
