import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden w-64 border-r md:block">
        <Sidebar />
      </div>
      <div className="flex-1">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}