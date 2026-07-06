import Header from './Header';
import Footer from './Footer';
import AuthGate from './AuthGate';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell flex flex-col bg-gray-50">
      <Header />
      <main className="app-main flex-grow">
        <AuthGate>{children}</AuthGate>
      </main>
      <Footer />
    </div>
  );
}
