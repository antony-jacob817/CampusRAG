import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import DepartmentSelector from '../../components/Chat/DepartmentSelector';
import ChatInput from '../../components/Chat/ChatInput';
import ChatMessage from '../../components/Chat/ChatMessage';
import CitationDrawer from '../../components/Chat/CitationDrawer';
import { useChatStore } from '../../store/chatStore';
import { Loader2 } from 'lucide-react';

export default function ThreadChatPage() {
  const router = useRouter();
  const { threadId } = router.query;
  const { 
    activeThread,
    messages, 
    isStreaming, 
    streamingText, 
    selectThread, 
    isLoadingMessages 
  } = useChatStore();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (threadId) {
      const currentActiveId = activeThread?._id || activeThread?.id;
      // If we are ALREADY on this thread and have active messages or stream, DO NOT re-fetch and wipe it!
      if (currentActiveId === threadId && (messages.length > 0 || isStreaming)) {
        return;
      }
      selectThread(threadId).then((res) => {
        if (res && res.success === false) {
          // If thread does not exist or belongs to another user, redirect cleanly to new chat
          router.replace('/chat');
        }
      });
    }
  }, [threadId, activeThread, messages.length, isStreaming, selectThread, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  return (
    <ProtectedRoute>
      <AppShell showSidebar={true}>
        <div className="relative flex-1 flex flex-col justify-between h-full max-w-5xl w-full mx-auto p-3 sm:p-4 md:p-6 overflow-hidden min-h-0">
          
          {/* Multi-Layered Ambient Studio Aurora Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#10B981]/18 via-[#10B981]/6 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
          <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-[#6366F1]/10 rounded-full blur-[130px] pointer-events-none -z-10" />

          {/* Top Segmented Department Domain Bar */}
          <div className="shrink-0 mb-3">
            <DepartmentSelector />
          </div>

          {/* Messages Scrollable Feed */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4 scrollbar-thin">
            {isLoadingMessages ? (
              <div className="h-full flex items-center justify-center py-20 text-[#059669] dark:text-[#10B981] space-x-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-bold">Loading conversation thread...</span>
              </div>
            ) : messages.length === 0 && !isStreaming ? (
              <div className="text-center py-20 text-[#64748B] dark:text-[#9CA3AF] text-xs">
                Ask a question below to start this conversation.
              </div>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <ChatMessage key={msg._id || msg.id || idx} message={msg} />
                ))}

                {/* Streaming Assistant Response */}
                {isStreaming && (
                  <ChatMessage
                    message={{
                      sender: 'ai',
                      text: streamingText,
                      wasGrounded: true,
                      confidenceScore: 0.94,
                      citations: [],
                    }}
                    isStreaming={true}
                  />
                )}
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Floating Query Input Bar */}
          <div className="shrink-0 pt-3 pb-1">
            <ChatInput />
          </div>

        </div>

        {/* Interactive Citation Drawer */}
        <CitationDrawer />
      </AppShell>
    </ProtectedRoute>
  );
}
