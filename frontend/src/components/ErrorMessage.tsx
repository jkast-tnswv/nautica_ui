export function ErrorMessage({ error, prefix = 'Error' }: { error: string; prefix?: string }) {
  return <div className="error-message">{prefix}: {error}</div>;
}
