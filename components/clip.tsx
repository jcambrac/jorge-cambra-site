type ClipProps = {
  /** Path without extension, e.g. "/videos/research-flow": the .webm and .mp4 files are both used. */
  src: string
  /** What the clip shows, for people who cannot watch it. */
  label: string
  caption: string
}

// A short silent clip the reader plays when they want to (diagram animations).
export default function Clip({ src, label, caption }: ClipProps) {
  return (
    <figure>
      <video
        controls
        muted
        playsInline
        preload="metadata"
        poster={`${src}-poster.jpg`}
        aria-label={label}
        className="w-full rounded-xl"
      >
        <source src={`${src}.webm`} type="video/webm" />
        <source src={`${src}.mp4`} type="video/mp4" />
      </video>
      <figcaption className="text-center">{caption}</figcaption>
    </figure>
  )
}
