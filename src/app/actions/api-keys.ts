"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createApiKey, hashApiKey } from "@/lib/security/api-keys";
import { parseApiKeyFormData } from "@/modules/api-portal";

export type CreateApiKeyState =
  | {
      ok: true;
      plainTextKey: string;
      prefix: string;
    }
  | {
      ok: false;
      error: string;
    }
  | null;

export async function createDashboardApiKey(
  _previousState: CreateApiKeyState,
  formData: FormData,
): Promise<CreateApiKeyState> {
  const session = await auth();

  if (!session?.user?.email) {
    return { ok: false, error: "You must be signed in." };
  }

  const input = parseApiKeyFormData(formData);
  const apiKey = createApiKey();
  const hashedKey = await hashApiKey(apiKey.plainTextKey);
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name,
    },
    select: { id: true },
  });

  await prisma.apiKey.create({
    data: {
      userId: user.id,
      name: input.name,
      prefix: apiKey.prefix,
      hashedKey,
      scopes: input.scopes,
    },
  });

  revalidatePath("/dashboard/api-keys");

  return {
    ok: true,
    plainTextKey: apiKey.plainTextKey,
    prefix: apiKey.prefix,
  };
}

export async function revokeDashboardApiKey(formData: FormData) {
  const session = await auth();
  const apiKeyId = String(formData.get("apiKeyId") ?? "");

  if (!session?.user?.email || !apiKeyId) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return;
  }

  await prisma.apiKey.updateMany({
    where: {
      id: apiKeyId,
      userId: user.id,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  revalidatePath("/dashboard/api-keys");
}
