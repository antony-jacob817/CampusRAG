import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Global Shift + Q listener active across the entire platform
  useEffect(() => {
    const handleGlobalKeyDown = async (e) => {
      // If typing inside an input or textarea, let the user type 'Q' normally
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isEditable = document.activeElement?.isContentEditable;
      if (activeTag === 'input' || activeTag === 'textarea' || isEditable) {
        return;
      }

      if (e.shiftKey && (e.key === 'Q' || e.key === 'q')) {
        e.preventDefault();
        
        const { user } = useAuthStore.getState();
        if (!user) {
          router.push('/login');
          return;
        }

        try {
          const { createThread } = useChatStore.getState();
          const newThread = await createThread('New Academic Query', 'all');
          const threadId = newThread._id || newThread.id;
          
          await router.push(`/chat/${threadId}`);
          
          // Focus the query prompt input automatically
          setTimeout(() => {
            const chatInput = document.getElementById('campus-query-input') || document.querySelector('textarea');
            chatInput?.focus();
          }, 150);
        } catch (err) {
          console.error('Failed to create academic thread on Shift+Q shortcut:', err);
          router.push('/chat');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [router]);

  return (
    <>
      <Head>
        <title>CampusRAG: Multi-Department Academic Assistant & Knowledge Engine</title>
        <meta name="description" content="Verifiable, hallucination-resistant answers to campus queries backed by official college documentation and vector memory." />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
