import { findById, CONTAINERS } from "@/lib/azure/cosmos";
import PostForm from "@/components/admin/PostForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Post } from "@/types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditarPostPage({ params }: Props) {
  const { id } = await params;

  let post: Post | null = null;
  try {
    post = await findById<Post>(CONTAINERS.POSTS, id);
  } catch {
    // post remains null
  }

  if (!post) notFound();

  return (
    <div className="p-6 sm:p-8 max-w-4xl">

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al blog
        </Link>
        <h1 className="text-2xl font-extrabold text-white">Editar artículo</h1>
        <p className="text-sm text-gray-500 mt-1 truncate">{post.titulo}</p>
      </div>

      <PostForm
        postId={post.id}
        initial={{
          titulo:           post.titulo,
          resumen:          post.resumen,
          contenido:        post.contenido,
          categoria:        post.categoria,
          autor:            post.autor,
          imagen:           post.imagen ?? "",
          publicado:        post.publicado,
          fechaPublicacion: post.fechaPublicacion,
          tags:             Array.isArray(post.tags) ? post.tags.join(", ") : "",
        }}
      />
    </div>
  );
}
