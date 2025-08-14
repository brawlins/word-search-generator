import WordSearchGenerator from "./components/WordSearchGenerator";

export default function Home() {
  return (
    <main className="flex flex-col items-center sm:items-start min-h-screen bg-slate-900">
      <WordSearchGenerator />
    </main>
  );
}
