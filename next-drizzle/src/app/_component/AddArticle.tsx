'use client';

import { useRef, useState } from 'react';
import { addArticleType } from '../_action/addArticle';
import { Button, Modal, Box, Typography, TextField } from '@mui/material';
import { User } from '@/db/schema/schema';

type CreateRandomUserButtomType = {
  addArticle: ({ title, content, userId }: addArticleType) => void;
  user: User;
};
function AddArticle({ addArticle, user }: CreateRandomUserButtomType) {
  const [open, setOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLInputElement | null>(null);
  return (
    <>
      <button
        className="bg-green-400 w-fit p-1 rounded border-2 border-transparent hover:border-black"
        onClick={() => setOpen(true)}
      >
        Add Article
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="size-[35%] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded">
          <div className="flex gap-4 flex-col relative size-full">
            <Typography
              className="text-blue-400"
              id="modal-modal-title"
              variant="h6"
              component="h2"
            >
              Add Article
            </Typography>
            <TextField
              size="small"
              id="outlined-basic"
              label="Fill the title"
              variant="outlined"
              inputRef={titleRef}
            />
            <TextField
              size="small"
              id="outlined-basic"
              label="Fill the content"
              variant="outlined"
              inputRef={contentRef}
            />
            <button
              className="bg-red-400 w-fit p-1 rounded border-2 border-transparent hover:border-black absolute bottom-0 right-0"
              onClick={() => {
                addArticle({
                  title: titleRef!.current?.value || '',
                  content: contentRef!.current?.value || '',
                  userId: user.id,
                });
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default AddArticle;
