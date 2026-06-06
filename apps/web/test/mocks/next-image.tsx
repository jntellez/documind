export default function Image({ priority: _priority, src, ...props }: any) {
  const resolvedSrc = typeof src === "string" ? src : src?.src;

  return <img src={resolvedSrc} {...props} />;
}
