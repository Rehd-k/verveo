import ScrollReveal from './ScrollReveal';
import SectionHeader from './SectionHeader';

const PRODUCTS = [
  {
    name: 'Coffee Cups',
    price: '₦85',
    unit: 'per cup',
    description: 'Perfect for cafés, juice bars, and quick-service restaurants. High visibility during morning and afternoon consumption.',
    emoji: '☕',
  },
  {
    name: 'Food Boxes',
    price: '₦120',
    unit: 'per box',
    description: 'Ideal for fast-food chains and takeaway spots. Large surface area for bold creative and prominent QR placement.',
    emoji: '📦',
  },
  {
    name: 'Paper Bags',
    price: '₦95',
    unit: 'per bag',
    description: 'Customers carry your brand beyond the venue. Great for bakeries, grocery pickups, and retail food partners.',
    emoji: '🛍️',
  },
  {
    name: 'Pizza Boxes',
    price: '₦150',
    unit: 'per box',
    description: 'Premium canvas for family-size campaigns. Extended dwell time as meals are shared — more eyes on your brand.',
    emoji: '🍕',
  },
];

export default function PackagingSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <SectionHeader
            label="Packaging media"
            title="Advertise on what people already hold."
            description="Choose from four packaging formats distributed through retail partners nationwide. Each format is a premium touchpoint with built-in QR tracking."
          />
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {PRODUCTS.map((product, i) => (
            <ScrollReveal key={product.name} delay={i * 80}>
              <div className="group flex gap-5 rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-[0_0_40px_rgba(25,93,230,0.1)]">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-accent text-2xl transition group-hover:bg-primary/15">
                  {product.emoji}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <span className="text-sm font-bold text-primary">
                      {product.price}
                      <span className="font-normal text-muted-foreground"> {product.unit}</span>
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
