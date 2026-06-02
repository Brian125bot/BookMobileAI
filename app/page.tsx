import Sidebar from '@/components/layout/Sidebar';
import Canvas from '@/components/canvas/Canvas';
import TopNav from '@/components/layout/TopNav';
import ToastContainer from '@/components/layout/ToastContainer';

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden text-[#1a1a1a] bg-gradient-to-b from-[#fdfcfb] via-[#faf8f5]/85 to-[#fbf9f6] font-sans antialiased">
      <TopNav />

      <main className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Canvas />
      </main>

      <ToastContainer />
    </div>
  );
}
