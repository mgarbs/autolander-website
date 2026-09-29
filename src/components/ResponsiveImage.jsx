import { responsiveImageProps } from '../../shared/responsive-images.js';

export default function ResponsiveImage({ image, sizes, eager = false, className }) {
  const props = responsiveImageProps(image, { sizes, eager, className });
  return <picture>{props.sources.map((source) => <source key={source.type} {...source} />)}<img {...props.img} /></picture>;
}
