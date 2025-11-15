"use client";

import Image from "next/image";

export default function DownloadApp() {
    return (
        <section className="py-20 text-center bg-[#ff8c3a]">

            {/* HEADINGS */}
            <h2 className="text-3xl font-bold text-white">
                Download
            </h2>

            <h3 className="text-4xl font-extrabold text-white mt-2 mb-10">
                Energywallet
            </h3>

            {/* BUTTON BOXES */}
            <div className="flex items-center justify-center gap-6 flex-wrap">

                {/* APP STORE — PREMIUM BOX */}
                <a
                    href="https://apps.apple.com/us/app/energywallet/id6737345961"
                    target="_blank"
                    className="hover:scale-[1.03] transition-transform duration-300"
                >
                    <div className="
                        w-[230px] h-[70px]
                        rounded-2xl
                        bg-gradient-to-br from-[#1a1a1a] to-[#000000]
                        shadow-xl shadow-black/40
                        border border-white/10
                        flex items-center gap-4 px-5
                        backdrop-blur-md
                    ">
                        <img
                            src="/batches/Apple-grey-icon.png"
                            alt="Apple"
                            className="w-8 h-8 object-contain opacity-90"
                        />

                        <div className="text-left leading-tight">
                            <p className="text-[11px] text-gray-300">Download on the</p>
                            <p className="text-[18px] font-semibold text-white">App Store</p>
                        </div>
                    </div>
                </a>

                {/* GOOGLE PLAY — PREMIUM BOX */}
                <a
                    href="https://play.google.com/store/apps/details?id=com.energywalletng&hl=en"
                    target="_blank"
                    className="hover:scale-[1.03] transition-transform duration-300"
                >
                    <div className="
                        w-[230px] h-[70px]
                        rounded-2xl
                        bg-gradient-to-br from-[#1a1a1a] to-[#000000]
                        shadow-xl shadow-black/40
                        border border-white/10
                        flex items-center gap-4 px-5
                        backdrop-blur-md
                    ">
                        <img
                            src="/batches/googleplay.png"
                            alt="Google Play"
                            className="w-8 h-8 object-contain opacity-90"
                        />

                        <div className="text-left leading-tight">
                            <p className="text-[11px] text-gray-300">GET IT ON</p>
                            <p className="text-[18px] font-semibold text-white">Google Play</p>
                        </div>
                    </div>
                </a>

            </div>

        </section>
    );
}
