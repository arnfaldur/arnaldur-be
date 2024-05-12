import { createMemo } from "solid-js";
import { useLocation } from "@solidjs/router";
import { Title as SolidTitle } from "@solidjs/meta";

export default function Title() {
  const location = useLocation();
  const url = createMemo(() => "Arnaldur.be" + location.pathname);
  return <SolidTitle>{url()}</SolidTitle>;
}
