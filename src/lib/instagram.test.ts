import { parseInstagramPost } from "./instagram";

describe("parseInstagramPost", () => {
    it("should parse basic OG tags for an image", () => {
        const html = `
      <html>
        <head>
          <meta property="og:image" content="https://example.com/image.jpg" />
          <meta property="og:title" content="Test Post" />
          <meta property="og:description" content="Test Description" />
        </head>
      </html>
    `;
        const result = parseInstagramPost(html);
        expect(result).toEqual({
            type: "image",
            thumbnail: "https://example.com/image.jpg",
            url: "https://example.com/image.jpg",
            title: "Test Post",
            description: "Test Description",
        });
    });

    it("should parse basic OG tags for a video", () => {
        const html = `
      <html>
        <head>
          <meta property="og:video" content="https://example.com/video.mp4" />
          <meta property="og:image" content="https://example.com/thumb.jpg" />
        </head>
      </html>
    `;
        const result = parseInstagramPost(html);
        expect(result).toEqual({
            type: "video",
            thumbnail: "https://example.com/thumb.jpg",
            url: "https://example.com/video.mp4",
            title: "",
            description: "",
        });
    });

    it("should return null if no media found", () => {
        const html = "<html><body>No media here</body></html>";
        const result = parseInstagramPost(html);
        expect(result).toBeNull();
    });
});
