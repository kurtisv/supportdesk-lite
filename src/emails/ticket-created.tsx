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

export function TicketCreatedEmail({
  requesterName,
  ticketId,
  subject,
}: {
  requesterName: string;
  ticketId: string;
  subject: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>Your support request has been received.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Support request received</Heading>
          <Section>
            <Text style={text}>Hi {requesterName},</Text>
            <Text style={text}>
              We have received your support request and our team will get back to you
              as soon as possible.
            </Text>
            <Text style={label}>Ticket reference</Text>
            <Text style={strong}>#{ticketId.slice(-8).toUpperCase()}</Text>
            <Text style={label}>Subject</Text>
            <Text style={strong}>{subject}</Text>
            <Text style={text}>
              You will receive an email notification when the status of your ticket changes.
            </Text>
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
