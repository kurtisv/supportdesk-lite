import { KeyRound, ShieldCheck, TimerReset } from "lucide-react";

import { revokeDashboardApiKey } from "@/app/actions/api-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { ApiKeyForm } from "./api-key-form";

async function getApiKeys() {
  const session = await auth();

  if (!session?.user?.email) {
    return [];
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        apiKeys: {
          orderBy: { createdAt: "desc" },
          take: 25,
          select: {
            id: true,
            name: true,
            prefix: true,
            scopes: true,
            lastUsedAt: true,
            revokedAt: true,
          },
        },
      },
    });

    return user?.apiKeys ?? [];
  } catch {
    return [];
  }
}

export default async function DashboardApiKeysPage() {
  const apiKeys = await getApiKeys();
  const activeKeys = apiKeys.filter((apiKey) => !apiKey.revokedAt);
  const scopeCount = new Set(apiKeys.flatMap((apiKey) => apiKey.scopes)).size;

  return (
    <main className="grid gap-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold">API Keys</h1>
        <p className="mt-3 text-muted-foreground">
          Gestion des cles, scopes et usage avant branchement Prisma complet.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="size-4" />
              Active keys
            </CardTitle>
            <CardDescription>Cles non revoquees.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{activeKeys.length}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4" />
              Scopes
            </CardTitle>
            <CardDescription>Controle par endpoint.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{scopeCount}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TimerReset className="size-4" />
              Rate limit
            </CardTitle>
            <CardDescription>Upstash-ready.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">60/min</CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <ApiKeyForm />

        <Card>
          <CardHeader>
            <CardTitle>Keys</CardTitle>
            <CardDescription>Prefixes et scopes stockes en base.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Prefix</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>{apiKey.name}</TableCell>
                    <TableCell>
                      <code className="text-sm">{apiKey.prefix}</code>
                    </TableCell>
                    <TableCell>
                      <Badge>{apiKey.scopes.join(", ")}</Badge>
                    </TableCell>
                    <TableCell>{apiKey.lastUsedAt ? apiKey.lastUsedAt.toDateString() : "Never"}</TableCell>
                    <TableCell>{apiKey.revokedAt ? "Revoked" : "Active"}</TableCell>
                    <TableCell>
                      {!apiKey.revokedAt ? (
                        <form action={revokeDashboardApiKey}>
                          <input type="hidden" name="apiKeyId" value={apiKey.id} />
                          <Button type="submit" variant="secondary" size="sm">
                            Revoke
                          </Button>
                        </form>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
                {apiKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      Aucune cle pour l instant. Lance Postgres puis cree une cle.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
