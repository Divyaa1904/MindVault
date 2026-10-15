const ToolbarButton = ({
  onClick,
  active = false,
  title,
  disabled,
  children,
}) => {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseDown={(e) => e.preventDefault()}
      disabled={disabled}
      className={`
        w-9
        h-9
        rounded-lg
        flex
        items-center
        justify-center
        transition-all
        duration-150
        text-sm
        font-medium

        ${
        disabled
        ? "opacity-30 cursor-not-allowed"
        : active
        ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
        }
        `}
    >
      {children}
    </button>
  );
};

export default ToolbarButton;