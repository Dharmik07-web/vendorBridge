import { type ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface MainLayoutProps {
  children: ReactNode
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="bg-surface dark:bg-inverse-surface min-h-screen">
      <Sidebar />
      <Header />
      <main className="ml-64 mt-16 p-margin-desktop">
        <div className="max-w-container-max">{children}</div>
      </main>
    </div>
  )
}

export default MainLayout
