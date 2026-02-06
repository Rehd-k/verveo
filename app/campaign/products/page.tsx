'use client';
import { useCampaignStore } from '@/store/useCampaignStore';
import clsx from 'clsx';

const PRODUCTS = [
    { id: 'cup', name: 'Disposable Cup', specs: '12oz • Double Wall', image: '/assets/cup.png' },
    { id: 'box', name: 'Food Box', specs: 'Recyclable Cardboard', image: '/assets/box.png' },
    { id: 'bag', name: 'Paper Bag', specs: 'Kraft • Reinforced', image: '/assets/bag.png' },
];

export default function ProductSelectionPage() {
    const { selectedProduct, setProduct, quantity, setQuantity } = useCampaignStore();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 max-w-400 mx-auto">
            {/* Main Grid */}
            <div className="lg:col-span-8 space-y-6">
                <h1 className="text-3xl font-bold">Select Your Packaging Base</h1>

                <div className="grid grid-cols-3 gap-4">
                    {PRODUCTS.map((product) => (
                        <button
                            key={product.id}
                            onClick={() => setProduct(product.id)}
                            className={clsx(
                                "p-4 rounded-xl border text-left transition-all relative overflow-hidden group",
                                selectedProduct === product.id
                                    ? "border-primary bg-surface-dark"
                                    : "border-border-dark hover:bg-surface-dark/50"
                            )}
                        >
                            {selectedProduct === product.id && (
                                <span className="absolute top-3 right-3 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    SELECTED
                                </span>
                            )}
                            <div className="aspect-square bg-[#333025] rounded-lg mb-3"></div>
                            <h3 className="font-bold text-sm">{product.name}</h3>
                            <p className="text-xs text-text-dim">{product.specs}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Sidebar Calculator */}
            <div className="lg:col-span-4">
                <div className="bg-surface-dark border border-border-dark rounded-xl p-6 sticky top-6">
                    <h3 className="text-xl font-bold mb-6">Order Details</h3>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm">Quantity</label>
                                <span className="text-primary font-mono font-bold">{quantity.toLocaleString()}</span>
                            </div>
                            <input
                                type="range"
                                min="1000"
                                max="100000"
                                step="1000"
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="w-full h-2 bg-bg-dark rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                        </div>

                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                            <p className="text-xs text-text-dim uppercase">Estimated Total</p>
                            <div className="text-3xl font-bold text-white">
                                ${(quantity * 0.45).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}