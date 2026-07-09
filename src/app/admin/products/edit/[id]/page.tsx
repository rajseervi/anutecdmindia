"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/types/product";
import ProductForm from "@/app/admin/_components/ProductForm";
import Link from "next/link";
import { useToast } from "@/app/admin/_components/Toast";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { addToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    qrCode: "",
    inventory: 0,
    category: "",
    hidden: false,
  });

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products?id=${id}`);
        const data = await res.json();
        if (!res.ok || !data.product) {
          setNotFound(true);
          return;
        }
        const p: Product = data.product;
        setProduct(p);
        setForm({
          name: p.name,
          description: p.description,
          price: p.price,
          imageUrl: p.imageUrl,
          qrCode: p.qrCode || "",
          inventory: p.inventory,
          category: p.category || "",
          hidden: p.hidden || false,
        });

        const catRes = await fetch("/api/products?limit=1&includeHidden=true");
        const catData = await catRes.json();
        if (catRes.ok && catData.categories) {
          setAllCategories(catData.categories);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        addToast("Failed to load product", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, addToast]);

  const handleChange = (field: string, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id }),
      });
      if (res.ok) {
        addToast(`Product "${form.name}" updated successfully`, "success");
        router.push("/admin");
      } else {
        const err = await res.json();
        addToast(`Error: ${err.error}`, "error");
      }
    } catch (err) {
      console.error("Error saving product:", err);
      addToast("Failed to update product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Product not found</h2>
        <p className="text-sm text-gray-500 mb-6">This product was not found or has been removed.</p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-gray-700 transition-colors font-medium">
          Dashboard
        </Link>
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-semibold truncate">Edit: {product.name}</span>
      </div>

      <ProductForm
        form={form}
        editing={product}
        saving={saving}
        allCategories={allCategories}
        onSubmit={handleSubmit}
        onChange={handleChange}
        onCancel={handleCancel}
      />
    </div>
  );
}
