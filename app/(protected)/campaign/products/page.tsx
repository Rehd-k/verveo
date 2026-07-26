'use client';
import { useCampaignStore } from '@/store/useCampaignStore';
import clsx from 'clsx';
import { Layers2, MoveLeft, MoveRight, Rotate3d, RulerDimensionLine, Sprout, ZoomIn } from 'lucide-react';
import Image from 'next/image';

const PRODUCTS = [
    {
        id: '1',
        name: 'Disposable Cup',
        specs: '12oz • Double Wall',
        eco: "biodegradable",
        dimensions: '10" x 5" x 14"',
        image: '/assets/cup.png',
        link: '120gsm Kraft',
        pricePerUnit: 400,
    },
    {
        id: '2',
        name: 'Food Box',
        specs: 'Recyclable Cardboard',
        eco: "biodegradable",
        dimensions: '10" x 5" x 14"',
        image: '/assets/box.png',
        link: '120gsm Kraft',
        pricePerUnit: 450,
    },
    {
        id: '3',
        name: 'Paper Bag',
        specs: 'Kraft • Reinforced',
        eco: "biodegradable",
        dimensions: '10" x 5" x 14"',
        image: '/assets/bag.png',
        link: '120gsm Kraft',
        pricePerUnit: 200,
    },
    {
        id: '4',
        name: 'Takeaway Box',
        eco: "Not Eco Friendly",
        dimensions: '10" x 5" x 14"',
        specs: 'Kraft • Plastic',
        image: '/assets/takeaway.jpg',
        link: '120gsm Kraft',
        pricePerUnit: 490,
    },
];

interface LocationStepProps {
    data: any;
    updateData: (data: any) => void;
    nextStage: () => void;
    prevStage: () => void;
}

export default function ProductSelectionPage({ nextStage, prevStage, updateData }: LocationStepProps) {
    const { selectedProduct, setProduct, quantity, setQuantity, designConfig } = useCampaignStore();

    const handleNext = () => {
        if (selectedProduct && updateData) {
            updateData({
                productType: designConfig.productType as 'cup' | 'box' | 'bag' | 'pizza-box',
                budget: quantity * (selectedProduct.pricePerUnit || 0),
                quantity,
            });
        }
        nextStage();
    };

    return (


        <div className="flex flex-col max-w-300 flex-1 mx-auto">

            {/* Progress Bar */}
            {/* <div className="flex flex-col gap-3 p-4 pb-6">
                <div className="flex gap-6 justify-between items-end">
                    <p className="text-foreground text-base font-medium leading-normal">
                        Step B: Product Selection
                    </p>
                    <p className="text-text-dim text-sm font-normal leading-normal">
                        2 of 4
                    </p>
                </div>
                <div className="rounded-full bg-[#393728] h-2 w-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: "50%" }}
                    />
                </div>
            </div> */}
            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 pt-0">
                {/* Left Column: Inventory Grid & Preview */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Page Heading */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-foreground tracking-tight text-sm md:text-2xl lg:text-2xl font-bold leading-tight">
                            Select Your Packaging Base
                        </h1>
                        <p className="text-text-dim md:text-sm text-xs font-normal leading-normal">
                            Choose a high-quality inventory item to begin your design.
                        </p>
                    </div>
                    {/* Inventory Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {/* Item 1 */}
                        {PRODUCTS.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => setProduct(product)}
                                className={clsx(
                                    "p-4 rounded-xl border text-left transition-all relative overflow-hidden group",
                                    selectedProduct?.id === product.id
                                        ? "border-primary bg-card"
                                        : "border-border hover:bg-card"
                                )}
                            >
                                {selectedProduct?.id === product.id && (
                                    <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full z-50">
                                        SELECTED
                                    </span>
                                )}

                                <div className="aspect-square bg-[#333025] rounded-lg mb-3 relative">
                                    <Image src={product.image} alt={product.name} fill className='object-contain rounded-lg' />
                                </div>
                                <h3 className="font-bold text-sm">{product.name}</h3>
                                <p className="text-xs text-text-dim">{product.specs}</p>


                            </button>))}

                    </div>
                    {/* 3D Expansion / Selected Preview Card */}
                    <div className="@container">
                        <div className="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-start shadow-lg bg-card border border-border overflow-hidden">
                            <div className="relative w-full aspect-video @xl:w-2/3 bg-overlay group">
                                <Image src={selectedProduct?.image || '/assets/placeholder.png'} alt={selectedProduct?.name || 'Select a product'} fill className='object-contain p-6' />
                                {/* Overlay Controls */}
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    <button className="size-8 rounded bg-overlay hover:bg-overlay flex items-center justify-center text-foreground backdrop-blur-sm transition-colors">
                                        <Rotate3d />
                                    </button>
                                    <button className="size-8 rounded bg-overlay hover:bg-overlay flex items-center justify-center text-foreground backdrop-blur-sm transition-colors">
                                        <ZoomIn />
                                    </button>
                                </div>
                                <div className="absolute top-4 right-4 bg-overlay backdrop-blur text-xs font-mono text-primary px-2 py-1 rounded">
                                    LIVE PREVIEW
                                </div>
                            </div>
                            <div className="flex w-full grow flex-col items-stretch justify-center gap-4 py-6 px-6 @xl:w-1/3 border-l border-border bg-[#27251b]">
                                <div>
                                    <h3 className="text-foreground text-lg font-bold leading-tight">
                                        Expanded View
                                    </h3>
                                    <p className="text-text-dim text-sm mt-1">
                                        Interact with the model to inspect seams and folding
                                        points.
                                    </p>
                                </div>
                                <div className="h-px w-full bg-border-dark" />
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-sm text-foreground capitalize">
                                        <Sprout className='size-4' />
                                        <span>{selectedProduct?.eco || 'Select A Product'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <RulerDimensionLine className='size-4' />
                                        <span>{selectedProduct?.dimensions || 'Select A ProductA'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <Layers2 className='size-4' />
                                        <span>{selectedProduct?.specs || 'N/A'}</span>
                                    </div>
                                </div>
                                <button className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-lg h-9 px-4 border border-border bg-transparent hover:bg-accent text-foreground text-sm font-medium transition-colors">
                                    View Full Specs
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Right Column: Sidebar Calculator */}
                <div className="lg:col-span-4">
                    <div className="sticky top-24 flex flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-xl">
                        <div>
                            <h3 className="text-foreground text-xl font-bold">Order Details</h3>
                            <p className="text-text-dim text-sm mt-1">
                                Configure quantity to estimate cost
                            </p>
                        </div>
                        {/* Specs Summary */}
                        <div className="rounded-lg bg-background p-4 border border-border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-text-dim text-xs uppercase tracking-wider font-semibold">
                                    Base Item
                                </span>
                            </div>
                            <p className="text-foreground font-medium">
                                {selectedProduct?.name || 'Select a product'}
                            </p>
                            <p className="text-text-dim text-sm">
                                {selectedProduct?.specs || 'Select a product'}
                            </p>
                        </div>
                        {/* Calculator */}
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-end">
                                    <label className="text-foreground text-sm font-medium">
                                        Quantity
                                    </label>
                                    <span className="text-primary font-mono font-bold text-lg">
                                        {quantity.toLocaleString()}
                                    </span>
                                </div>

                                <input
                                    type="range"
                                    min="100"
                                    max="100000"
                                    step="100"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                    className="flex-1"
                                />
                                <div className="flex justify-between text-xs text-text-dim font-mono">
                                    <span>1k</span>
                                    <span>100k</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 border-t border-dashed border-border pt-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-dim">Unit Price</span>
                                    <span className="text-foreground">₦{selectedProduct?.pricePerUnit || 0}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-dim">Bulk Discount</span>
                                    <span className="text-primary">-12%</span>
                                </div>
                            </div>
                            <div className="rounded-lg bg-primary/10 p-4 border border-primary/20">
                                <p className="text-text-dim text-xs mb-1">Estimated Total</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-foreground">
                                        ₦{(quantity * Number(selectedProduct?.pricePerUnit || 0)).toLocaleString()}
                                    </span>
                                    <span className="text-lg text-text-dim">.00</span>
                                </div>
                            </div>
                        </div>
                        {/* Navigation Actions */}
                        <div className="flex flex-col gap-3 mt-2">
                            <button className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary text-primary-foreground text-base font-bold shadow hover:bg-[#d9ba0b] transition-colors" onClick={handleNext}>
                                Next: Customization
                                <MoveRight className="ml-2 size-4" />
                            </button>
                            <button className="flex w-full cursor-pointer items-center justify-center rounded-lg h-10 px-6 text-text-dim hover:text-foreground text-sm font-medium transition-colors" onClick={prevStage}>
                                <MoveLeft className="mr-2 size-4" />
                                Back to Previous Step
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >


    );
}