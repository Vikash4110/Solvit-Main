import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Trash2,
  Clock,
  CheckSquare,
  List,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export const NotesPanel = ({ bookingId }) => {
  const storageKey = `live_session_notes_${bookingId || 'current'}`;

  const [notes, setNotes] = useState(() => {
    try {
      return sessionStorage.getItem(storageKey) || '';
    } catch {
      return '';
    }
  });

  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'
  const [copied, setCopied] = useState(false);
  const saveTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  // Autosave to sessionStorage with debouncing
  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        sessionStorage.setItem(storageKey, val);
      } catch (err) {
        console.error('Failed to autosave notes to sessionStorage:', err);
      }
      setSaveStatus('saved');
    }, 300);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Quick insertion helper
  const insertTextAtCursor = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = notes;
    const selectedText = currentVal.substring(start, end);

    const isStartOfLine = start === 0 || currentVal.charAt(start - 1) === '\n';
    const finalPrefix = isStartOfLine ? prefix : `\n${prefix}`;

    const newVal =
      currentVal.substring(0, start) +
      finalPrefix +
      selectedText +
      suffix +
      currentVal.substring(end);

    setNotes(newVal);
    setSaveStatus('saving');

    try {
      sessionStorage.setItem(storageKey, newVal);
    } catch (err) {
      console.error('Storage error:', err);
    }

    setTimeout(() => {
      setSaveStatus('saved');
      textarea.focus();
      const newCursorPos = start + finalPrefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  const handleCopyNotes = async () => {
    if (!notes.trim()) {
      toast.info('Notes are empty');
      return;
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(notes);
      } else {
        const temp = document.createElement('textarea');
        temp.value = notes;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
      }
      setCopied(true);
      toast.success('Notes copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy notes');
    }
  };

  const handleClearNotes = () => {
    if (!notes.trim()) return;
    if (window.confirm('Are you sure you want to clear your in-session notes?')) {
      setNotes('');
      try {
        sessionStorage.removeItem(storageKey);
      } catch (err) {}
      setSaveStatus('saved');
      toast.info('Notes cleared');
    }
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;
  const charCount = notes.length;

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 overflow-hidden select-text">
      {/* Top Banner: Confidentiality & Real-time Auto-save Indicator */}
      <div className="px-3.5 py-2.5 bg-neutral-950/70 border-b border-neutral-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-medium text-neutral-300 truncate">
            Counselor Private Draft
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
              saveStatus === 'saved'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                saveStatus === 'saved' ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            {saveStatus === 'saved' ? 'Autosaved' : 'Saving...'}
          </span>
        </div>
      </div>

      {/* Quick Formatting Helpers Toolbar */}
      <div className="px-3 py-1.5 bg-neutral-900 border-b border-neutral-800/80 flex items-center justify-between gap-1 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertTextAtCursor('• ')}
            className="text-[11px] px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1 transition"
            title="Insert Bullet Point"
          >
            <List className="w-3 h-3 text-primary-400" />
            <span>Bullet</span>
          </button>

          <button
            type="button"
            onClick={() => insertTextAtCursor('[ ] ')}
            className="text-[11px] px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1 transition"
            title="Insert Action Item"
          >
            <CheckSquare className="w-3 h-3 text-emerald-400" />
            <span>Action</span>
          </button>

          <button
            type="button"
            onClick={() => insertTextAtCursor('📅 Follow-up: ')}
            className="text-[11px] px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1 transition"
            title="Insert Follow-up Reminder"
          >
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>Follow-up</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleCopyNotes}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition"
            title="Copy Notes to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleClearNotes}
            className="p-1.5 rounded bg-neutral-800 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 transition"
            title="Clear Notes"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Minimalist Notes Notepad Textarea */}
      <div className="flex-1 min-h-0 p-3 flex flex-col relative">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={handleNotesChange}
          placeholder="Take session notes, client observations, homework, or action items here...

Everything you write is autosaved in real-time and will automatically carry over to your post-session notes summary when the meeting ends."
          className="flex-1 w-full h-full bg-transparent text-xs sm:text-sm text-neutral-100 placeholder-neutral-500/80 resize-none border-none outline-none ring-0 shadow-none focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0 leading-relaxed font-sans scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
          style={{ outline: 'none', boxShadow: 'none', border: 'none' }}
          autoFocus
          spellCheck="true"
        />
      </div>

      {/* Bottom Footer: Stats & Carry-over Notice */}
      <div className="px-3.5 py-2 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between text-[10.5px] text-neutral-400 shrink-0">
        <span className="flex items-center gap-1 text-primary-400/90 truncate">
          <Sparkles className="w-3 h-3" />
          Transfers to post-session screen
        </span>

        <span className="font-mono text-neutral-500">
          {wordCount} words · {charCount} chars
        </span>
      </div>
    </div>
  );
};

export default NotesPanel;
