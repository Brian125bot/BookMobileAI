import Sidebar from '@/components/layout/Sidebar';
import Canvas from '@/components/canvas/Canvas';
import TopNav from '@/components/layout/TopNav';

export default function Home() {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden text-[#1a1a1a] bg-[#fdfcfb] font-sans antialiased">
      <TopNav />

      <main className="flex-1 flex overflow-hidden">
        <Sidebar />
        <Canvas />
      </main>
    </div>
  );
}
