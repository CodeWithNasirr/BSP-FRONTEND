// components/AdvancedPage.jsx
import { Link } from "react-router-dom";
import { MdViewCarousel } from "react-icons/md";
import { Workflow, Utensils } from "lucide-react";

export default function AdvancedPage() {
  const items = [
    { name: "Orders", icon: <Utensils size={30} />, path: "/orders" },
    { name: "Catalogs", icon: <MdViewCarousel size={30} />, path: "/meta-catalog-setup" },
    { name: "Segment", icon: <Workflow size={30} />, path: "/Segment" },
  ];

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
      {items.map((item, i) => (
        <Link
          key={i}
          to={item.path}
          className="p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition flex flex-col items-center justify-center text-center"
        >
          <div className="mb-3 text-indigo-600">{item.icon}</div>
          <h3 className="text-lg font-semibold">{item.name}</h3>
        </Link>
      ))}
    </div>
  );
}
