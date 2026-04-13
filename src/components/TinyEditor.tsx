import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';
import { useRef } from 'react';

interface TinyEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  disabled?: boolean;
  toolbar?: string;
  maxLenght?: number;
}

export const TinyEditor: React.FC<TinyEditorProps> = ({ 
  initialValue = '', 
  onChange, 
  disabled = false,
  toolbar = 'undo redo',
  maxLenght = 1000,
}) => {
  const editorRef = useRef<TinyMCEEditor | null>(null);

  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      disabled={disabled}
      onInit={(_evt, editor) => (editorRef.current = editor)}
      onEditorChange={(content) => {
        if (content.length < maxLenght) {
          onChange?.(content);
        }
      }}
      
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
        paste_preprocess: (_plugin, args) => {
          const currentLength = editorRef.current?.getContent({ format: 'text' }).length || 0;
          const pastedText = args.content.replace(/<[^>]*>/g, '');
          if (currentLength + pastedText.length > maxLenght) {
            args.content = pastedText.slice(0, maxLenght - currentLength);
          }
        },
        setup: (editor: TinyMCEEditor) => {
          editor.on('init', () => {
            const updateCounter = () => {
              const content = editor.getContent({ format: 'text' });
              const count = content.length;
              const statusBar = editor.getContainer().querySelector('.tox-statusbar__text-container') as HTMLElement | null;
              if (statusBar) {
                let counter = statusBar.querySelector('.char-counter') as HTMLElement | null;
                if (!counter) {
                  counter = document.createElement('span');
                  counter.className = 'char-counter';
                  counter.style.cssText = 'margin-left: 8px; color: #666;';
                  statusBar.appendChild(counter);
                }
                counter.textContent = `${count}/${maxLenght}`;
                counter.style.color = count >= maxLenght ? '#d32f2f' : '#666';
              }
            };
            
            editor.on('keyup change undo redo input', updateCounter);
            updateCounter(); // начальный вызов
          });
        }
      }}
    />
  );
};