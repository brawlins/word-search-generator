import WordSearchGenerator from "./components/WordSearchGenerator";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-0">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <WordSearchGenerator />
      </main>
    </div>
  );
}
