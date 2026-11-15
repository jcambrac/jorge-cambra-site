'use client'

import { useState } from 'react'
import { XIcon, ZoomInIcon } from 'lucide-react'
import {
  MorphingDialog,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogImage,
  MorphingDialogTrigger,
} from '@/components/ui/morphing-dialog'

type CoverProps = {
  src: string
  alt: string
  caption: string
  /**
   * Fraction of the image's height to crop off the TOP (0–1).
   * e.g. cropTop={0.3} shows only the bottom 70% of the image.
   */
  cropTop?: number
  /**
   * Click the image to open it large (a magnifier shows on hover). For diagrams
   * whose text is too small at the width of the page. Not used together with cropTop.
   */
  zoomable?: boolean
}

// The image in the page, and the same image large in a dialog when it is clicked
// (the dialog the site already uses for its project videos).
function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  return (
    <MorphingDialog transition={{ type: 'spring', bounce: 0, duration: 0.3 }}>
      <MorphingDialogTrigger className="group block">
        <img src={src} alt={alt} className="w-full cursor-zoom-in rounded-xl" />
        <span
          aria-hidden
          className="pointer-events-none absolute top-3 right-3 rounded-full bg-zinc-900/70 p-2 text-white opacity-70 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
        >
          <ZoomInIcon className="h-5 w-5" />
        </span>
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative rounded-2xl bg-zinc-50 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950 dark:ring-zinc-800/50">
          <MorphingDialogImage
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[95vw] cursor-zoom-out rounded-xl object-contain"
          />
        </MorphingDialogContent>
        <MorphingDialogClose
          className="fixed top-6 right-6 h-fit w-fit cursor-pointer rounded-full bg-white p-1"
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { delay: 0.3, duration: 0.1 },
            },
            exit: { opacity: 0, transition: { duration: 0 } },
          }}
        >
          <XIcon className="h-5 w-5 text-zinc-500" />
        </MorphingDialogClose>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}

export default function Cover({
  src,
  alt,
  caption,
  cropTop = 0,
  zoomable = false,
}: CoverProps) {
  const [ratio, setRatio] = useState<number | null>(null)

  // No crop requested → render the image exactly as before.
  if (!cropTop) {
    return (
      <figure>
        {zoomable ? (
          <ZoomableImage src={src} alt={alt} />
        ) : (
          <img src={src} alt={alt} className="rounded-xl" />
        )}
        <figcaption className="text-center">{caption}</figcaption>
      </figure>
    )
  }

  return (
    <figure>
      <div
        className="overflow-hidden rounded-xl"
        style={ratio ? { aspectRatio: String(ratio) } : undefined}
      >
        <img
          src={src}
          alt={alt}
          onLoad={(e) => {
            const img = e.currentTarget
            // Displayed box ratio = width / (visible height).
            // Visible height = natural height * (1 - cropTop).
            setRatio(img.naturalWidth / (img.naturalHeight * (1 - cropTop)))
          }}
          className={
            ratio
              ? 'h-full w-full object-cover object-bottom'
              : 'block w-full'
          }
        />
      </div>
      <figcaption className="text-center">{caption}</figcaption>
    </figure>
  )
}
