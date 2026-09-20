import { useMeeting, usePubSub } from '@videosdk.live/react-sdk';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { formatAMPM, nameTructed, cleanDisplayName } from '../../utils/helper';
import { Send } from 'lucide-react';

const extractMessageText = (msg) => {
  if (msg === null || msg === undefined) return '';
  if (typeof msg === 'string') {
    const trimmed = msg.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        return parsed.text || parsed.message || parsed.msg || msg;
      } catch {
        return msg;
      }
    }
    return msg;
  }
  if (typeof msg === 'object') {
    return msg.text || msg.message || msg.msg || '';
  }
  return String(msg);
};

const ChatMessage = ({ senderId, senderName, message, timestamp }) => {
  const mMeeting = useMeeting();
  const localParticipantId = mMeeting?.localParticipant?.id;
  const localUserId = mMeeting?.localParticipant?.metaData?.participantId;

  // Extract sender user ID if available
  let messageSenderUserId = null;
  if (typeof message === 'object' && message !== null) {
    messageSenderUserId = message.senderUserId;
  } else if (typeof message === 'string' && message.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(message);
      messageSenderUserId = parsed.senderUserId;
    } catch {}
  }

  const isLocal =
    senderId === localParticipantId ||
    (localUserId && messageSenderUserId && localUserId === messageSenderUserId);

  const text = extractMessageText(message);

  if (!text) return null;

  return (
    <div className={`flex ${isLocal ? 'justify-end' : 'justify-start'} my-2.5 max-w-full`}>
      <div
        className={`group relative flex flex-col py-2 px-3.5 max-w-[82%] sm:max-w-[75%] transition-all ${
          isLocal
            ? 'bg-gradient-to-br from-primary-600 via-primary-600 to-primary-700 text-white rounded-2xl rounded-tr-xs shadow-md shadow-primary-950/40 border border-primary-500/20'
            : 'bg-neutral-800/90 text-neutral-100 border border-neutral-700/70 rounded-2xl rounded-tl-xs shadow-md backdrop-blur-sm'
        }`}
      >
        {/* Only show sender name for incoming messages */}
        {!isLocal && (
          <p className="text-[11px] font-semibold text-primary-400 mb-0.5 tracking-wide select-none">
            {cleanDisplayName(senderName)}
          </p>
        )}

        {/* Message body */}
        <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed select-text font-normal">
          {text}
        </p>

        {/* Timestamp */}
        <div className={`flex items-center gap-1 mt-0.5 select-none ${isLocal ? 'justify-end text-primary-200/80' : 'justify-end text-neutral-400'}`}>
          <span className="text-[10px] font-medium tracking-tight">
            {formatAMPM(new Date(timestamp || Date.now()))}
          </span>
        </div>
      </div>
    </div>
  );
};

const ChatInput = () => {
  const mMeeting = useMeeting();
  const senderUserId = mMeeting?.localParticipant?.metaData?.participantId;
  const [message, setMessage] = useState('');
  const { publish } = usePubSub('CHAT');
  const inputRef = useRef();

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
      setMessage('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="w-full p-3 bg-neutral-950/80 border-t border-neutral-800/80 shrink-0 backdrop-blur-md">
      <div className="flex items-center gap-2 bg-neutral-900/90 rounded-2xl border border-neutral-700/70 focus-within:border-primary-500/80 focus-within:ring-1 focus-within:ring-primary-500/40 px-3 py-1.5 transition-all shadow-inner">
        <input
          type="text"
          className="flex-1 bg-transparent text-white placeholder-neutral-500 text-xs sm:text-sm py-1.5 border-none outline-none ring-0 focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0"
          style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
          placeholder="Type a message..."
          autoComplete="off"
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          type="button"
          disabled={!message.trim()}
          onClick={sendMessage}
          className={`rounded-xl p-2 transition-all duration-200 flex items-center justify-center shrink-0 ${
            message.trim()
              ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-500 hover:to-primary-600 shadow-md shadow-primary-900/30 active:scale-95 cursor-pointer'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-40'
          }`}
          aria-label="Send message"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const ChatMessages = () => {
  const listRef = useRef();
  const { messages } = usePubSub('CHAT');

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const validMessages = useMemo(() => {
    return (messages || []).filter((msg) => {
      const text = extractMessageText(msg?.message);
      return Boolean(text && text.trim().length > 0);
    });
  }, [messages]);

  return messages ? (
    <div
      ref={listRef}
      className="flex-1 min-h-0 overflow-y-auto px-3.5 py-2.5 bg-neutral-900 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800"
    >
      {validMessages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center py-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-600/20 to-primary-700/20 text-primary-400 border border-primary-500/30 shadow-lg mb-3">
            <Send className="h-6 w-6 text-primary" />
          </div>
          <p className="text-neutral-300 font-medium select-none">No messages yet</p>
          <p className="text-neutral-500 text-xs mt-1 select-none">Send a message to start the conversation!</p>
        </div>
      )}
      {validMessages.map((msg, i) => {
        const { senderId, senderName, message, timestamp } = msg;
        return (
          <ChatMessage
            key={`chat_item_${i}_${timestamp || i}`}
            senderId={senderId}
            senderName={senderName}
            message={message}
            timestamp={timestamp}
          />
        );
      })}
    </div>
  ) : (
    <div className="flex items-center justify-center flex-1 min-h-0 h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="text-center text-neutral-400 font-medium">Loading messages...</p>
      </div>
    </div>
  );
};

export function ChatPanel() {
  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 overflow-hidden">
      <ChatMessages />
      <ChatInput />
    </div>
  );
}
