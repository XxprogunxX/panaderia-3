"use client";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="h-screen bg-[url('/cafe-hero.jpg')] bg-cover bg-center flex items-center justify-center text-white text-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-5xl font-bold mb-4 drop-shadow-md">El Arte del Café</h1>
        <p className="text-xl drop-shadow-sm">Explora aromas, sabores y pasión en cada taza</p>
      </motion.div>
    </section>
  );
}