import { PlusCircle } from "lucide-react";

import { createStaffMember, deactivateStaffMember, updateStaffMember } from "@/app/actions/booking";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { prisma } from "@/lib/db";

async function getStaff() {
  try {
    return await prisma.staff.findMany({
      orderBy: { createdAt: "desc" },
      take: 25,
    });
  } catch {
    return [];
  }
}

export default async function DashboardStaffPage() {
  const staff = await getStaff();

  return (
    <main className="grid gap-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold">Staff</h1>
        <p className="mt-3 text-muted-foreground">
          Gere les intervenants qui peuvent recevoir des reservations.
        </p>
      </div>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add staff</CardTitle>
            <CardDescription>Email optionnel pour les notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createStaffMember} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="Jane Operator" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="jane@example.com" />
              </div>
              <Button type="submit">
                <PlusCircle className="size-4" />
                Add staff
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Staff members</CardTitle>
            <CardDescription>{staff.length} active staff member(s).</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <form id={`staff-${member.id}`} action={updateStaffMember}>
                        <input type="hidden" name="staffId" value={member.id} />
                        <Input name="name" defaultValue={member.name} required />
                      </form>
                    </TableCell>
                    <TableCell>
                      <Input form={`staff-${member.id}`} name="email" type="email" defaultValue={member.email ?? ""} />
                    </TableCell>
                    <TableCell>
                      <div className="grid gap-2">
                        <span>{member.isActive ? "Active" : "Inactive"}</span>
                        <div className="flex gap-2">
                          <Button form={`staff-${member.id}`} type="submit" size="sm" variant="secondary">
                            Save
                          </Button>
                          <form action={deactivateStaffMember}>
                            <input type="hidden" name="staffId" value={member.id} />
                            <Button type="submit" size="sm" variant="ghost">
                              Disable
                            </Button>
                          </form>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      Aucun intervenant pour l instant. Lance Postgres puis ajoute le premier membre.
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
