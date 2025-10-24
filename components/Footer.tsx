export default function Footer() {
    return (
        <footer className="py-6 text-center bg-energy-black text-gray-500 border-t border-gray-800">
            <p>
                Contact EnergyWallet:{" "}
                <span className="text-energy-orange">support@energywallet.com</span> | +234 800 000 0000
            </p>
            <p className="mt-2 text-sm">© {new Date().getFullYear()} EnergyWallet. All rights reserved.</p>
        </footer>
    );
}
