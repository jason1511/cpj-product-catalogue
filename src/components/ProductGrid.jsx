import { motion } from "motion/react";
import ProductCard from "./ProductCard";

function ProductGrid({ products, onViewDetails }) {
  return (
    <motion.div
      className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
          },
        },
      }}
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
        >
          <ProductCard product={product} onViewDetails={onViewDetails} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default ProductGrid;