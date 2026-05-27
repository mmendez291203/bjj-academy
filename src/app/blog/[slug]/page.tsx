import { findByQuery, CONTAINERS } from "@/lib/azure/cosmos";
import { formatFecha, cn } from "@/lib/utils";
import type { Post } from "@/types";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

const CATEGORIA_LABEL: Record<string, string> = {
  tecnicas:     "Técnicas",
  competencias: "Competencias",
  noticias:     "Noticias",
  nutricion:    "Nutrición",
  consejos:     "Consejos",
};

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const posts = await findByQuery<Post>(
    CONTAINERS.POSTS,
    "SELECT * FROM c WHERE c.slug = @slug",
    [{ name: "@slug", value: slug }]
  ).catch(() => []);
  const post = posts[0];
  if (!post) return { title: "Post no encontrado" };
  return {
    title:       `${post.titulo} — RUNAJERABJJ`,
    description: post.resumen,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const posts = await findByQuery<Post>(
    CONTAINERS.POSTS,
    "SELECT * FROM c WHERE c.slug = @slug",
    [{ name: "@slug", value: slug }]
  ).catch(() => []);

  const post = posts[0];
  if (!post || !post.publicado) notFound();

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Volver */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al blog
        </Link>

        {/* Categoría + fecha */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xs font-semibold text-red-400 bg-red-950/40 px-2.5 py-1 rounded-full">
            {CATEGORIA_LABEL[post.categoria] ?? post.categoria}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            {formatFecha(post.fechaPublicacion)}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3 h-3" />
            {post.autor}
          </span>
        </div>

        {/* Título */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-6">
          {post.titulo}
        </h1>

        {/* Resumen destacado */}
        <p className="text-lg text-gray-400 border-l-2 border-red-600 pl-4 mb-8 leading-relaxed">
          {post.resumen}
        </p>

        {/* Imagen de portada */}
        {post.imagen && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imagen}
            alt={post.titulo}
            className="w-full rounded-xl mb-10 object-cover max-h-80"
          />
        )}

        {/* Contenido */}
        <div
          className={cn(
            "prose prose-invert prose-lg max-w-none",
            // Estilos para el contenido HTML
            "[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-10 [&_h2]:mb-4",
            "[&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-white [&_h3]:mt-8 [&_h3]:mb-3",
            "[&_p]:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-4",
            "[&_ul]:text-gray-300 [&_ul]:space-y-2 [&_ul]:mb-4 [&_ul]:pl-4 [&_ul]:list-disc",
            "[&_li]:leading-relaxed",
            "[&_strong]:text-white [&_strong]:font-semibold",
            "[&_img]:rounded-xl [&_img]:my-8 [&_img]:w-full [&_img]:object-cover",
            "[&_a]:text-red-400 [&_a]:underline",
          )}
          dangerouslySetInnerHTML={{ __html: post.contenido }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-12 pt-8 border-t border-white/5 flex-wrap">
            <Tag className="w-3.5 h-3.5 text-gray-600" />
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs text-gray-500 bg-gray-900 border border-white/5 px-2.5 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-red-900/30 bg-red-950/20 p-6 text-center">
          <p className="text-white font-bold text-lg mb-2">¿Listo para entrenar?</p>
          <p className="text-gray-400 text-sm mb-4">Tu primera clase es gratis. Sin compromiso.</p>
          <Link
            href="/inscripciones"
            className="inline-block bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
          >
            Reservar clase gratis →
          </Link>
        </div>

      </div>
    </div>
  );
}
