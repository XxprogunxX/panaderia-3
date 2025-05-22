// src/components/Testimonios.tsx
"use client";
import { motion } from "framer-motion";

const testimonios = [
  {
    nombre: "Ana Martínez",
    mensaje: "El mejor café que he probado. Su sabor y aroma son únicos.",
  },
  {
    nombre: "Carlos Reyes",
    mensaje: "Una experiencia auténtica. Atención excelente y productos de calidad.",
  },
];

export default function Testimonios() {
  return (
    <section className="bg-[#e8d8c3] py-20 px-6 text-[#4b2e1e]">
      <h2 className="text-4xl font-bold text-center mb-12">Lo que dicen nuestros clientes</h2>
      <div className="max-w-4xl mx-auto space-y-10">
        {testimonios.map((t, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-xl shadow-md p-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.2 }}
            viewport={{ once: true }}
          >
            <p className="italic mb-4">“{t.mensaje}”</p>
            <h4 className="font-semibold text-right">– {t.nombre}</h4>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
