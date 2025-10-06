import { useMeeting, usePubSub } from '@videosdk.live/react-sdk';
import React, { useEffect, useRef, useState } from 'react';
import { formatAMPM, json_verify, nameTructed } from '../../utils/helper';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

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
        className={`flex flex-col py-2 px-4 rounded-2xl max-w-xs sm:max-w-md ${
          localSender
            ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white'
            : 'bg-gray-700 text-white'
        }`}
      >
        <p className="text-xs opacity-70 mb-1 select-none">
          {localSender ? 'You' : nameTructed(senderName, 15)}
        </p>
        <p className="whitespace-pre-wrap break-words font-medium">{message.text}</p>
        <p className="text-xs italic mt-1 opacity-60 self-end select-none">
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
      className="w-full flex items-center px-4 bg-gray-800 rounded-b-2xl border-t border-gray-600"
      style={{ height: inputHeight }}
    >
      <input
        type="text"
        className="flex-1 py-3 px-4 text-white bg-gray-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-gray-400 text-base"
        placeholder="Write your message"
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
        className={`ml-3 rounded-full p-2 transition-transform duration-200 ${
          message.trim().length >= 2
            ? 'bg-indigo-600 hover:bg-indigo-700'
            : 'bg-gray-600 cursor-not-allowed'
        }`}
        aria-label="Send message"
      >
        <PaperAirplaneIcon className="w-6 h-6 rotate-90 text-white" />
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
      className="overflow-y-auto px-4 pt-4 bg-gray-900 rounded-t-2xl"
    >
      {messages.length === 0 && (
        <p className="text-center text-gray-500 mt-10 select-none">No messages yet</p>
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
    <p className="p-4 text-center text-gray-500">Loading messages...</p>
  );
};

export function ChatPanel({ panelHeight }) {
  const inputHeight = 60;
  const listHeight = panelHeight - inputHeight;

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-3xl shadow-lg border border-gray-700">
      <ChatMessages listHeight={listHeight} />
      <ChatInput inputHeight={inputHeight} />
    </div>
  );
}
