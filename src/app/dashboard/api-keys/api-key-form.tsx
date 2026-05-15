"use client";

import { useActionState } from "react";

import { createDashboardApiKey, type CreateApiKeyState } from "@/app/actions/api-keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ApiKeyForm() {
  const [state, action, isPending] = useActionState<CreateApiKeyState, FormData>(
    createDashboardApiKey,
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create key</CardTitle>
        <CardDescription>La cle complete apparait une seule fois apres creation.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" placeholder="Production" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="scopes">Scopes</Label>
            <Input id="scopes" name="scopes" defaultValue="demo:read" />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create API key"}
          </Button>
        </form>

        {state?.ok ? (
          <div className="mt-5 border bg-secondary p-4">
            <p className="text-sm font-medium">Copy this key now</p>
            <code className="mt-2 block break-all text-sm">{state.plainTextKey}</code>
          </div>
        ) : null}

        {state && !state.ok ? (
          <p className="mt-4 text-sm text-destructive">{state.error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
