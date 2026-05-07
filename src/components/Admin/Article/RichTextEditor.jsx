import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { useCallback, useRef, useEffect } from "react";
import { compressImage } from "../../../utils/imageCompress";
import { articleAPI } from "../../../services/admin/articleApi";
import { toast } from "react-toastify";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Minus,
} from "lucide-react";

const MenuBar = ({ editor }) => {
  const fileInputRef = useRef(null);

  if (!editor) return null;

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        const response = await articleAPI.uploadImage(compressed);
        if (response.data.url) {
          editor.chain().focus().setImage({ src: response.data.url }).run();
        }
      } catch (err) {
        toast.error("Gagal mengupload gambar");
      }
    }
    e.target.value = "";
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const addTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const btnClass = (isActive) =>
    `p-1.5 rounded transition-colors ${
      isActive
        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
        : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
    }`;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btnClass(editor.isActive("bold"))}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btnClass(editor.isActive("italic"))}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={btnClass(editor.isActive("underline"))}
        title="Underline"
      >
        <UnderlineIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btnClass(editor.isActive("strike"))}
        title="Strikethrough"
      >
        <Strikethrough size={16} />
      </button>

      <div className="w-px h-6 mx-1 bg-gray-300 dark:bg-gray-600 self-center" />

      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={btnClass(editor.isActive("heading", { level: 1 }))}
        title="Heading 1"
      >
        <Heading1 size={16} />
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={btnClass(editor.isActive("heading", { level: 2 }))}
        title="Heading 2"
      >
        <Heading2 size={16} />
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        className={btnClass(editor.isActive("heading", { level: 3 }))}
        title="Heading 3"
      >
        <Heading3 size={16} />
      </button>

      <div className="w-px h-6 mx-1 bg-gray-300 dark:bg-gray-600 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        className={btnClass(editor.isActive({ textAlign: "left" }))}
        title="Rata Kiri"
      >
        <AlignLeft size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        className={btnClass(editor.isActive({ textAlign: "center" }))}
        title="Rata Tengah"
      >
        <AlignCenter size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        className={btnClass(editor.isActive({ textAlign: "right" }))}
        title="Rata Kanan"
      >
        <AlignRight size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        className={btnClass(editor.isActive({ textAlign: "justify" }))}
        title="Rata Kanan Kiri"
      >
        <AlignJustify size={16} />
      </button>

      <div className="w-px h-6 mx-1 bg-gray-300 dark:bg-gray-600 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btnClass(editor.isActive("bulletList"))}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btnClass(editor.isActive("orderedList"))}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btnClass(editor.isActive("blockquote"))}
        title="Quote"
      >
        <Quote size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className={btnClass(false)}
        title="Garis Horizontal"
      >
        <Minus size={16} />
      </button>

      <div className="w-px h-6 mx-1 bg-gray-300 dark:bg-gray-600 self-center" />

      <button
        type="button"
        onClick={setLink}
        className={btnClass(editor.isActive("link"))}
        title="Link"
      >
        <LinkIcon size={16} />
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={btnClass(false)}
        title="Upload Gambar"
      >
        <ImageIcon size={16} />
      </button>
      <button
        type="button"
        onClick={addTable}
        className={btnClass(false)}
        title="Sisipkan Tabel"
      >
        <TableIcon size={16} />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageUpload}
      />

      <div className="w-px h-6 mx-1 bg-gray-300 dark:bg-gray-600 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${btnClass(false)} disabled:opacity-30`}
        title="Undo"
      >
        <Undo size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${btnClass(false)} disabled:opacity-30`}
        title="Redo"
      >
        <Redo size={16} />
      </button>
    </div>
  );
};

const RichTextEditor = ({
  content = "",
  onChange,
  placeholder = "Tulis konten artikel di sini...",
}) => {
  const lastEmittedHtml = useRef(content);

  const handleDrop = useCallback((view, event) => {
    const files = event.dataTransfer?.files;
    if (!files?.length) return false;

    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!imageFiles.length) return false;

    event.preventDefault();

    (async () => {
      for (const file of imageFiles) {
        try {
          const compressed = await compressImage(file);
          const response = await articleAPI.uploadImage(compressed);
          if (response.data.url) {
            const { schema } = view.state;
            const node = schema.nodes.image.create({ src: response.data.url });
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);
          }
        } catch (err) {
          toast.error("Gagal mengupload gambar");
        }
      }
    })();

    return true;
  }, []);

  const handlePaste = useCallback((view, event) => {
    const items = event.clipboardData?.items;
    if (!items) return false;

    const itemsArray = Array.from(items);
    const hasHtmlOrText = itemsArray.some(
      (item) => item.type === "text/plain" || item.type === "text/html"
    );
    const imageItem = itemsArray.find((item) => item.type.startsWith("image/"));

    // If there's no image, let ProseMirror handle it natively (e.g., plain text)
    if (!imageItem) {
      return false;
    }

    // If there IS an image, but ALSO html/text (like copying a section of a website),
    // let ProseMirror handle it so we don't lose the text.
    if (hasHtmlOrText) {
      return false;
    }

    // If it's a pure image copy (e.g., snipping tool), intercept and upload
    const file = imageItem.getAsFile();
    if (!file) return false;

    event.preventDefault();

    (async () => {
      try {
        const compressed = await compressImage(file);
        const response = await articleAPI.uploadImage(compressed);
        if (response.data.url) {
          const { schema } = view.state;
          const node = schema.nodes.image.create({
            src: response.data.url,
          });
          const transaction = view.state.tr.replaceSelectionWith(node);
          view.dispatch(transaction);
        }
      } catch (err) {
        toast.error("Gagal mengupload gambar dari clipboard");
      }
    })();

    return true;
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-600 underline" },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastEmittedHtml.current = html;
      onChange?.(html);
    },
    editorProps: {
      handleDrop,
      handlePaste,
      attributes: {
        class:
          "prose dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none",
      },
    },
  });

  // Update content when prop changes (e.g. loading existing article)
  useEffect(() => {
    if (editor && content && editor.getHTML() !== content && lastEmittedHtml.current !== content) {
      editor.commands.setContent(content);
      lastEmittedHtml.current = content;
    }
  }, [content, editor]);

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
