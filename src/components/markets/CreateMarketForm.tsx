"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useApi from "@/lib/hooks/useApi";
import {
  createMarketSchema,
  type CreateMarketInput,
} from "@/lib/schemas/markets/createMarketSchema";
import { toast } from "sonner";
import { Loader2Icon, GlobeIcon } from "lucide-react";

export function CreateMarketForm() {
  const router = useRouter();
  const { usePost } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMarketInput>({
    resolver: zodResolver(createMarketSchema),
    defaultValues: {
      websiteUrl: "",
      name: "",
    },
  });

  const { mutate: createMarket } = usePost("/markets", {
    onSuccess: (data: { market: { id: string } }) => {
      toast.success("Market created! Analyzing website...");
      router.push(`/markets/${data.market.id}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create market");
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: CreateMarketInput) => {
    setIsSubmitting(true);
    createMarket(data);
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GlobeIcon className="h-5 w-5" />
          Create a New Market
        </CardTitle>
        <CardDescription>
          Enter a product or competitor website to start monitoring market
          signals. We&apos;ll analyze the website to understand the market
          context.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              placeholder="https://example.com"
              {...register("websiteUrl")}
              disabled={isSubmitting}
            />
            {errors.websiteUrl && (
              <p className="text-sm text-destructive">
                {errors.websiteUrl.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter the URL of a product, competitor, or company website
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Market Name (optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Project Management Tools"
              {...register("name")}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              If not provided, we&apos;ll use the domain name
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Creating Market...
              </>
            ) : (
              "Create Market"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
