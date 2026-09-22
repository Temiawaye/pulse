export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
  <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h1>
      
      <p className="mt-1 text-sm text-[var(--muted)]">
        {description}
      </p>
    
    </div>
    
    {actions}
  
  </header>
  );
}
