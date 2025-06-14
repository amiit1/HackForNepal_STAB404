
import AppHeader from './AppHeader';
import BottomNavigationBar from './BottomNavigationBar';
import FloatingChatButton from '@/components/chatbot/FloatingChatButton';
import AdditionalFeaturesButton from './AdditionalFeaturesButton'; // Added import

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-8 pb-24"> {/* Added pb-24 for bottom nav space */}
        {children}
      </main>
      <BottomNavigationBar />
      <AdditionalFeaturesButton /> {/* Added new FAB */}
      <FloatingChatButton />
    </div>
  );
};

export default AppShell;
