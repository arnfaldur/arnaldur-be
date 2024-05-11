import { Outlet } from "solid-start";

import Header from "~/components/Header";

export default function ExplainingTheUrlLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
