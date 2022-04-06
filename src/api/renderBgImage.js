// @ts-check
import getImg from "../utils/getImg.js";
import getLink from "../utils/getLink.js";
import getImage from "../utils/getImage.js";
import { globalConfigOptions } from "../runtimeChecks.js";
import getBackgroundStyles from "../utils/getBackgroundStyles.js";

export default async function renderPicture(props) {
  const {
    src,
    alt,
    Tag = "section",
    content,
    sizes = (breakpoints) => {
      const maxWidth = breakpoints.at(-1);
      return `(min-width: ${maxWidth}px) ${maxWidth}px, 100vw`;
    },
    preload,
    loading = preload ? "eager" : "lazy",
    decoding = "async",
    breakpoints,
    objectFit = "cover",
    objectPosition = "50% 50%",
    layout = "constrained",
    placeholder = "blurred",
    artDirectives,
    format = ["avif", "webp"],
    formatOptions = {
      tracedSVG: {
        function: "trace",
      },
    },
    fadeInTransition = true,
    fallbackFormat,
    includeSourceFormat = true,
    ...configOptions
  } = props;

  const start = performance.now();
  const { uuid, images } = await getImage(
    src,
    sizes,
    format,
    breakpoints,
    placeholder,
    artDirectives,
    fallbackFormat,
    includeSourceFormat,
    formatOptions,
    configOptions,
    globalConfigOptions
  );
  const end = performance.now();

  console.log(`Image at ${src} optimized in ${end - start}ms`);

  const className = `astro-imagetools-picture-${uuid}`;

  const imagesrcset =
    preload &&
    images.at(-1).sources.find(({ format: fmt }) => fmt === preload)?.srcset;

  const { imagesizes } = images.at(-1);

  const style = getBackgroundStyles(
    images,
    className,
    objectFit,
    objectPosition,
    fadeInTransition
  );

  const link = getLink(preload, imagesizes, imagesrcset);

  const sources = images.flatMap(({ media, sources, sizes, imagesizes }) =>
    sources.map(({ format, src, srcset }) =>
      src
        ? getImg(
            src,
            alt,
            sizes,
            style,
            srcset,
            layout,
            loading,
            decoding,
            imagesizes,
            fadeInTransition,
            { isBackgroundImage: true }
          )
        : `<source
            srcset="${srcset}"
            sizes="${imagesizes}"
            width="${sizes.width}"
            height="${sizes.height}"
            type="${`image/${format}`}"
            ${media ? `media="${media}"` : ""}
          />`
    )
  );

  const picture = `<picture
    class="astro-imagetools-picture ${style ? className : ""}"
    style="z-index: -1; position: absolute; width: 100%; height: 100%;${
      style ? "display: inline-block" : ""
    }"
    >${sources.join("\n")}
  </picture>`;

  const htmlElement = `<${Tag} style="position: relative;">${
    picture + content
  }</${Tag}>`;

  return { link, style, htmlElement };
}
