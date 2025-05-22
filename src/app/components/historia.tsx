// src/components/Historia.tsx
"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Historia() {
  return (
    <section className="relative flex flex-col md:flex-row items-center justify-center bg-[#2c1b14] text-white py-20 px-6 overflow-hidden">
      <motion.div
        className="md:w-1/2 z-10"
        initial={{ x: -80, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-4xl font-bold mb-4">Nuestra historia</h2>
        <p className="text-lg leading-relaxed">
          Desde los cafetales más selectos hasta tu taza, cultivamos una pasión por el café que se transmite en cada sorbo.
        </p>
      </motion.div>

      <motion.div
        className="md:w-1/2 relative -mt-20 md:mt-0 md:-ml-20"
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <Image
          src="/historia-cafe.jpg"
          alt="Historia del café"
          width={500}
          height={500}
          className="rounded-xl shadow-2xl border-4 border-white"
        />
      </motion.div>
    </section>
  );
}
