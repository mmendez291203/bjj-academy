import Link from "next/link";
import { Shield, MapPin, Phone, Mail } from "lucide-react";
import { InstagramIcon, YoutubeIcon } from "@/components/ui/social-icons";

export default function Footer() {
  const academy = {
    name:    process.env.NEXT_PUBLIC_ACADEMY_NAME  ?? "Academia BJJ",
    phone:   process.env.NEXT_PUBLIC_ACADEMY_PHONE ?? "+52 555 000 0000",
    email:   process.env.NEXT_PUBLIC_ACADEMY_EMAIL ?? "contacto@academiabjj.com",
    address: process.env.NEXT_PUBLIC_ACADEMY_ADDRESS ?? "Tu dirección, Ciudad",
  };

  return (
    <footer className="bg-gray-950 border-t border-white/5 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* ─── Marca ──────────────────────────────────────────────────── */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg mb-3">
              <Shield className="w-6 h-6 text-red-500" />
              {academy.name}
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              Formando campeones dentro y fuera del tatami. Clases para todos los
              niveles en un ambiente seguro, respetuoso y de alta competencia.
            </p>
            {/* Redes sociales */}
            <div className="flex gap-4 mt-5">
              <a href="https://www.instagram.com/runajerabjj/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-pink-400 transition-colors">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="https://www.youtube.com/@RunaJerabjj" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-red-500 transition-colors">
                <YoutubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* ─── Links ──────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-white font-semibold mb-4">Academia</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/clases",        label: "Horario de Clases" },
                { href: "/inscripciones", label: "Inscripciones"     },
                { href: "/blog",          label: "Blog de BJJ"       },
                { href: "/login",         label: "Portal Alumnos"    },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ─── Contacto ───────────────────────────────────────────────── */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                <span>{academy.address}</span>
              </li>
              {academy.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500 shrink-0" />
                  <a href={`https://wa.me/${academy.phone.replace(/\D/g,"")}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    {academy.phone}
                  </a>
                </li>
              )}
              {academy.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-red-500 shrink-0" />
                  <a href={`mailto:${academy.email}`} className="hover:text-white transition-colors">
                    {academy.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* ─── Bottom bar ─────────────────────────────────────────────────── */}
        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <p className="text-gray-600">
            Diseñado y desarrollado por{" "}
            <a
              href="https://www.linkedin.com/in/mariomendez2912/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors font-medium"
            >
              Mario Méndez
            </a>
          </p>
          <div className="flex gap-4 text-gray-600">
            <a
              href="https://www.linkedin.com/in/mariomendez2912/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://www.upwork.com/freelancers/mariomendez"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Upwork
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
