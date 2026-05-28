import { Resend } from "resend";

// Inicialización lazy — evita error en build si la env var no está aún
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM    = process.env.RESEND_FROM ?? "onboarding@resend.dev";
const ADMIN   = process.env.ADMIN_EMAIL ?? "mariomendezzu87@gmail.com";
const ACADEMY = process.env.NEXT_PUBLIC_ACADEMY_NAME ?? "RUNAJERABJJ";

// ─── Tipos ────────────────────────────────────────────────────────────────────
type DatosInscripcion = {
  nombre:             string;
  apellido:           string;
  email:              string;
  telefono:           string;
  edad:               number;
  experienciaPrevia:  boolean;
  claseInteres:       string;
  mensaje?:           string;
  comoNosEncontraste?: string;
};

// ─── Helper: etiquetas legibles ───────────────────────────────────────────────
const CLASE_LABEL: Record<string, string> = {
  gi:       "Gi (con kimono)",
  "no-gi":  "No-Gi",
  "open-mat": "Open Mat",
  kids:     "Kids (niños)",
};

// ─── Email al admin: nueva inscripción ───────────────────────────────────────
export async function enviarNotificacionInscripcion(datos: DatosInscripcion) {
  const nombre   = `${datos.nombre} ${datos.apellido}`;
  const clase    = CLASE_LABEL[datos.claseInteres] ?? datos.claseInteres;
  const exp      = datos.experienciaPrevia ? "Sí tiene experiencia" : "Sin experiencia previa";

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0a0f1e;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0f1e;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#0c1428;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#dc2626;padding:24px 32px;">
              <p style="margin:0;color:#fff;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;opacity:0.8;">${ACADEMY}</p>
              <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:800;">🥋 Nueva solicitud de clase</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;">
                Alguien llenó el formulario de inscripción. Aquí están sus datos:
              </p>

              <!-- Datos principales -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="padding:10px 14px;background:#111e38;border-radius:8px 8px 0 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Nombre</p>
                    <p style="margin:4px 0 0;color:#f1f5f9;font-size:16px;font-weight:700;">${nombre}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;background:#111e38;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Email</p>
                    <p style="margin:4px 0 0;color:#f1f5f9;font-size:15px;">
                      <a href="mailto:${datos.email}" style="color:#dc2626;text-decoration:none;">${datos.email}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;background:#111e38;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Teléfono</p>
                    <p style="margin:4px 0 0;color:#f1f5f9;font-size:15px;">
                      <a href="tel:${datos.telefono}" style="color:#dc2626;text-decoration:none;">${datos.telefono}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;background:#111e38;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Edad</p>
                    <p style="margin:4px 0 0;color:#f1f5f9;font-size:15px;">${datos.edad} años</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;background:#111e38;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Clase de interés</p>
                    <p style="margin:4px 0 0;color:#f1f5f9;font-size:15px;">${clase}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px 14px;background:#111e38;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Experiencia</p>
                    <p style="margin:4px 0 0;color:#f1f5f9;font-size:15px;">${exp}</p>
                  </td>
                </tr>
                ${datos.comoNosEncontraste ? `
                <tr>
                  <td style="padding:10px 14px;background:#111e38;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Cómo nos encontró</p>
                    <p style="margin:4px 0 0;color:#f1f5f9;font-size:15px;">${datos.comoNosEncontraste}</p>
                  </td>
                </tr>` : ""}
                ${datos.mensaje ? `
                <tr>
                  <td style="padding:10px 14px;background:#111e38;border-radius:0 0 8px 8px;">
                    <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Mensaje</p>
                    <p style="margin:4px 0 0;color:#f1f5f9;font-size:15px;line-height:1.6;">${datos.mensaje}</p>
                  </td>
                </tr>` : `
                <tr>
                  <td style="padding:10px 14px;background:#111e38;border-radius:0 0 8px 8px;">
                    <p style="margin:0;color:#475569;font-size:13px;font-style:italic;">Sin mensaje adicional</p>
                  </td>
                </tr>`}
              </table>

              <!-- CTA -->
              <p style="margin:0 0 16px;color:#94a3b8;font-size:13px;">
                Responde directamente a su email o contáctalo por WhatsApp para coordinar su primera clase:
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:8px;">
                    <a href="https://wa.me/506${datos.telefono.replace(/\D/g, "").replace(/^506/, "")}"
                       style="display:inline-block;background:#16a34a;color:#fff;font-size:13px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:8px;">
                      💬 WhatsApp
                    </a>
                  </td>
                  <td>
                    <a href="mailto:${datos.email}"
                       style="display:inline-block;background:#1a2d4e;color:#f1f5f9;font-size:13px;font-weight:700;text-decoration:none;padding:10px 20px;border-radius:8px;border:1px solid rgba(255,255,255,0.1);">
                      ✉️ Responder email
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.05);">
              <p style="margin:0;color:#334155;font-size:11px;text-align:center;">
                ${ACADEMY} · Este email fue generado automáticamente al recibir una inscripción
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from:    FROM,
    to:      ADMIN,
    subject: `🥋 Nueva solicitud — ${nombre}`,
    html,
  });

  if (error) throw new Error(error.message);
}

// ─── Email al alumno: confirmación de inscripción ─────────────────────────────
export async function enviarConfirmacionAlumno(datos: DatosInscripcion) {
  const nombre = datos.nombre;
  const clase  = CLASE_LABEL[datos.claseInteres] ?? datos.claseInteres;
  const wp     = process.env.NEXT_PUBLIC_ACADEMY_PHONE?.replace(/\D/g, "") ?? "50660864646";

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#141414;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#b91c1c;padding:28px 32px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;font-weight:600;letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;">${ACADEMY}</p>
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;">¡Hola, ${nombre}! 👋</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Recibimos tu solicitud de clase gratis</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <p style="margin:0 0 20px;color:#94a3b8;font-size:15px;line-height:1.7;">
                Tu solicitud para la clase de <strong style="color:#f1f5f9;">${clase}</strong> ya está en nuestras manos.
                Nos pondremos en contacto contigo muy pronto para coordinar tu primera clase.
              </p>

              <!-- Resumen -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid rgba(255,255,255,0.05);">
                    <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Clase solicitada</p>
                    <p style="margin:4px 0 0;color:#f1f5f9;font-size:15px;font-weight:600;">${clase}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Horario</p>
                    <p style="margin:4px 0 0;color:#f1f5f9;font-size:15px;">Lunes a Viernes · 7:30 PM – 9:00 PM</p>
                    <p style="margin:2px 0 0;color:#64748b;font-size:12px;">Escazú Village, ENERGYM San Rafael de Escazú</p>
                  </td>
                </tr>
              </table>

              <!-- Mensaje motivador -->
              <div style="background:#1a0a0a;border-left:3px solid #b91c1c;border-radius:0 8px 8px 0;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;color:#fca5a5;font-size:13px;line-height:1.7;font-style:italic;">
                  "Nuestra misión va más allá del tatami. Buscamos moldear individuos mental y físicamente
                  más fuertes, donde cada técnica es un pilar para una vida más equilibrada."
                </p>
                <p style="margin:8px 0 0;color:#64748b;font-size:11px;">— ${ACADEMY}</p>
              </div>

              <!-- CTA WhatsApp -->
              <p style="margin:0 0 16px;color:#94a3b8;font-size:13px;">
                Si tienes alguna pregunta, escríbenos directamente por WhatsApp:
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <a href="https://wa.me/${wp}"
                       style="display:inline-block;background:#16a34a;color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;">
                      💬 Escribir por WhatsApp
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="margin:0;color:#374151;font-size:11px;">
                ${ACADEMY} · Escazú, Costa Rica
              </p>
              <p style="margin:4px 0 0;color:#374151;font-size:11px;">
                Este email es una confirmación automática de tu solicitud
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const resend = getResend();
  const { error } = await resend.emails.send({
    from:    FROM,
    to:      datos.email,
    subject: `✅ Recibimos tu solicitud — ${ACADEMY}`,
    html,
  });

  if (error) throw new Error(error.message);
}
