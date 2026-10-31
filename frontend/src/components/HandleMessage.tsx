type ErrorMessageProps = {
  message: string;
};

type SuccessMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
    >
      {message}
    </div>
  );
}

export function SuccessMessage({ message }: SuccessMessageProps) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
    >
      {message}
    </div>
  );
}
