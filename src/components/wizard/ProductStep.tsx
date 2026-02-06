'use client';

interface ProductStepProps {
  data: any;
  updateData: (data: any) => void;
}

const PRODUCTS = [
  {
    id: 'cup',
    name: 'Disposable Coffee Cup',
    size: '12oz',
    material: 'Biodegradable Kraft Paper',
    image: '☕',
    pricePerUnit: 85,
  },
  {
    id: 'box',
    name: 'Food Box (Standard)',
    size: 'Medium',
    material: 'Corrugated Cardboard',
    image: '📦',
    pricePerUnit: 120,
  },
  {
    id: 'bag',
    name: 'Paper Bag (Large)',
    size: 'Large',
    material: 'Kraft Paper',
    image: '🛍️',
    pricePerUnit: 95,
  },
  {
    id: 'pizza-box',
    name: 'Pizza Box',
    size: '14"',
    material: 'Corrugated Cardboard',
    image: '🍕',
    pricePerUnit: 150,
  },
];

export default function ProductStep({ data, updateData }: ProductStepProps) {
  const selectedProduct = PRODUCTS.find((p) => p.id === data.productType);
  const totalCost = data.quantity * (selectedProduct?.pricePerUnit || 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-white mb-4">Select Product</h3>
        <p className="text-white/60 mb-4">
          Choose the physical item where your ad will be printed
        </p>
        <div className="grid grid-cols-2 gap-4">
          {PRODUCTS.map((product) => (
            <button
              key={product.id}
              onClick={() => updateData({ productType: product.id })}
              className={`p-4 rounded-lg border transition-all text-left ${
                data.productType === product.id
                  ? 'border-primary bg-primary/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="text-3xl mb-2">{product.image}</div>
              <h4 className="font-bold text-white">{product.name}</h4>
              <p className="text-xs text-white/60 mt-1">{product.material}</p>
              <p className="text-sm text-primary font-semibold mt-2">
                ₦{product.pricePerUnit}/unit
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <h3 className="text-xl font-bold text-white mb-4">Quantity</h3>
        <p className="text-white/60 mb-4">
          How many units would you like to produce?
        </p>
        <div className="flex gap-4">
          <input
            type="range"
            min="100"
            max="100000"
            step="100"
            value={data.quantity}
            onChange={(e) => updateData({ quantity: parseInt(e.target.value) })}
            className="flex-1"
          />
          <input
            type="number"
            min="100"
            max="100000"
            value={data.quantity}
            onChange={(e) => updateData({ quantity: parseInt(e.target.value) })}
            className="w-32 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white"
          />
        </div>
        <p className="text-sm text-white/80 mt-4">
          {data.quantity.toLocaleString()} units
        </p>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <p className="text-sm text-white/80 mb-2">
          <span className="font-bold text-primary">Production Cost:</span>
        </p>
        <p className="text-2xl font-bold text-white">
          ₦{totalCost.toLocaleString()}
        </p>
        <p className="text-xs text-white/60 mt-2">
          {data.quantity.toLocaleString()} × ₦{selectedProduct?.pricePerUnit}
        </p>
      </div>
    </div>
  );
}
