
import { Tabs} from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DownloadIcon, IndianRupeeIcon } from "lucide-react";

const clients = [
  {
    name: "Client A",
    wabaId: "WABA123456",
    usage: 245,
    cost: 196,
    invoiceMonth: "April",
    upiRef: "UPI123456",
  },
  {
    name: "Client B",
    wabaId: "WABA7891011",
    usage: 610,
    cost: 480,
    invoiceMonth: "April",
    upiRef: "UPI987654",
  },
];



const currentContent = (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
    {clients.map((client, index) => (
      <Card key={index} className="shadow-xl rounded-2xl">
        <CardContent className="p-4 space-y-2">
          <h2 className="text-xl font-semibold">{client.name}</h2>
          <p className="text-sm text-gray-600">WABA ID: {client.wabaId}</p>
          <div className="flex justify-between items-center text-sm">
            <span>Conversations: {client.usage}</span>
            <span className="flex items-center">
              <IndianRupeeIcon className="w-4 h-4 mr-1" />
              {client.cost.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-500">Invoice: {client.invoiceMonth}</p>
          <p className="text-xs text-gray-500">UPI Ref: {client.upiRef}</p>
          <Button className="w-full mt-2" variant="secondary">
            <DownloadIcon className="w-4 h-4 mr-2" /> Download Invoice
          </Button>
        </CardContent>
      </Card>
    ))}
  </div>
);

const historyContent = (
  <p className="text-gray-600 mt-4">Billing history and past invoices will appear here.</p>
);

export default function BillingDashboard() {
  const tabs = [
    { label: "Current Month", content: currentContent },
    { label: "History", content: historyContent },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Client Billing Dashboard</h1>
      <Tabs tabs={tabs} />
    </div>
  );
}
