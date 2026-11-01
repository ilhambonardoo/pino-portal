type AuthInputProps = {
  id: string;
  label: string;
  type: "text" | "password";
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

const AuthInput = ({
  id,
  label,
  type,
  value,
  placeholder,
  onChange,
}: AuthInputProps) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-neutral-300 mb-1"
      >
        {label}
      </label>

      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
      />
    </div>
  );
};

export default AuthInput;
