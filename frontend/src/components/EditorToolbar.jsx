import ToolbarButton from "./ToolbarButton";
import { useEffect, useState } from "react";
import { FiRotateCcw, FiRotateCw } from "react-icons/fi";

import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiCode,
} from "react-icons/fi";

import {
  MdFormatStrikethrough,
  MdFormatListNumbered,
  MdCheckBox,
} from "react-icons/md";

const COLORS = [
  // White & Gray
  "#FFFFFF",
  "#E5E7EB",
  "#9CA3AF",
  "#6B7280",
  "#374151",
  "#111827",

  // Red
  "#FEE2E2",
  "#FCA5A5",
  "#EF4444",
  "#DC2626",
  "#991B1B",

  // Orange
  "#FED7AA",
  "#FB923C",
  "#F97316",
  "#EA580C",
  "#9A3412",

  // Yellow
  "#FEF3C7",
  "#FCD34D",
  "#EAB308",
  "#CA8A04",
  "#854D0E",

  // Green
  "#DCFCE7",
  "#86EFAC",
  "#22C55E",
  "#16A34A",
  "#166534",

  // Cyan
  "#CFFAFE",
  "#67E8F9",
  "#06B6D4",
  "#0891B2",
  "#164E63",

  // Blue
  "#DBEAFE",
  "#93C5FD",
  "#3B82F6",
  "#2563EB",
  "#1E3A8A",

  // Purple
  "#E9D5FF",
  "#C084FC",
  "#8B5CF6",
  "#7C3AED",
  "#4C1D95",

  // Pink
  "#FBCFE8",
  "#F472B6",
  "#EC4899",
  "#DB2777",
  "#831843",
];



const EditorToolbar = ({ editor }) => {

    const [showColors, setShowColors] = useState(false);

    if (!editor) return null;

    const [, forceUpdate] = useState(0);

useEffect(() => {
  if (!editor) return;

  const update = () => forceUpdate(v => v + 1);

  editor.on("selectionUpdate", update);
  editor.on("transaction", update);

  return () => {
    editor.off("selectionUpdate", update);
    editor.off("transaction", update);
  };
}, [editor]);

    return (

        <div className="flex items-center gap-2 flex-wrap">

            {/* Text Formatting */}
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 rounded-xl px-1.5 py-1 border border-gray-200 dark:border-white/5">
                <ToolbarButton
                    title="Bold"
                    active={editor.isActive("bold")}
                    onClick={() =>
                        editor.chain().focus().toggleBold().run()
                    }
                >
                    <FiBold size={16}/>
                </ToolbarButton>

                <ToolbarButton
                    title="Italic"
                    active={editor.isActive("italic")}
                    onClick={() =>
                        editor.chain().focus().toggleItalic().run()
                    }
                >
                    <FiItalic size={16}/>
                </ToolbarButton>

                <ToolbarButton
                    title="Underline"
                    active={editor.isActive("underline")}
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                >
                    <FiUnderline size={16}/>
                </ToolbarButton>

                <ToolbarButton
                    title="Strike"
                    active={editor.isActive("strike")}
                    onClick={() =>
                        editor.chain().focus().toggleStrike().run()
                    }
                >
                    <MdFormatStrikethrough size={16}/>
                </ToolbarButton>

                  </div>

                  {/* Headings */}
                  <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 rounded-xl px-1.5 py-1 border border-gray-200 dark:border-white/5">

                    <ToolbarButton
                        title="Heading 1"
                        active={editor.isActive("heading", { level: 1 })}
                        onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 1 }).run()
                        }
                    >
                        H1
                    </ToolbarButton>

                    <ToolbarButton
                        title="Heading 2"
                        active={editor.isActive("heading", { level: 2 })}
                        onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                        }
                    >
                        H2
                    </ToolbarButton>

                    <ToolbarButton
                        title="Heading 3"
                        active={editor.isActive("heading", { level: 3 })}
                        onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                        }
                    >
                        H3
                    </ToolbarButton>

                    </div>

                    {/* Lists */}
                    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 rounded-xl px-1.5 py-1 border border-gray-200 dark:border-white/5">

                    <ToolbarButton
                        title="Bullet List"
                        active={editor.isActive("bulletList")}
                        onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                        }
                    >
                        <FiList size={16}/>
                    </ToolbarButton>

                    <ToolbarButton
                        title="Numbered List"
                        active={editor.isActive("orderedList")}
                        onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                        }
                    >
                        <MdFormatListNumbered size={16}/>
                    </ToolbarButton>

                    <ToolbarButton
                        title="Task List"
                        active={editor.isActive("taskList")}
                        onClick={() =>
                        editor.chain().focus().toggleTaskList().run()
                        }
                    >
                        <MdCheckBox size={16}/>
                    </ToolbarButton>

                    </div>

                    {/* Code */}
                    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 rounded-xl px-1.5 py-1 border border-gray-200 dark:border-white/5">

                    <ToolbarButton
                        title="Code Block"
                        active={editor.isActive("codeBlock")}
                        onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                        }
                    >
                        <FiCode size={16}/>
                    </ToolbarButton>

                    <ToolbarButton
                        title="Inline Code"
                        active={editor.isActive("code")}
                        onClick={() =>
                        editor.chain().focus().toggleCode().run()
                        }
                    >
                        {"</>"}
                    </ToolbarButton>

                    </div>

                    {/* Color */}
                    <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 rounded-xl px-1.5 py-1 border border-gray-200 dark:border-white/5">

                    <div className="relative">

                        <ToolbarButton
                            title="Text Color"
                            onClick={() => setShowColors(v => !v)}
                        >
                            🎨
                        </ToolbarButton>

                        {showColors && (
                            <div
                            className="
                                absolute
                                top-12
                                left-0
                                z-50
                                w-48
                                p-3
                                bg-white/95
                                dark:bg-[#0f0f1a]/95
                                backdrop-blur-xl
                                border
                                border-gray-200
                                dark:border-violet-500/20
                                rounded-2xl
                                shadow-xl
                                dark:shadow-2xl
                                dark:shadow-violet-900/30
                                grid
                                grid-cols-4
                                gap-2.5
                            "
                            >
                            {COLORS.map((color) => (
                                <button
                                key={color}
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().setColor(color).run();
                                    setShowColors(false);
                                }}
                                className="
                                    w-7
                                    h-7
                                    rounded-full
                                    border-2
                                    border-white/10
                                    hover:scale-125
                                    hover:border-white/40
                                    transition-all
                                    duration-150
                                    flex
                                    items-center
                                    justify-center
                                "
                                style={{ backgroundColor: color }}
                                />
                            ))}
                            </div>
                        )}

                        </div>

                    <ToolbarButton
                        title="Reset Color"
                        onClick={() =>
                        editor
                            .chain()
                            .focus()
                            .unsetColor()
                            .run()
                        }
                    >
                        A
                    </ToolbarButton>

                    </div>

                    {/* Undo/Redo */}
                    <ToolbarButton
                    title="Undo"
                    disabled={!editor.can().chain().focus().undo().run()}
                    onClick={() =>
                        editor.chain().focus().undo().run()
                    }
                    >
                    <FiRotateCcw size={16}/>
                    </ToolbarButton>

                    <ToolbarButton
                    title="Redo"
                    disabled={!editor.can().chain().focus().redo().run()}
                    onClick={() =>
                        editor.chain().focus().redo().run()
                    }
                    >
                    <FiRotateCw size={16}/>
                    </ToolbarButton>


            </div>
        );
};

export default EditorToolbar;