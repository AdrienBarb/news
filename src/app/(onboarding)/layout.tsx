import OnboardingNavBar from "@/components/OnboardingNavBar";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <OnboardingNavBar />
      <main className="flex-1">{children}</main>
    </>
  );
}
