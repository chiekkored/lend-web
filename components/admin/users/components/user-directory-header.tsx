type UserDirectoryHeaderProps = {
  description: string;
  title: string;
};

export function UserDirectoryHeader({ description, title }: UserDirectoryHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-normal">{title}</h2>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
