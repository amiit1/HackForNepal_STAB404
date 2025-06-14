
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquareText } from 'lucide-react'; // Changed from MessageCircle
import FloatingChatWindow from './FloatingChatWindow';
import { useTranslations } from '@/hooks/useTranslations';

export default function FloatingChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { t } = useTranslations();

  return (
    <>
      <Button
        variant="default"
        className="fixed right-6 bottom-20 sm:bottom-6 h-14 w-14 rounded-full shadow-xl z-[60]"
        onClick={() => setIsChatOpen(true)}
        aria-label={t('chatbot.openChatLabel')}
      >
        <MessageSquareText className="h-7 w-7" /> {/* Changed icon */}
      </Button>
      {isChatOpen && <FloatingChatWindow isOpen={isChatOpen} onOpenChange={setIsChatOpen} />}
    </>
  );
}
