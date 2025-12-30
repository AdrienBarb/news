import { CreateMarketForm } from "@/components/markets/CreateMarketForm";

export default function NewMarketPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create Market</h1>
        <p className="text-muted-foreground">
          Add a product or competitor to start monitoring market signals
        </p>
      </div>
      <CreateMarketForm />
    </div>
  );
}

