import { EditorContent } from '@tiptap/react'

export default function RichTextEditor({ editor }) {
  if (!editor) return null

  return (
    <div className="py-2">
      <EditorContent
        editor={editor}
        className="
          min-h-[400px]
          text-lg
          leading-8
          text-gray-300
        "
      />
    </div>
  )
}