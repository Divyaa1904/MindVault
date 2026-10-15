import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../services/api'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import ProtectedRoute from '../components/ProtectedRoute'
import RichTextEditor from '../components/RichTextEditor'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import EditorToolbar from "../components/EditorToolbar";
import { FiUpload } from "react-icons/fi";

const lowlight = createLowlight(common);

const NoteEditor = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    content: null,
    plainText: '',
    tags: [],
  })

  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState("Saved");
  const autoSaveTimer = useRef(null);
  const [fetchLoading, setFetchLoading] = useState(isEditing)
  const [loaded, setLoaded] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(id);
  const fileInputRef = useRef(null);
  const [importingPdf, setImportingPdf] = useState(false);

  const editor = useEditor({
    extensions: [Underline, TaskList,
      StarterKit.configure({
        codeBlock: false,
      }),
      TextStyle,Color,
    TaskItem.configure({
        nested: true,
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),],

    content: '',

    onUpdate: ({ editor }) => {
      setForm(prev => ({
        ...prev,
        content: editor.getJSON(),
        plainText: editor.getText(),
      }))
    },
  })

  useEffect(() => {
    if (isEditing) {
      API.get(`/notes/getById/${id}`)
        .then((res) => {
          const { title, content, plainText, tags = [] } = res.data
          setForm({ title, content, plainText, tags })
          setLoaded(true);
        })
        .catch(() => toast.error('Failed to load note'))
        .finally(() => setFetchLoading(false))
    }
  }, [id, isEditing])

  useEffect(() => {
  if (
    editor &&
    isEditing &&
    form.content &&
    editor.isEmpty
  ) {
    editor.commands.setContent(form.content);
  }
}, [editor, isEditing, form.content]);

useEffect(() => {
  if (!isEditing) {
    setLoaded(true);
  }
}, [isEditing]);

useEffect(() => {
  if (!loaded) return;

  // Don't start autosave until a note is loaded
  if (!form.content) return;

  // Cancel previous timer
  if (autoSaveTimer.current) {
    clearTimeout(autoSaveTimer.current);
  }

  // Start a new 3-second timer
  autoSaveTimer.current = setTimeout(() => {
    autoSave();
  }, 3000);

  return () => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }
  };
}, [form,loaded]);

 

  const addTag = () => {
    const tag = tagInput.trim()

    if (!tag) return

    if (form.tags.includes(tag)) {
      toast.error('Tag already exists')
      return
    }

    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }))

    setTagInput('')
  }

  const removeTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

const autoSave = async () => {
  try {
    setSaveStatus("Saving...");

    if (currentNoteId) {
      await API.put(`/notes/update/${currentNoteId}`, form);
    } else {
      const res = await API.post("/notes/create", form);

      setCurrentNoteId(res.data.note._id);

      navigate(`/edit/${res.data.note._id}`, { replace: true });
    }

    setSaveStatus("Saved");
  } catch {
    setSaveStatus("Failed");
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing) {
        await API.put(`/notes/update/${id}`, form)
        toast.success('Note updated!')
        navigate(`/note/${id}`)
      } else {
        const res = await API.post('/notes/create', form)
        toast.success('Note created!')
        navigate(`/note/${res.data.note._id}`)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const handleImportPdf = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    setImportingPdf(true);
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const res = await API.post('/notes/parse-pdf', formData);

      const { title, content } = res.data;
      
      setForm(prev => ({
        ...prev,
        title: prev.title || title,
      }));

      // Improve text formatting by preserving line breaks and paragraph spacing
      const formattedContent = content
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p)
        .map(p => {
          // Inside a paragraph block, convert single newlines to <br> to preserve exact line structure
          const lines = p.split('\n').join('<br>');
          return `<p>${lines}</p>`;
        })
        .join('');
      
      if (editor) {
        editor.commands.setContent(formattedContent);
      }
      toast.success("PDF imported successfully!");
    } catch (err) {
      toast.error("Failed to extract text from PDF.");
    } finally {
      setImportingPdf(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex flex-col items-center justify-center mt-24 gap-4">
        <div className="w-10 h-10 rounded-xl border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
        <p className="text-sm text-gray-600">Loading editor...</p>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1600px] mx-auto px-6 py-2 "
      >
        <form onSubmit={handleSubmit}>
          <div className="h-[92vh] flex flex-col bg-white/80 dark:bg-[#0c0c18]/80 backdrop-blur-xl border border-gray-200 dark:border-white/5 rounded-3xl shadow-lg dark:shadow-2xl dark:shadow-violet-900/10 overflow-hidden">
            {/* Top Action Bar */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-white/5 bg-gray-50/80 dark:bg-[#0a0a14]/80 backdrop-blur-lg">
            
            <div className="flex gap-2">
              <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all text-sm font-medium"
                >
                  Cancel
              </button>
              {!isEditing && (
                <>
                  <input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={handleImportPdf}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={importingPdf}
                    className="px-4 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 transition-all text-sm font-medium flex items-center gap-2"
                  >
                    <FiUpload size={14} />
                    {importingPdf ? "Importing..." : "Import PDF"}
                  </button>
                </>
              )}
            </div>

            <EditorToolbar editor={editor}/>

            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                saveStatus === 'Saved' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' :
                saveStatus === 'Saving...' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' :
                'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
              }`}>
                {saveStatus}
              </span>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all font-medium disabled:opacity-50 text-sm text-white shadow-lg shadow-violet-500/20"
              >
                {loading ? "Saving..." : isEditing ? "Update" : "Create"}
              </button>
            </div>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10">
              {/* Title */}
              <input
                type="text"
                placeholder="Untitled"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="
                  w-full
                  bg-transparent
                  text-4xl
                  md:text-5xl
                  font-bold
                  text-gray-900
                  dark:text-white
                  outline-none
                  placeholder-gray-400
                  dark:placeholder-gray-700
                  mb-6
                  caret-violet-600
                  dark:caret-violet-400
                "
              />

              {/* Tags */}
              <div className="mb-8">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="
                      px-4 py-2
                      bg-gray-50
                      dark:bg-white/5
                      border border-gray-200
                      dark:border-white/10
                      rounded-full
                      text-sm
                      focus:outline-none
                      focus:ring-2
                      focus:ring-violet-500/50
                      focus:border-violet-500/30
                      text-gray-900
                      dark:text-white
                      placeholder-gray-400
                      dark:placeholder-gray-600
                      transition-all
                    "
                  />

                  <button
                    type="button"
                    onClick={addTag}
                    className="
                      px-4 py-2
                      bg-violet-50
                      dark:bg-violet-600/20
                      hover:bg-violet-100
                      dark:hover:bg-violet-600/30
                      border border-violet-200
                      dark:border-violet-500/20
                      text-violet-700
                      dark:text-violet-300
                      rounded-full
                      text-sm
                      font-medium
                      transition-all
                    "
                  >
                    Add
                  </button>
                </div>

                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {form.tags.map((tag) => (
                      <div
                        key={tag}
                        className="
                          flex items-center gap-2
                          px-3 py-1
                          bg-violet-50
                          dark:bg-violet-500/10
                          border border-violet-200
                          dark:border-violet-500/20
                          rounded-full
                          text-violet-700
                          dark:text-violet-300
                          text-sm
                          font-medium
                        "
                      >
                        <span>#{tag}</span>

                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-600 dark:hover:text-red-400 transition-colors text-violet-600/60 dark:text-violet-400/60"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Content */}
              <RichTextEditor
                editor={editor}
              />
            </div>
          </div>
        </form>
      </motion.div>
    </ProtectedRoute>
  );
}

export default NoteEditor