import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bio Nature Cosméticos | Revenda Bio Extratus" },
      { name: "description", content: "Produtos Bio Extratus para revenda no Piauí e Sul do Maranhão." },
    ],
  }),
  component: PrimeiraDobra,
});

function PrimeiraDobra() {
  return <><Header /><main><Hero /></main></>;
}
