import { Activity, Clock3, Gauge, TriangleAlert } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { summarizeApiUsage } from "@/modules/api-portal";

async function getApiUsageData() {
  const session = await auth();

  if (!session?.user?.email) {
    return { rows: [], summary: summarizeApiUsage([]) };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        apiUsage: {
          orderBy: { createdAt: "desc" },
          take: 100,
          select: {
            id: true,
            endpoint: true,
            method: true,
            statusCode: true,
            latencyMs: true,
            units: true,
            createdAt: true,
            apiKey: {
              select: {
                prefix: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const rows = user?.apiUsage ?? [];

    return {
      rows,
      summary: summarizeApiUsage(rows),
    };
  } catch {
    return { rows: [], summary: summarizeApiUsage([]) };
  }
}

export default async function DashboardApiUsagePage() {
  const { rows, summary } = await getApiUsageData();

  return (
    <main className="grid gap-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold">API Usage</h1>
        <p className="mt-3 text-muted-foreground">
          Suivi des appels API, statuts, unites et latence des cles client.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="size-4" />
              Requests
            </CardTitle>
            <CardDescription>Derniers appels charges.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{summary.totalRequests}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="size-4" />
              Units
            </CardTitle>
            <CardDescription>Unites facturees.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{summary.totalUnits}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TriangleAlert className="size-4" />
              Errors
            </CardTitle>
            <CardDescription>Status 4xx/5xx.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{summary.errorRequests}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock3 className="size-4" />
              Latency
            </CardTitle>
            <CardDescription>Moyenne observee.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {summary.averageLatencyMs === null ? "-" : `${summary.averageLatencyMs}ms`}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Recent calls</CardTitle>
          <CardDescription>Les 100 derniers appels API du compte.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.createdAt.toISOString()}</TableCell>
                  <TableCell>{row.apiKey ? `${row.apiKey.name} (${row.apiKey.prefix})` : "-"}</TableCell>
                  <TableCell>{row.method}</TableCell>
                  <TableCell>
                    <code className="text-sm">{row.endpoint}</code>
                  </TableCell>
                  <TableCell>{row.statusCode}</TableCell>
                  <TableCell>{row.latencyMs === null ? "-" : `${row.latencyMs}ms`}</TableCell>
                  <TableCell>{row.units}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    Aucun usage API pour l instant. Les appels DB-authentifies alimentent cette table.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
