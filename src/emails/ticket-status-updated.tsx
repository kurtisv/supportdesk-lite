import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const statusLabels: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export function TicketStatusUpdatedEmail({
  requesterName,
  ticketId,
  subject,
  newStatus,
}: {
  requesterName: string;
  ticketId: string;
  subject: string;
  newStatus: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Your ticket status has been updated.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Ticket status updated</Heading>
          <Section>
            <Text style={text}>Hi {requesterName},</Text>
            <Text style={text}>
              The status of your support ticket has been updated.
            </Text>
            <Text style={label}>Ticket reference</Text>
            <Text style={strong}>#{ticketId.slice(-8).toUpperCase()}</Text>
            <Text style={label}>Subject</Text>
            <Text style={strong}>{subject}</Text>
            <Text style={label}>New status</Text>
            <Text style={strong}>{statusLabels[newStatus] ?? newStatus}</Text>
            {newStatus === "RESOLVED" && (
              <Text style={text}>
                If your issue is not fully resolved, please reply to this email
                or submit a new support request.
              </Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f6f5f2",
  color: "#161513",
  fontFamily: "Arial, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #dedbd2",
  margin: "32px auto",
  padding: "32px",
  width: "560px",
};

const heading = {
  fontSize: "24px",
  lineHeight: "32px",
  margin: "0 0 16px",
};

const text = {
  color: "#5f5b53",
  fontSize: "15px",
  lineHeight: "24px",
};

const label = {
  color: "#5f5b53",
  fontSize: "12px",
  fontWeight: "600" as const,
  letterSpacing: "0.08em",
  margin: "16px 0 4px",
  textTransform: "uppercase" as const,
};

const strong = {
  color: "#161513",
  fontSize: "15px",
  fontWeight: "700" as const,
  lineHeight: "24px",
  margin: "0",
};
