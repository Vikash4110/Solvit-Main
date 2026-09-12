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
    <div className={`flex ${isLocal ? 'justify-end' : 'justify-start'} mt-3 max-w-full`}>
      <div
        className={`flex flex-col py-2 px-3.5 rounded-2xl max-w-[85%] sm:max-w-md shadow-md transition-all hover:shadow-lg ${
          isLocal
            ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-br-sm'
            : 'bg-neutral-800 text-white border border-neutral-700 rounded-bl-sm'
        }`}
      >
        <p className="text-xs font-semibold opacity-85 mb-1 select-none">
          {isLocal ? 'You' : cleanDisplayName(senderName)}
        </p>
        <p className="whitespace-pre-wrap break-words font-medium text-sm leading-relaxed">
          {text}
        </p>
        <p className="text-[11px] font-normal mt-1 opacity-75 self-end select-none">
          {formatAMPM(new Date(timestamp || Date.now()))}
        </p>
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
    <div className="w-full flex items-center gap-2.5 px-3.5 py-3 bg-neutral-900 border-t border-neutral-800 shrink-0">
      <input
        type="text"
        className="flex-1 py-2.5 px-3.5 text-white bg-neutral-800/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 border border-neutral-700 placeholder-neutral-400 text-sm transition-all"
        placeholder="Write your message..."
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
        className={`rounded-xl p-2.5 transition-all duration-200 shadow-md shrink-0 ${
          message.trim()
            ? 'bg-gradient-to-br from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 hover:scale-105 hover:shadow-primary-500/30 cursor-pointer'
            : 'bg-neutral-800 text-neutral-500 border border-neutral-700/50 cursor-not-allowed opacity-50'
        }`}
        aria-label="Send message"
      >
        <Send className="w-4 h-4 text-white" />
      </button>
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
