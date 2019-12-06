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
export const toCode = (imgData: ImageData): string => {
    let values = [];
    for (let i = 0; i < imgData.data.length; i += 8) {
        const value = (imgData.data[i] & 0b11110000) + ((imgData.data[i + 4]) >>> 4);
        values.push("0x" + (value).toString(16));
    }

    // TODO: convert to x values per row

    const code = "#ifndef IMG_H"
        + "\n#define IMG_H"
        + "\nconst uint8_t img PROGMEM[240000] = {"
        + "\n" + values.join(", \n") // some editors don't like long lines
        + "\n};"
        + "\n#endif";

    console.log("done");
    return code;
};

// dithering algo implemented after https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering
export const ditherFloydSteinberg = (imgData: ImageData) => {
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
