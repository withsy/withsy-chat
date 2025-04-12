import type { ReactNode } from "react";
import Header from "./Header";
import Main from "./Main";
import Sidebar from "./sidebar/Sidebar";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 h-full">
        <Header /> {/* Header 컴포넌트 추가 */}
        <Main>{children}</Main>
      </div>
    </div>
  );
}
