import { create } from 'zustand';
import api from '../services/api';
import { streamChatMessage } from '../services/sse';

export const useChatStore = create((set, get) => ({
  threads: [],
  activeThread: null,
  messages: [],
  selectedDepartment: 'all',
  
  // Streaming state
  isStreaming: false,
  streamingText: '',
  streamingCitations: [],
  streamingConfidence: null,
  
  // Interactive citation viewer state
  selectedCitation: null,
  isCitationDrawerOpen: false,

  isLoadingThreads: false,
  isLoadingMessages: false,
  error: null,

  setSelectedDepartment: (dept) => set({ selectedDepartment: dept }),

  openCitationDrawer: (citation) => {
    set({
      selectedCitation: citation,
      isCitationDrawerOpen: true,
    });
  },

  closeCitationDrawer: () => {
    set({
      selectedCitation: null,
      isCitationDrawerOpen: false,
    });
  },

  // Fetch all chat threads
  fetchThreads: async () => {
    set({ isLoadingThreads: true, error: null });
    try {
      const res = await api.get('/chat/threads');
      if (res.data.success) {
        set({ threads: res.data.threads, isLoadingThreads: false });
      }
    } catch (err) {
      set({
        error: err.response?.data?.error || err.message,
        isLoadingThreads: false,
      });
    }
  },

  // Create a new thread
  createThread: async (title = 'New Academic Query', department = 'all') => {
    try {
      const res = await api.post('/chat/threads', { title, department });
      if (res.data.success) {
        const newThread = res.data.thread;
        set((state) => ({
          threads: [newThread, ...state.threads],
          activeThread: newThread,
          messages: [],
          selectedDepartment: department,
        }));
        return newThread;
      }
    } catch (err) {
      set({ error: err.response?.data?.error || err.message });
      throw err;
    }
  },

  // Select active thread and load messages
  selectThread: async (threadId) => {
    set({ isLoadingMessages: true, error: null });
    try {
      const res = await api.get(`/chat/threads/${threadId}`);
      if (res.data.success) {
        set({
          activeThread: res.data.thread,
          messages: res.data.messages || [],
          selectedDepartment: res.data.thread.department || 'all',
          isLoadingMessages: false,
          streamingText: '',
          isStreaming: false,
        });
      }
    } catch (err) {
      set({
        error: err.response?.data?.error || err.message,
        isLoadingMessages: false,
      });
    }
  },

  // Send message with real-time SSE streaming and optional file attachment
  sendMessageStream: async (queryText, attachment = null) => {
    let thread = get().activeThread;
    const department = get().selectedDepartment;

    if (!thread) {
      // Auto-create thread if none is selected
      const displayTitle = queryText || (attachment ? `Analysis: ${attachment.name}` : 'Academic Query');
      const title = displayTitle.length > 35 ? displayTitle.substring(0, 32) + '...' : displayTitle;
      thread = await get().createThread(title, department);
    }

    const threadId = thread._id || thread.id;

    // Auto-update thread title in sidebar if currently default
    const displayQuery = (queryText || (attachment ? `Analysis: ${attachment.name}` : '')).trim();
    const newTitle = displayQuery.length > 38 ? displayQuery.substring(0, 35) + '...' : displayQuery;

    if (newTitle && (thread.title === 'New Academic Query' || !thread.title)) {
      thread = { ...thread, title: newTitle };
    }

    // Optimistically add user message to UI with attachment info
    const tempUserMsg = {
      _id: `temp-${Date.now()}`,
      id: `temp-${Date.now()}`,
      threadId,
      sender: 'user',
      text: queryText || (attachment ? `Uploaded attachment: ${attachment.name}` : ''),
      attachment: attachment ? {
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        dataUrl: attachment.dataUrl || null,
      } : null,
      department,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      threads: state.threads.map((t) =>
        (t._id || t.id) === threadId ? { ...t, title: thread.title } : t
      ),
      activeThread: thread,
      messages: [...state.messages, tempUserMsg],
      isStreaming: true,
      streamingText: '',
      streamingCitations: [],
      streamingConfidence: null,
      error: null,
    }));

    const queryPayload = attachment 
      ? `[Attached Document: ${attachment.name} (${Math.round(attachment.size / 1024)} KB)]\n\n${queryText || 'Please analyze this attached document and verify its campus regulations.'}`
      : queryText;

    await streamChatMessage({
      threadId,
      text: queryPayload,
      department,
      onStart: (userMsg) => {
        // Replace temp msg with confirmed server userMsg
        if (userMsg) {
          set((state) => ({
            messages: state.messages.map((m) =>
              m._id === tempUserMsg._id ? userMsg : m
            ),
          }));
        }
      },
      onToken: (token) => {
        set((state) => ({
          streamingText: state.streamingText + token,
        }));
      },
      onComplete: (completeData) => {
        const finalAiMsg = completeData.message || {
          _id: `ai-${Date.now()}`,
          id: `ai-${Date.now()}`,
          threadId,
          sender: 'ai',
          text: get().streamingText,
          confidenceScore: completeData.confidenceScore || 0.9,
          wasGrounded: completeData.wasGrounded !== false,
          citations: completeData.citations || [],
          department: completeData.department || department,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, finalAiMsg],
          isStreaming: false,
          streamingText: '',
          streamingCitations: [],
          streamingConfidence: null,
        }));

        // Refresh threads list in background to update lastMessage
        get().fetchThreads();
      },
      onError: (err) => {
        set({
          isStreaming: false,
          error: `Error generating answer: ${err.message}`,
        });
      },
    });
  },

  // Edit existing user message, remove subsequent responses, and regenerate answer
  editMessageStream: async (messageId, newQueryText, attachment = null) => {
    let thread = get().activeThread;
    const department = get().selectedDepartment;
    if (!thread) return;

    const threadId = thread._id || thread.id;
    const currentMessages = get().messages;
    const msgIndex = currentMessages.findIndex((m) => (m._id === messageId || m.id === messageId));

    if (msgIndex === -1) {
      return get().sendMessageStream(newQueryText, attachment);
    }

    const updatedUserMsg = {
      ...currentMessages[msgIndex],
      text: newQueryText,
      attachment: attachment || currentMessages[msgIndex].attachment || null,
      updatedAt: new Date().toISOString(),
    };

    // Keep messages up to the edited prompt, removing the previous answer and later turns
    const truncatedMessages = [...currentMessages.slice(0, msgIndex), updatedUserMsg];

    // If first message in thread was edited, update title
    const displayQuery = newQueryText.trim();
    const newTitle = displayQuery.length > 38 ? displayQuery.substring(0, 35) + '...' : displayQuery;
    if (msgIndex === 0 && newTitle) {
      thread = { ...thread, title: newTitle };
    }

    set((state) => ({
      threads: state.threads.map((t) =>
        (t._id || t.id) === threadId ? { ...t, title: thread.title } : t
      ),
      activeThread: thread,
      messages: truncatedMessages,
      isStreaming: true,
      streamingText: '',
      streamingCitations: [],
      streamingConfidence: null,
      error: null,
    }));

    const queryPayload = attachment 
      ? `[Attached Document: ${attachment.name} (${Math.round(attachment.size / 1024)} KB)]\n\n${newQueryText || 'Please analyze this attached document and verify its campus regulations.'}`
      : newQueryText;

    await streamChatMessage({
      threadId,
      text: queryPayload,
      department,
      onStart: () => {},
      onToken: (token) => {
        set((state) => ({
          streamingText: state.streamingText + token,
        }));
      },
      onComplete: (completeData) => {
        const finalAiMsg = completeData.message || {
          _id: `ai-${Date.now()}`,
          id: `ai-${Date.now()}`,
          threadId,
          sender: 'ai',
          text: get().streamingText,
          confidenceScore: completeData.confidenceScore || 0.9,
          wasGrounded: completeData.wasGrounded !== false,
          citations: completeData.citations || [],
          department: completeData.department || department,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, finalAiMsg],
          isStreaming: false,
          streamingText: '',
          streamingCitations: [],
          streamingConfidence: null,
        }));

        get().fetchThreads();
      },
      onError: (err) => {
        set({
          isStreaming: false,
          error: `Error generating answer: ${err.message}`,
        });
      },
    });
  },

  // Submit feedback
  submitFeedback: async (messageId, feedback, comment = null) => {
    try {
      await api.post(`/chat/messages/${messageId}/feedback`, { feedback, comment });
      set((state) => ({
        messages: state.messages.map((m) =>
          (m._id === messageId || m.id === messageId)
            ? { ...m, feedback, feedbackComment: comment }
            : m
        ),
      }));
    } catch (err) {
      console.warn('Failed to submit feedback:', err);
    }
  },

  // Delete thread
  deleteThread: async (threadId) => {
    try {
      await api.delete(`/chat/threads/${threadId}`);
      set((state) => {
        const updatedThreads = state.threads.filter((t) => (t._id || t.id) !== threadId);
        const isActive = state.activeThread && (state.activeThread._id || state.activeThread.id) === threadId;
        return {
          threads: updatedThreads,
          activeThread: isActive ? null : state.activeThread,
          messages: isActive ? [] : state.messages,
        };
      });
    } catch (err) {
      set({ error: err.response?.data?.error || err.message });
    }
  },

  clearError: () => set({ error: null }),
}));
