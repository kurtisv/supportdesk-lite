"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { BookingConfirmationEmail } from "@/emails/booking-confirmation";
import { BookingStatus } from "@/generated/prisma";
import { requireDashboardAccess } from "@/lib/dashboard-auth";
import { sendTransactionalEmail } from "@/lib/email/resend";
import { prisma } from "@/lib/db";
import {
  calculateBookingEndAt,
  hasBookingConflict,
  parseAvailabilityExceptionFormData,
  parseAvailabilityRuleFormData,
  parseBookingRequestFormData,
  parseServiceFormData,
  parseStaffFormData,
} from "@/modules/booking";

export async function createService(formData: FormData) {
  await requireDashboardAccess();

  const service = parseServiceFormData(formData);

  await prisma.service.create({
    data: {
      name: service.name,
      slug: service.slug,
      description: service.description,
      durationMin: service.durationMin,
      priceCents: service.priceCents,
    },
  });

  revalidatePath("/dashboard/services");
  redirect("/dashboard/services");
}

export async function updateService(formData: FormData) {
  await requireDashboardAccess();

  const serviceId = String(formData.get("serviceId") ?? "");
  const service = parseServiceFormData(formData);

  if (!serviceId) {
    return;
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: {
      name: service.name,
      slug: service.slug,
      description: service.description,
      durationMin: service.durationMin,
      priceCents: service.priceCents,
    },
  });

  revalidatePath("/dashboard/services");
}

export async function deactivateService(formData: FormData) {
  await requireDashboardAccess();

  const serviceId = String(formData.get("serviceId") ?? "");

  if (!serviceId) {
    return;
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: { isActive: false },
  });

  revalidatePath("/dashboard/services");
}

export async function createStaffMember(formData: FormData) {
  await requireDashboardAccess();

  const staff = parseStaffFormData(formData);

  await prisma.staff.create({
    data: {
      name: staff.name,
      email: staff.email,
    },
  });

  revalidatePath("/dashboard/staff");
  redirect("/dashboard/staff");
}

export async function updateStaffMember(formData: FormData) {
  await requireDashboardAccess();

  const staffId = String(formData.get("staffId") ?? "");
  const staff = parseStaffFormData(formData);

  if (!staffId) {
    return;
  }

  await prisma.staff.update({
    where: { id: staffId },
    data: {
      name: staff.name,
      email: staff.email,
    },
  });

  revalidatePath("/dashboard/staff");
}

export async function deactivateStaffMember(formData: FormData) {
  await requireDashboardAccess();

  const staffId = String(formData.get("staffId") ?? "");

  if (!staffId) {
    return;
  }

  await prisma.staff.update({
    where: { id: staffId },
    data: { isActive: false },
  });

  revalidatePath("/dashboard/staff");
}

export async function createAvailabilityRule(formData: FormData) {
  await requireDashboardAccess();

  const rule = parseAvailabilityRuleFormData(formData);

  await prisma.availabilityRule.create({
    data: {
      staffId: rule.staffId,
      weekday: rule.weekday,
      startTime: rule.startTime,
      endTime: rule.endTime,
      timezone: rule.timezone,
    },
  });

  revalidatePath("/dashboard/availability");
  redirect("/dashboard/availability");
}

export async function updateAvailabilityRule(formData: FormData) {
  await requireDashboardAccess();

  const ruleId = String(formData.get("ruleId") ?? "");
  const rule = parseAvailabilityRuleFormData(formData);

  if (!ruleId) {
    return;
  }

  await prisma.availabilityRule.update({
    where: { id: ruleId },
    data: {
      staffId: rule.staffId,
      weekday: rule.weekday,
      startTime: rule.startTime,
      endTime: rule.endTime,
      timezone: rule.timezone,
    },
  });

  revalidatePath("/dashboard/availability");
}

export async function deleteAvailabilityRule(formData: FormData) {
  await requireDashboardAccess();

  const ruleId = String(formData.get("ruleId") ?? "");

  if (!ruleId) {
    return;
  }

  await prisma.availabilityRule.delete({
    where: { id: ruleId },
  });

  revalidatePath("/dashboard/availability");
}

export async function createAvailabilityException(formData: FormData) {
  await requireDashboardAccess();

  const exception = parseAvailabilityExceptionFormData(formData);

  await prisma.availabilityException.create({
    data: {
      staffId: exception.staffId,
      date: exception.date,
      startTime: exception.startTime,
      endTime: exception.endTime,
      isClosed: exception.isClosed,
    },
  });

  revalidatePath("/dashboard/availability");
  redirect("/dashboard/availability");
}

export async function updateAvailabilityException(formData: FormData) {
  await requireDashboardAccess();

  const exceptionId = String(formData.get("exceptionId") ?? "");
  const exception = parseAvailabilityExceptionFormData(formData);

  if (!exceptionId) {
    return;
  }

  await prisma.availabilityException.update({
    where: { id: exceptionId },
    data: {
      staffId: exception.staffId,
      date: exception.date,
      startTime: exception.startTime,
      endTime: exception.endTime,
      isClosed: exception.isClosed,
    },
  });

  revalidatePath("/dashboard/availability");
}

export async function deleteAvailabilityException(formData: FormData) {
  await requireDashboardAccess();

  const exceptionId = String(formData.get("exceptionId") ?? "");

  if (!exceptionId) {
    return;
  }

  await prisma.availabilityException.delete({
    where: { id: exceptionId },
  });

  revalidatePath("/dashboard/availability");
}

export async function createBookingRequest(formData: FormData) {
  const bookingRequest = parseBookingRequestFormData(formData);

  const result = await prisma.$transaction(async (tx) => {
    const service = await tx.service.findFirst({
      where: { id: bookingRequest.serviceId, isActive: true },
      select: { id: true, durationMin: true, name: true },
    });

    if (!service) {
      return { ok: false as const, reason: "service-not-found" };
    }

    const endAt = calculateBookingEndAt(bookingRequest.startAt, service.durationMin);
    const conflictingBookings = await tx.booking.findMany({
      where: {
        serviceId: bookingRequest.serviceId,
        staffId: bookingRequest.staffId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        startAt: { lt: endAt },
        endAt: { gt: bookingRequest.startAt },
      },
      select: { startAt: true, endAt: true },
    });

    if (
      hasBookingConflict({
        startAt: bookingRequest.startAt,
        endAt,
        existingBookings: conflictingBookings,
      })
    ) {
      return { ok: false as const, reason: "slot-conflict" };
    }

    const booking = await tx.booking.create({
      data: {
        serviceId: service.id,
        staffId: bookingRequest.staffId,
        customerName: bookingRequest.customerName,
        customerEmail: bookingRequest.customerEmail,
        customerPhone: bookingRequest.customerPhone,
        startAt: bookingRequest.startAt,
        endAt,
        status: BookingStatus.PENDING,
      },
    });

    return {
      ok: true as const,
      booking: {
        customerEmail: booking.customerEmail,
        customerName: booking.customerName,
        startAt: booking.startAt,
        serviceName: service.name,
      },
    };
  });

  if (!result.ok) {
    redirect(`/booking?error=${result.reason}`);
  }

  await sendTransactionalEmail({
    to: result.booking.customerEmail,
    subject: "Votre demande de reservation a ete recue",
    react: (
      <BookingConfirmationEmail
        customerName={result.booking.customerName}
        serviceName={result.booking.serviceName}
        startAt={result.booking.startAt}
      />
    ),
  });

  revalidatePath("/dashboard/bookings");
  redirect("/booking?success=1");
}
