'use client';
import { useState } from 'react';
import clsx from 'clsx';
// Ensure you install: npm install qrcode react-hot-toast
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

export default function ROIPage() {
    const [url, setUrl] = useState('');
    const [qrSrc, setQrSrc] = useState<string | null>(null);

    const generateQR = async () => {
        if (!url) return;
        try {
            const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
            setQrSrc(dataUrl);
            toast.success('QR Code Generated with UTM tags!');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-1 justify-center py-10 px-6 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full max-w-300">

                {/* Left Column: Input */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <h1 className="text-4xl md:text-5xl font-black leading-tight text-white">
                            Generate Your <br /> <span className="text-primary">Smart QR Code</span>
                        </h1>
                        <p className="text-text-dim text-lg max-w-lg">
                            Enter the destination for your campaign. We'll automatically append UTM parameters and tracking pixels so you can monitor ROI in real-time.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 mt-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-white text-base font-semibold">Destination URL</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-text-dim">link</span>
                                </div>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onBlur={generateQR}
                                    placeholder="https://www.myshop.com/summer-sale"
                                    className="w-full h-16 bg-surface-dark border border-border-dark rounded-xl pl-12 pr-4 text-white placeholder:text-text-dim/50 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>
                            <p className="text-text-dim/80 text-sm flex items-center gap-2 mt-2">
                                <span className="material-symbols-outlined text-base">info</span>
                                This unique code allows you to track real-time scans.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-auto pt-8">
                        <button className="h-12 px-6 rounded-lg border border-border-dark text-text-dim hover:bg-white/5 transition-colors font-medium">
                            Back
                        </button>
                        <button className="h-12 px-8 rounded-lg bg-primary text-bg-dark font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 flex items-center gap-2 transition-transform active:scale-95">
                            <span>Final Review</span>
                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                    <div className="relative w-full rounded-2xl bg-card-dark p-1 shadow-2xl border border-border-dark overflow-hidden">
                        {/* Glow Effects */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative bg-[#221f10] rounded-xl p-8 flex flex-col items-center text-center h-full min-h-112.5 justify-between">
                            <div className="w-full flex justify-between items-center mb-6">
                                <span className="text-xs font-bold uppercase tracking-widest text-text-dim/60">Live Preview</span>
                                <div className="flex gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                </div>
                            </div>

                            {/* QR Display */}
                            <div className="p-4 bg-white rounded-xl shadow-lg group relative cursor-pointer">
                                {qrSrc ? (
                                    <img src={qrSrc} alt="Generated QR" className="w-48 h-48 object-contain" />
                                ) : (
                                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                                        <span className="material-symbols-outlined text-4xl">qr_code_2</span>
                                    </div>
                                )}

                                {/* Hover */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-xl backdrop-blur-sm">
                                    <button className="bg-white text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                        Test Scan
                                    </button>
                                </div>
                            </div>

                            <div className="mt-8 w-full">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 mb-4">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-primary/20 p-2 rounded-md">
                                            <span className="material-symbols-outlined text-primary text-xl">qr_code_scanner</span>
                                        </div>
                                        <div className="flex flex-col items-start overflow-hidden">
                                            <span className="text-white text-sm font-semibold truncate">Campaign Asset #04</span>
                                            <span className="text-text-dim text-xs">High Res • PNG</span>
                                        </div>
                                    </div>
                                    <button className="text-text-dim hover:text-white">
                                        <span className="material-symbols-outlined">download</span>
                                    </button>
                                </div>
                                <p className="text-xs text-text-dim/50">Generated assets include vector SVG.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}