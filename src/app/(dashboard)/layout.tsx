import DashboardHeader from "@/components/DashboardHeader";
import SectionNav from "@/components/SectionNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="wrap">
      <DashboardHeader />
      <SectionNav />
      <main>{children}</main>
    </div>
  );
}
