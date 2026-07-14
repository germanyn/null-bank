export function Placeholder({ title }: { title: string }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{title} content will be loaded here.</p>
    </div>
  );
}
