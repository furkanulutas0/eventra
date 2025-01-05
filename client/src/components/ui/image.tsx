import { cn } from "../../lib/utils"

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
}

const Image = ({ className, src, alt, ...props }: ImageProps) => {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("object-contain", className)}
      {...props}
    />
  )
}

export default Image 