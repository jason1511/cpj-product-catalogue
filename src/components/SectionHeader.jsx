function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
}) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-3xl ${alignment} ${className}`}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          {eyebrow}
        </p>
      )}

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
        {title}
      </h1>

      {description && (
        <p className="mt-5 text-base leading-7 text-slate-600">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;