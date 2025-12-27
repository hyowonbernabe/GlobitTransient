import React from "react"
import fs from "fs"
import path from "path"
import { GalleryCarousel } from "./GalleryCarousel"

export async function GallerySection() {
  // Server-side logic to read images
  const galleryDir = path.join(process.cwd(), "public/assets/gallery")
  let images: string[] = []

  try {
    const files = await fs.promises.readdir(galleryDir)
    // Filter for image files (jpg, jpeg, png, webp)
    images = files
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .map(file => `/assets/gallery/${file}`)
  } catch (error) {
    console.error("Error reading gallery directory:", error)
    // Fallback if directory doesn't exist yet or is empty
    images = [
      "/assets/images/baguio-city-landscape-view.jpg",
      "/assets/images/baguio_foreground_pines.png",
      "/assets/images/baguio_midground.png",
      "/assets/images/baguio_background_fog.png"
    ]
  }

  return (
    <section 
      id="gallery" 
      className="py-20 bg-gray-900 overflow-hidden relative"
    >
      {/* Background Decorative Blur */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 mb-12 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Visualizing Your Stay
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Take a peek into the cozy atmosphere and scenic surroundings that await you.
        </p>
      </div>

      <GalleryCarousel images={images} />
    </section>
  )
}