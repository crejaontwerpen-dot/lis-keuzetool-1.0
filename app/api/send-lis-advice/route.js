import nodemailer from "nodemailer";

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      advicePlain,
      adviceHtml, // van buildAdviceHtmlForRob()
    } = body;

    if (!adviceHtml) {
      return Response.json(
        { ok: false, error: "Missing adviceHtml" },
        { status: 400 }
      );
    }

    // Haal de ontvangers uit de env, met fallback naar één adres
    const rawTo = process.env.LIS_ADVICE_TO || "rob@creja.nl";

    // Ondersteunt nu één of meerdere adressen, komma-gescheiden
    const to = rawTo
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (to.length === 0) {
      return Response.json(
        { ok: false, error: "No valid LIS_ADVICE_TO recipients" },
        { status: 500 }
      );
    }

    await transporter().sendMail({
      from: process.env.MAIL_FROM || "noreply@example.com",
      to, // array of adressen
      subject: `Nieuw LiS-advies – ${name || "Onbekende bezoeker"}`,
      html: adviceHtml,
      text: advicePlain || "",
      replyTo: email || undefined,
    });

    return Response.json({ ok: true });
  } catch (e) {
    console.error(e);
    return Response.json(
      { ok: false, error: e?.message || "send error" },
      { status: 500 }
    );
  }
}
