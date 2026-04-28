import Sidebar from '@/components/Sidebar';
import Canvas from '@/components/Canvas';
import TopNav from '@/components/TopNav';

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
