import { Banner } from "@/components/Banner";
import ClickSpark from "@/components/ClickSpark";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffdf5] text-slate-900 transition-colors duration-300">
      <ClickSpark
        sparkColor="#ffde00"
        sparkSize={25}
        sparkRadius={38}
        sparkCount={12}
        duration={400}
      >
        <Banner />
      </ClickSpark>
    </main>
  );
}
