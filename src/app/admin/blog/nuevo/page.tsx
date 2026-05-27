import PostForm from "@/components/admin/PostForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoPostPage() {
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
        <h1 className="text-2xl font-extrabold text-white">Nuevo artículo</h1>
        <p className="text-sm text-gray-500 mt-1">Crea un nuevo artículo para el blog</p>
      </div>

      <PostForm />
    </div>
  );
}
