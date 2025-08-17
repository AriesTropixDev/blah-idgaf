"use client"

export default function InvertStyles() {
  // White mode inversion that keeps media normal.
  // When .voyage-invert is on <html>, invert the whole page, then
  // double-invert media so they appear original.
  const css = `
  /* Invert the entire page when white mode is enabled */
  .voyage-invert body {
    filter: invert(1) hue-rotate(180deg);
    background: #ffffff; /* ensures the base looks white after inversion */
  }

  /* Keep media natural by double-inverting them back */
  .voyage-invert img,
  .voyage-invert picture,
  .voyage-invert video,
  .voyage-invert canvas,
  .voyage-invert svg,
  .voyage-invert iframe {
    filter: invert(1) hue-rotate(180deg) !important;
  }

  /* If some element should follow the page inversion (rare), opt it out */
  .voyage-invert .force-invert {
    filter: none !important; /* accepts page inversion */
  }
  `
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
