/* eslint-disable @typescript-eslint/no-explicit-any */
import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface TinyEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  disabled?: boolean;
  toolbar?: string;
}

export const TinyEditor: React.FC<TinyEditorProps> = ({ 
  initialValue = '', 
  onChange, 
  disabled = false,
  toolbar = 'undo redo',
}) => {
  const editorRef = useRef<any>(null);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      disabled={disabled}
      onInit={(_evt, editor) => (editorRef.current = editor)}
      onEditorChange={(content) => onChange?.(content)}
      init={{
        height: 400,
        menubar: false,
        language: 'ru',
        language_url: '/tinymce/langs/ru.js',
        // 🔑 Критично: пути к локальным скинам и контенту
        skin_url: '/tinymce/skins/ui/oxide',
        content_css: '/tinymce/skins/content/default/content.css',
        
        plugins: 'lists link image code table',
        toolbar: toolbar,
        placeholder: 'Начните вводить текст...',
        initial_value: initialValue,
        // Оптимизация для React StrictMode
        init_instance_callback: () => {
        //   console.log('TinyMCE initialized');
        },
      }}
    />
  );
};