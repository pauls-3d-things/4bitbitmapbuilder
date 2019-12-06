export const toAvgGrayScale = (imgData: ImageData, truncateBits: 4 | 5) => {
    for (let i = 0; i < imgData.data.length; i += 4) {
        const avgValue = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
        const avg4BitValue = (avgValue >>> truncateBits) << truncateBits;
        imgData.data[i] = avg4BitValue;
        imgData.data[i + 1] = avg4BitValue;
        imgData.data[i + 2] = avg4BitValue;
        imgData.data[i + 3] = 255;
    }
};

export const invert = (imgData: ImageData) => {
    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255 - imgData.data[i];
        imgData.data[i + 1] = 255 - imgData.data[i + 1];
        imgData.data[i + 2] = 255 - imgData.data[i + 2];
        imgData.data[i + 3] = 255;
    }
};

// assumption: image is already greyscale
export const toCode = (imgData: ImageData, imgCounter: number, origName: string, width: number, height: number): string => {
    let values = [];
    for (let i = 0; i < imgData.data.length; i += 8) {
        const value = (imgData.data[i] & 0b11110000) + ((imgData.data[i + 4]) >>> 4);
        values.push("0x" + (value).toString(16));
    }

    // TODO: convert to x values per row

    const code = "#ifndef IMG_" + imgCounter + "_H"
        + "\n#define IMG_" + imgCounter + "_H"
        + "\n// " + origName
        + "\n#define IMG_" + imgCounter + "_WIDTH " + width
        + "\n#define IMG_" + imgCounter + "_HEIGHT " + height
        + "\nconst uint8_t img" + imgCounter + " PROGMEM[" + (imgData.data.length / 8) + "] = {" // div by 8  because div by 4 to get to pixels, and two pixels per byte
        + "\n" + values.join(", \n") // some editors don't like long lines
        + "\n};"
        + "\n#endif";

    console.log("done");
    return code;
};

interface Pixel {
    r: number;
    g: number;
    b: number;
    t: number;
}

// dithering algo implemented after https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
export const ditherFloydSteinberg = (imgData: ImageData) => {
    const pixel = (x: number, y: number): Pixel => {
        const o = (y * imgData.width + x) * 4; // offset -> o
        return {
            r: imgData.data[o],
            g: imgData.data[o + 1],
            b: imgData.data[o + 2],
            t: imgData.data[o + 3]
        };
    };

    const setPixel = (x: number, y: number, pixel: Pixel) => {
        const o = (y * imgData.width + x) * 4; // offset -> o
        imgData.data[o] = pixel.r;
        imgData.data[o + 1] = pixel.g;
        imgData.data[o + 2] = pixel.b;
        imgData.data[o + 3] = pixel.t;
    };

    const findClosestPaletteColor = (oldPixel: Pixel) => {
        // assume 4 bit depth for each pixel
        return {
            r: (oldPixel.r >>> 4) << 4,
            g: (oldPixel.g >>> 4) << 4,
            b: (oldPixel.b >>> 4) << 4,
            t: oldPixel.t
        };
    };

    const getQuantError = (oldPixel: Pixel, newPixel: Pixel) => {
        return {
            r: oldPixel.r - newPixel.r,
            g: oldPixel.g - newPixel.g,
            b: oldPixel.b - newPixel.b,
            t: oldPixel.t
        };
    };

    const quantize = (pixel: Pixel, error: Pixel, mult: number, div: number) => {
        return {
            r: pixel.r + error.r * mult / div,
            g: pixel.g + error.g * mult / div,
            b: pixel.b + error.b * mult / div,
            t: pixel.t
        };
    };

    for (let y = 0; y < imgData.height; y++) {
        for (let x = 0; x < imgData.width; x++) {
            const oldPixel = pixel(x, y);
            const newPixel = findClosestPaletteColor(oldPixel);
            setPixel(x, y, newPixel);
            const quantError = getQuantError(oldPixel, newPixel);
            setPixel(x + 1, y, quantize(pixel(x + 1, y), quantError, 7, 16));
            setPixel(x - 1, y + 1, quantize(pixel(x - 1, y + 1), quantError, 3, 16));
            setPixel(x, y + 1, quantize(pixel(x, y + 1), quantError, 5, 16));
            setPixel(x + 1, y + 1, quantize(pixel(x + 1, y + 1), quantError, 1, 16));
        }
    }
    //     for each y from top to bottom
    //    for each x from left to right
    //       oldpixel  := pixel[x][y]
    //       newpixel  := find_closest_palette_color(oldpixel)
    //       pixel[x][y]  := newpixel
    //       quant_error  := oldpixel - newpixel
    //       pixel[x + 1][y    ] := pixel[x + 1][y    ] + quant_error * 7 / 16
    //       pixel[x - 1][y + 1] := pixel[x - 1][y + 1] + quant_error * 3 / 16
    //       pixel[x    ][y + 1] := pixel[x    ][y + 1] + quant_error * 5 / 16
    //       pixel[x + 1][y + 1] := pixel[x + 1][y + 1] + quant_error * 1 / 16
};
