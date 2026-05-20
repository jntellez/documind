import { buildDocumentSpeechText, documentToPlainText } from "./documentToPlainText";

describe("documentToPlainText", () => {
  test("strips tags and keeps readable spacing", () => {
    const html = "<h1>Título</h1><p>Hola<br/>mundo</p><ul><li>Item</li></ul>";

    expect(documentToPlainText(html)).toContain("Título\nHola\nmundo\n• Item");
  });

  test("decodes entities and removes scripts", () => {
    const html = "<script>alert('x')</script><p>Tom &amp; Jerry &#33;</p>";

    expect(documentToPlainText(html)).toBe("Tom & Jerry !");
  });
});

describe("buildDocumentSpeechText", () => {
  test("joins title and normalized body", () => {
    const output = buildDocumentSpeechText({
      title: "Resumen",
      content: "<p>Contenido&nbsp;principal</p>",
    });

    expect(output).toBe("Resumen.\n\nContenido principal");
  });
});
