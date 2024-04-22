import { useState, useEffect } from 'react';
import EditorJS from '@editorjs/editorjs';
import ImageTool from '@editorjs/image';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Underline from '@editorjs/underline';
import DragDrop from 'editorjs-drag-drop';
import Undo from 'editorjs-undo';
import toast from 'react-hot-toast';
import Header from './EditorHeader';
// import { pinFileToIPFS, getIpfsUrl } from '../../services/ipfsService';

function Editor({
  defaultData,
}: any) {
  const [_, setEditorjs] = useState<EditorJS | undefined>();

  const initEditor = async () => {
    try {
      const editor = new EditorJS({
        data: defaultData,
        readOnly: true,
        tools: {
          header: {
            class: Header as any,
            inlineToolbar: true,
            config: {
              levels: [1, 2, 3],
              defaultLevel: 1,
              shortcut: 'CMD+SHIFT+H',
            },
          },
          image: {
            class: ImageTool,
            config: {
              types: 'image/png, image/gif, image/jpeg',
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered',
            },
          },
          quote: Quote,
          underline: Underline,
        },
        onReady: () => {
          // eslint-disable-next-line no-new
          new Undo({ editor });
          // eslint-disable-next-line no-new
          new DragDrop(editor);
        },
      });
      await editor.isReady;
      setEditorjs(editor);
    } catch (err) {
      console.error(err);
      //toast.error('Error initializing editor');
    }
  };

  useEffect(() => {
    initEditor();
  }, []);

  return (
    <div>
      <div style={{ width: "100%" }}>
        <div className="content col-span-full">
          <div id="editorjs" />
        </div>
      </div>
    </div>
  );
}

export default Editor;
