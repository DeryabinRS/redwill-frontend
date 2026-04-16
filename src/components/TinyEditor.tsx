import { Editor } from '@tinymce/tinymce-react';
import type { Editor as TinyMCEEditor } from 'tinymce';
import { useRef } from 'react';
import type { InitOptions } from '@tinymce/tinymce-react/lib/cjs/main/ts/components/Editor';

interface TinyEditorProps {
  initialValue?: string;
  onChange?: (content: string) => void;
  disabled?: boolean;
  maxLenght?: number;
  init?: InitOptions;
}

export const TinyEditor: React.FC<TinyEditorProps> = ({ 
  initialValue = '', 
  onChange, 
  disabled = false,
  maxLenght = 1000,
  init,
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
        height: init?.height || 250,
        menubar: init?.menubar || false,
        language: init?.language || 'ru',
        language_url: '/tinymce/langs/ru.js',
        skin_url: '/tinymce/skins/ui/oxide',
        content_css: '/tinymce/skins/content/default/content.css',
        
        // 🔥 ДОБАВЛЕНО: плагин 'paste' обязателен для paste_preprocess
        plugins: init?.plugins ? `${init.plugins} paste` : 'paste',
        
        placeholder: 'Начните вводить текст...',
        initial_value: initialValue,
        
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
            updateCounter();
          });
        },
        ...init,
      }}
    />
  );
};