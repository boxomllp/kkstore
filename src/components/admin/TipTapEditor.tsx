'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, UnderlineIcon, Heading1, Heading2, List, ListOrdered, Quote, LinkIcon, ImagePlus } from 'lucide-react'
import { useEffect } from 'react'

export default function TipTapEditor({ onChange, initialContent }: { onChange: (html: string) => void, initialContent?: string }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Image, Placeholder.configure({ placeholder: 'Write content...' }), Link.configure({ openOnClick: false })],
    content: initialContent || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML())
  })

  useEffect(() => { if (editor && initialContent) editor.commands.setContent(initialContent) }, [editor, initialContent])
  if (!editor) return null

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}><Bold size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}><Italic size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={`p-2 rounded ${editor.isActive('underline') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}><UnderlineIcon size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleHeading({level:1}).run()} className={`p-2 rounded ${editor.isActive('heading', {level:1}) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}><Heading1 size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleHeading({level:2}).run()} className={`p-2 rounded ${editor.isActive('heading', {level:2}) ? 'bg-gray-300' : 'hover:bg-gray-200'}`}><Heading2 size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}><List size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}><ListOrdered size={16} /></button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-gray-300' : 'hover:bg-gray-200'}`}><Quote size={16} /></button>
        <button onClick={() => { const url = prompt('URL'); if(url) editor.chain().focus().setLink({href: url}).run() }} className="p-2 rounded hover:bg-gray-200"><LinkIcon size={16} /></button>
        <button onClick={() => { const url = prompt('Image URL'); if(url) editor.chain().focus().setImage({src: url}).run() }} className="p-2 rounded hover:bg-gray-200"><ImagePlus size={16} /></button>
      </div>
      <EditorContent editor={editor} className="p-4 min-h-[200px] prose max-w-none focus:outline-none" />
    </div>
  )
}
