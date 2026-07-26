interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
}

export default function SectionHeader({
  label,
  title,
  description,
  align = 'left',
}: SectionHeaderProps) {
  const alignClass = align === 'center' ? 'mx-auto text-center' : '';

  return (
    <div className={`max-w-2xl ${alignClass}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/90">{label}</p>
      <h2 className="mt-3 text-2xl font-semibold sm:text-3xl md:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-sm text-muted-foreground sm:text-base">{description}</p>
      )}
    </div>
  );
}
