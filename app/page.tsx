import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeHeader } from "@/components/layout/home-header";
import { HomeFooter } from "@/components/layout/home-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#efefec] text-[#1f2333]">
      <main className="min-h-screen w-full border-y-4 border-[#6266f0] bg-[#f5f5f2] shadow-[0_22px_50px_rgba(17,24,39,0.12)] md:border-4">
        <HomeHeader />

        <section className="p-4 md:p-8">
          <div className="relative isolate overflow-hidden rounded-xl shadow-[0_30px_45px_rgba(7,10,22,0.28)]">
            <Image
              src="/hero-banner.svg"
              alt="A cozy private library with warm lighting"
              width={1600}
              height={900}
              priority
              className="h-[440px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#06152f]/95 via-[#0f2446]/70 to-transparent" />

            <div className="absolute left-0 top-0 flex h-full w-full max-w-xl flex-col justify-center p-6 text-[#f4efe8] md:p-10">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-[#d07242]">
                Curated Experiences
              </p>
              <h1 className="max-w-md text-4xl leading-[1.03] font-semibold tracking-tight text-white md:text-6xl">
                The Digital Private Library.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-[#d7dbdf] md:text-lg">
                Step away from the algorithm. Discover a hand-selected
                collection of timeless literature and contemporary
                masterpieces.
              </p>
              <Link
                href="/books"
                className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-[#9d3a1f] px-6 py-3 text-sm font-semibold text-[#f9f2ec] transition-colors hover:bg-[#812f18]"
              >
                Discover Your Next Favorite Book
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <HomeFooter />
      </main>
    </div>
  );
}
