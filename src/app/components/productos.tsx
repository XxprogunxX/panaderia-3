// src/components/Productos.tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";

const productos = [
  { nombre: "Café Espresso", imagen: "/espresso.jpg", precio: "$75 MXN" },
  { nombre: "Café Americano", imagen: "/americano.jpg", precio: "$60 MXN" },
  { nombre: "Capuccino", imagen: "/capuccino.jpg", precio: "$85 MXN" },
];

export default function Productos() {
  return (
    <section className="bg-[#f5f0ea] py-20 px-6">
      <h2 className="text-4xl font-bold text-center mb-12 text-[#4b2e1e]">Nuestros Favoritos</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {productos.map((p, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            <Image src={p.imagen} alt={p.nombre} width={400} height={300} className="w-full object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-[#4b2e1e]">{p.nombre}</h3>
              <p className="text-[#6e4e3a]">{p.precio}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
