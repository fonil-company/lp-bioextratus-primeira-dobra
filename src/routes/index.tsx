import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bio Extratus para Lojistas | Bio Nature Cosm\u00e9ticos" },
      {
        name: "description",
        content: "Leve Bio Extratus para sua loja. Cat\u00e1logo e condi\u00e7\u00f5es comerciais para empresas com CNPJ no Piau\u00ed e Sul do Maranh\u00e3o.",
      },
    ],
  }),
  component: PrimeiraDobra,
});

function PrimeiraDobra() {
  return (
    <>
      <Header />
      <main>
        <Hero />
      </main>
    </>
  );
}
