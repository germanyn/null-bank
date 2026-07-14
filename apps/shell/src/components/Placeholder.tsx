interface Props {
  title: string;
}

export function Placeholder({ title }: Props) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{title} content will be loaded here.</p>
    </div>
  );
}
