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
  const [description, setDescription] = useState(defaultData.description || '');

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
    const url = atob(await file.text());
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
      editor.blocks.insert('gatedContentDelimiter');
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
      description,
    });
  }, [content, title, description]);

  useEffect(() => {
    if (error.title) {
      titleRef.current!.focus();
    }
    if (error.content) {
      editorjs!.caret.setToLastBlock('start', 0);
    }
  }, [error]);

  return (
    <div className="relative">
      <div className="relative">
        <div className="flex justify-center mt-2">
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <span
            ref={titleRef as LegacyRef<HTMLSpanElement>}
            contentEditable
            id="contenteditable-title"
            className="mt-4 block w-full border-none focus:ring-0 text-3xl p-0 font-bold bg-transparent leading-tight text-black dark:text-white resize-none cursor-text placeholder:text-gray-600"
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
        <div className="mb-8">
          <textarea
            className="block w-full bg-gray-50 dark:bg-dark-700 dark:placeholder-dark-400 dark:text-dark-100 !border-transparent focus:!border-transparent focus:!border-none focus:!outline-none focus:ring-0 text-sm rounded-md px-4 py-4 h-12 focus:h-72 max-h-[700px] overflow-y-scroll focus:outline-primary-500 line-clamp-1 focus:line-clamp-none transition-all duration-300 leading-7 focus:delay-100:leading-normal ease-out resize-none max-w-xl"
            id="description"
            value={description}
            placeholder={"Condition Resume"}
            onChange={(e: any) => {
              setDescription(e.target.value);
            }}
          />
        </div>

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

