export function Button({ children, onClick, type = "button", className = "" }) {
    return (
      <button
        type={type}
        onClick={onClick}
        className={`inline-flex items-center justify-center rounded-2xl bg-black px-4 py-2 text-white hover:bg-gray-800 transition ${className}`}
      >
        {children}
      </button>
    );
  }
  