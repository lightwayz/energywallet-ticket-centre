// app/page.tsx
import Header from "@/components/Header";
import EventSearch from "@/components/EventSearch";
import ReceiptOptions from "@/components/ReceiptOptions";
import DownloadApp from "@/components/DownloadApp";
import Footer from "@/components/Footer";

export default function Home() {
    return (
        <main className="min-h-screen bg-energy-dark text-white">
            <Header />

            <section className="container mx-auto px-4">
                {/* EventSearch runs independently here as a client component */}
                <EventSearch />
                <ReceiptOptions />
                <DownloadApp />
            </section>

            <Footer />
        </main>
    );
}
