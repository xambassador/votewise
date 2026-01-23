const defaultImageSizes = [32, 48, 64, 96, 128, 256, 384, 512, 640];
const deviceSizes = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

function getWidths(width?: number, sizes?: string) {
  if (sizes) {
    const viewportWidthRe = /(^|\s)(1?\d?\d)vw/g;
    const percentSizes = [];
    for (let match; (match = viewportWidthRe.exec(sizes)); match) {
      percentSizes.push(parseInt(match[2]));
    }
    if (percentSizes.length) {
      const smallestRatio = Math.min(...percentSizes) * 0.01;
      return {
        widths: defaultImageSizes.filter((s) => s >= deviceSizes[0] * smallestRatio),
        kind: "w",
        imageSizes: defaultImageSizes,
        devices: deviceSizes
      };
    }

    const px = sizes.match(/(\d+)px/g);
    if (px) {
      const pxSizes = px.map((size) => parseInt(size.replace("px", "")));
      const maxPxSize = Math.max(...pxSizes);
      const predefinedSize =
        defaultImageSizes.find((s) => s >= maxPxSize) || defaultImageSizes[defaultImageSizes.length - 1];
      return {
        widths: [predefinedSize],
        kind: "w",
        imageSizes: [predefinedSize],
        devices: deviceSizes
      };
    }

    return { widths: defaultImageSizes, kind: "w", imageSizes: defaultImageSizes, devices: deviceSizes };
  }
  const kind = "w";
  if (width) {
    // Finding the nearest sizes for width
    // Small port of next/image's srcset generation from https://github.com/vercel/next.js/blob/633e274965b78dff11c59702794823dbf92f689a/packages/next/src/shared/lib/get-img-props.ts#L224
    const widths = [
      ...Array.from(
        new Set(
          [width, width * 2].map(
            (w) => defaultImageSizes.find((dw) => dw >= w) || defaultImageSizes[defaultImageSizes.length - 1]
          )
        )
      )
    ];
    return { widths, kind: "x", imageSizes: widths, devices: deviceSizes };
  }
  return { widths: defaultImageSizes, kind, imageSizes: defaultImageSizes };
}

export function getSrcSet(url: string, opts?: { quality?: number; width?: number | string; sizes?: string }) {
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return {
      srcSet: "",
      sizes: "",
      url
    };
  }
  const { quality = 75, width } = opts || {};
  const q = quality;
  const baseUrl = url.split("?")[0];
  const { kind, widths, imageSizes } = getWidths(Number(width), opts?.sizes);
  const last = imageSizes[imageSizes.length - 1];
  return {
    srcSet: widths.map((width, i) => `${baseUrl}?w=${width}&q=${q} ${kind === "w" ? width : i + 1}${kind}`).join(", "),
    sizes: opts?.sizes || (kind === "w" ? "100vw" : undefined),
    url: `${baseUrl}?w=${last}&q=${q}`
  };
}
