import { useState, useEffect, useRef, MutableRefObject, LegacyRef } from 'react';
import EditorJS from '@editorjs/editorjs';
import ImageTool from '@editorjs/image';
import List from '@editorjs/list';
import Quote from '@editorjs/quote';
import Underline from '@editorjs/underline';
import DragDrop from 'editorjs-drag-drop';
import Undo from 'editorjs-undo';
import toast from 'react-hot-toast';
import Header from './EditorPlugin/Header';
// import { pinFileToIPFS, getIpfsUrl } from '../../services/ipfsService';

function Editor({
  onUpdate,
  defaultData,
  setError,
  error,
}: any) {
  const [content, setContent] = useState(defaultData.content);
  const [title, setTitle] = useState(defaultData.title);
  const [editorjs, setEditorjs] = useState<EditorJS | undefined>();
  const titleRef: MutableRefObject<HTMLSpanElement | undefined> = useRef();

  const saveContent = async (api: any) => {
    const editorData = await api.saver.save();
    setContent(editorData);
    if (editorData.blocks.length) {
      setError({
        ...error,
        content: false,
      });
    }
  };

  const uploadImage = async (file: File) => {
    //const cid = await pinFileToIPFS(file);
    //const url = getIpfsUrl(`ipfs://${cid.toString()}`);
    //TODO: Save the article in somewhere
    const url = URL.createObjectURL(file);
    return {
      success: 1,
      file: {
        url,
      },
    };
  };

  const initEditor = async () => {
    try {
      const editor = new EditorJS({
        onChange: saveContent,
        data: defaultData.content,
        placeholder: 'Write your story here',
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
              uploader: {
                uploadByFile: uploadImage,
              },
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
      toast.error('Error initializing editor');
    }
  };

  useEffect(() => {
    initEditor();
  }, []);

  useEffect(() => {
    onUpdate({
      ...defaultData,
      title,
      content,
    });
  }, [content, title]);

  useEffect(() => {
    if (error.title) {
      titleRef.current!.focus();
    }
    if (error.content) {
      editorjs!.caret.setToLastBlock('start', 0);
    }
  }, [error]);

  return (
    <div>
      <div style={{ width: "100%" }}>
        <div style={{ width: "100%" }}>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <span
            ref={titleRef as LegacyRef<HTMLSpanElement>}
            contentEditable
            id="contenteditable-title"
            style={{ width: "100%" }}
            placeholder="Write your title"
            onInput={(e) => {
              setTitle(e.currentTarget.textContent);
              setError((err: any) => ({ ...err, title: false }));
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                editorjs!.caret.setToLastBlock('start', 0);
              }
            }}
          />
        </div>
        {error.title && (
          <p className="text-sm text-red-600">You need to write a title.</p>
        )}
        <div className="content col-span-full">
          <div id="editorjs" />
        </div>
        {error.content && (
          <div className="flex justify-center prose">
            <p className="-mt-2 text-sm text-red-600">
              You need to write some content.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Editor;

