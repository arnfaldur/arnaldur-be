
import { Outlet } from "solid-start";

import Header from "~/components/Header";

export default function WritingLayout() {
  return (
    <div style={{ "max-width": "40rem", "margin": "auto" }}>
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
