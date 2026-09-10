import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: "default" | "warning" | "danger";
}) {
  const toneClass =
    tone === "danger" ? "text-red-600" : tone === "warning" ? "text-amber-600" : "text-foreground";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${toneClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
