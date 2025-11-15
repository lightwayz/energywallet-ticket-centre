"use client";

import Image from "next/image";

export default function DownloadApp() {
    return (
        <section className="py-20 text-center bg-[#ff8c3a]">

            <h2 className="text-3xl font-bold text-white">
                Download
            </h2>

            <h3 className="text-4xl font-extrabold text-white mt-2 mb-10">
                Energywallet
            </h3>

            <div className="flex items-center justify-center gap-6 flex-wrap">

                {/* APP STORE BOX */}
                <a
                    href="https://apps.apple.com/us/app/energywallet/id6737345961"
                    target="_blank"
                    className="hover:opacity-80 transition"
                >
                    <div className="w-[220px] h-[65px] bg-black rounded-xl flex items-center justify-center gap-3 px-4">
                        <img
                            src="/batches/Apple-grey-icon.png"
                            alt="Apple"
                            className="w-7 h-7 object-contain"
                        />
                        <div className="text-left leading-tight">
                            <p className="text-[10px] text-white">Download on the</p>
                            <p className="text-[16px] font-semibold text-white">App Store</p>
                        </div>
                    </div>
                </a>

                {/* GOOGLE PLAY BOX — MATCH SIZE */}
                <a
                    href="https://play.google.com/store/apps/details?id=com.energywalletng&hl=en"
                    target="_blank"
                    className="hover:opacity-80 transition"
                >
                    <div className="w-[220px] h-[65px] bg-black rounded-xl flex items-center justify-center gap-3 px-4">

                        {/* ★ Updated to your local icon */}
                        <img
                            src="/batches/google-play-16.png"
                            alt="Google Play"
                            className="w-7 h-7 object-contain"
                        />

                        <div className="text-left leading-tight">
                            <p className="text-[10px] text-white">GET IT ON</p>
                            <p className="text-[16px] font-semibold text-white">Google Play</p>
                        </div>
                    </div>
                </a>

            </div>

        </section>
    );
};
