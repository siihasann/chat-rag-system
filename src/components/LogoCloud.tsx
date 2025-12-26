const logos = [
  "Northwind Capital",
  "Arcadia Health",
  "Atlas Legal",
  "Skyline Ventures",
  "Fieldstone Labs",
  "Crescent Bank",
];

const LogoCloud = () => {
  return (
    <section className="py-12">
      <div className="container px-4 mx-auto">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground text-center">
          Trusted by modern teams
        </p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center text-sm font-semibold text-muted-foreground">
          {logos.map((logo) => (
            <div key={logo} className="rounded-full border border-border/70 bg-background/70 py-3 px-4">
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogoCloud;
