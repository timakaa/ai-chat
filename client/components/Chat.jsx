import React from "react";
import Dialog from "./Dialog";
import InputForm from "./InputForm";

const Chat = () => {
  return (
    <div className='flex-1 flex flex-col justify-between'>
      <header className='md:hidden relative py-4 font-bold bg-black text-center text-2xl'>
        APHOS AI
      </header>
      <Dialog />
      <InputForm />
    </div>
  );
};

export default Chat;
