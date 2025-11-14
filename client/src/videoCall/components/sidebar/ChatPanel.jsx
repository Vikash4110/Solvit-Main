import { useMeeting, usePubSub } from '@videosdk.live/react-sdk';
import React, { useEffect, useRef, useState } from 'react';
import { formatAMPM, json_verify, nameTructed } from '../../utils/helper';
import { Send } from 'lucide-react';

const ChatMessage = ({ senderId, senderName, message, timestamp }) => {
  console.log(message);
  const mMeeting = useMeeting();
  const localParticipantId = mMeeting?.localParticipant?.metaData?.participantId;
  const localSender = localParticipantId === message.senderUserId;

  console.log(localParticipantId);
  console.log(message['senderUserId']);

  return (
    <div className={`flex ${localSender ? 'justify-end' : 'justify-start'} mt-4 max-w-full`}>
      <div
        className={`flex flex-col py-2.5 px-4 rounded-2xl max-w-xs sm:max-w-md shadow-lg transition-all hover:shadow-xl ${
          localSender
            ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white'
            : 'bg-neutral-800 text-white border border-neutral-700'
        }`}
      >
        <p className="text-xs font-semibold opacity-80 mb-1 select-none">
          {localSender ? 'You' : nameTructed(senderName, 15)}
        </p>
        <p className="whitespace-pre-wrap break-words font-medium text-sm leading-relaxed">
          {message.text}
        </p>
        <p className="text-xs italic mt-1.5 opacity-70 self-end select-none">
          {formatAMPM(new Date(timestamp))}
        </p>
      </div>
    </div>
  );
};

const ChatInput = ({ inputHeight }) => {
  const mMeeting = useMeeting();
  const senderUserId = mMeeting?.localParticipant?.metaData?.participantId;
  const [message, setMessage] = useState('');
  const { publish } = usePubSub('CHAT');
  const input = useRef();

  const sendMessage = () => {
    const messageText = message.trim();
    if (messageText.length > 0) {
      publish(
        {
          text: messageText,
          senderUserId,
        },
        { persist: true }
      );
      setTimeout(() => {
        setMessage('');
      }, 100);
      input.current?.focus();
    }
  };

  return (
    <div
      className="w-full flex items-center gap-3 px-4 bg-neutral-900 rounded-b-xl border-t border-neutral-700"
      style={{ height: inputHeight }}
    >
      <input
        type="text"
        className="flex-1 py-3 px-4 text-white bg-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 border border-neutral-700 placeholder-neutral-400 text-sm transition-all"
        placeholder="Write your message..."
        autoComplete="off"
        ref={input}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
      />
      <button
        type="button"
        disabled={message.trim().length < 2}
        onClick={sendMessage}
        className={`rounded-xl p-2.5 transition-all duration-200 shadow-lg ${
          message.trim().length >= 2
            ? 'bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover:scale-110 hover:shadow-xl hover:shadow-primary-500/30'
            : 'bg-neutral-700 cursor-not-allowed opacity-50'
        }`}
        aria-label="Send message"
      >
        <Send className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};

const ChatMessages = ({ listHeight }) => {
  const listRef = useRef();
  const { messages } = usePubSub('CHAT');
  console.log(messages);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return messages ? (
    <div
      ref={listRef}
      style={{ height: listHeight }}
      className="overflow-y-auto px-4 pt-4 bg-neutral-900 rounded-t-xl scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800"
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg mb-4">
            <Send className="h-8 w-8 text-white" />
          </div>
          <p className="text-center text-neutral-400 font-medium select-none">No messages yet</p>
          <p className="text-center text-neutral-500 text-sm mt-1 select-none">Start the conversation!</p>
        </div>
      )}
      {messages.map((msg, i) => {
        const { senderId, senderName, message, timestamp } = msg;
        return (
          <ChatMessage
            key={`chat_item_${i}`}
            senderId={senderId}
            senderName={senderName}
            message={message}
            timestamp={timestamp}
          />
        );
      })}
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="text-center text-neutral-400 font-medium">Loading messages...</p>
      </div>
    </div>
  );
};

export function ChatPanel({ panelHeight }) {
  const inputHeight = 60;
  const listHeight = panelHeight - inputHeight;

  return (
    <div className="flex flex-col h-full bg-neutral-900 rounded-xl shadow-2xl border border-neutral-800">
      <ChatMessages listHeight={listHeight} />
      <ChatInput inputHeight={inputHeight} />
    </div>
  );
}
