import type { MDXComponents } from 'mdx/types'
import GPUModelMatrix from '@/components/gpu-model-matrix'
import ChainLines from '@/components/chain-lines'
import Clip from '@/components/clip'
import Cover from '@/components/cover'
import Footnote from '@/components/footnote'
import Formula from '@/components/formula'
import SongPlayer from '@/components/song-player'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    GPUModelMatrix,
    ChainLines,
    Clip,
    Cover,
    Footnote,
    Formula,
    SongPlayer,
  }
}
