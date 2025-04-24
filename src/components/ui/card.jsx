export function Card({ className = '', children }) {
    return (
      <div className={`rounded-2xl bg-white shadow-sm border p-6 ${className}`}>
        {children}
      </div>
    );
  }
  
  export function CardContent({ className = '', children }) {
    return (
      <div className={`text-sm text-gray-800 ${className}`}>
        {children}
      </div>
    );
  }
  