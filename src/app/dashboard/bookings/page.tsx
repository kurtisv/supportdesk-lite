import { CalendarDays, CircleDollarSign, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const upcomingBookings = [
  {
    customer: "Alex Martin",
    service: "Discovery call",
    start: "18 May, 09:00",
    status: "Confirmed",
    payment: "Not required",
  },
  {
    customer: "Sam Gagnon",
    service: "Implementation sprint",
    start: "18 May, 11:00",
    status: "Pending",
    payment: "Pending",
  },
];

export default function DashboardBookingsPage() {
  return (
    <main className="grid gap-6 px-6 py-10">
      <div>
        <h1 className="text-3xl font-semibold">Bookings</h1>
        <p className="mt-3 text-muted-foreground">
          Vue operationnelle pour suivre les reservations, paiements et capacite.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4" />
              Today
            </CardTitle>
            <CardDescription>Reservations planifiees.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">6</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UsersRound className="size-4" />
              Customers
            </CardTitle>
            <CardDescription>Nouveaux clients ce mois-ci.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">18</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CircleDollarSign className="size-4" />
              Paid
            </CardTitle>
            <CardDescription>Paiements confirmes.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">$2.4k</CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming bookings</CardTitle>
          <CardDescription>Structure prete pour une source Prisma.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingBookings.map((booking) => (
                <TableRow key={`${booking.customer}-${booking.start}`}>
                  <TableCell>{booking.customer}</TableCell>
                  <TableCell>{booking.service}</TableCell>
                  <TableCell>{booking.start}</TableCell>
                  <TableCell>
                    <Badge className={booking.status === "Confirmed" ? "bg-primary text-primary-foreground" : ""}>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{booking.payment}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
