import * as React from "react";
import Panel from "bloomer/lib/components/Panel/Panel";
import PanelHeading from "bloomer/lib/components/Panel/PanelHeading";
import PanelBlock from "bloomer/lib/components/Panel/PanelBlock";
import Field from "bloomer/lib/elements/Form/Field/Field";
import Label from "bloomer/lib/elements/Form/Label";
import Control from "bloomer/lib/elements/Form/Control";
import Select from "bloomer/lib/elements/Form/Select";
import Section from "bloomer/lib/layout/Section";
import Container from "bloomer/lib/layout/Container";
import Column from "bloomer/lib/grid/Column";
import Columns from "bloomer/lib/grid/Columns";
import MonacoEditor, { EditorDidMount } from "react-monaco-editor";

export interface MyAppState {
    invert: boolean;
    width: number;
    height: number;
    code: string;
}

export class MyApp extends React.Component<{}, MyAppState> {
    canvas?: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null = null;
    img?: HTMLImageElement;
    fileInput: HTMLInputElement | null = null;

    constructor(props: {}, state: MyAppState) {
        super(props, state);
        this.onChange = this.onChange.bind(this);
        this.canvas2Code = this.canvas2Code.bind(this);

        this.state = {
            invert: false,
            width: 800,
            height: 600,
            code: "// Please load an image to see the code"
        };
    }

    onChange(event: React.ChangeEvent) {
        // NOP
        console.log(event);

        if (this.img && this.fileInput && this.fileInput.files) {
            const file = this.fileInput.files[0];
            const reader = new FileReader();

            reader.addEventListener("load", () => {
                if (this.img && typeof reader.result === "string") {
                    this.img.src = reader.result;
                    if (this.ctx) {
                        console.log("drawing");
                        // TODO: do scaling here
                        this.ctx.drawImage(this.img, 0, 0, this.state.width, this.state.height);

                        const imgData = this.ctx.getImageData(0, 0, this.state.width, this.state.height);

                        console.log(imgData.width, imgData.height);

                        if (this.state.invert) {
                            for (let i = 0; i < imgData.data.length; i += 4) {
                                imgData.data[i] = 255 - imgData.data[i];
                                imgData.data[i + 1] = 255 - imgData.data[i + 1];
                                imgData.data[i + 2] = 255 - imgData.data[i + 2];
                                imgData.data[i + 3] = 255;
                            }
                        }

                        const toGrayScale = (truncateBits: 4 | 5) => {
                            for (let i = 0; i < imgData.data.length; i += 4) {
                                // 256 is 8 bit
                                // 16 is 4 bit
                                // 256/16 = 16
                                const avgValue = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
                                const avg4BitValue = (avgValue >>> truncateBits) << truncateBits;
                                imgData.data[i] = avg4BitValue;
                                imgData.data[i + 1] = avg4BitValue;
                                imgData.data[i + 2] = avg4BitValue;
                                imgData.data[i + 3] = 255;
                            }
                        };

                        toGrayScale(4);
                        this.canvas2Code(imgData);
                        toGrayScale(5);
                        this.ctx.putImageData(imgData, 0, 0);
                    }
                }
            }, false);

            if (file) {
                reader.readAsDataURL(file);
            }
        }
    }

    editorDidMount: EditorDidMount = (editor, monaco) => {
        console.log("editorDidMount", editor);
        editor.focus();
    }

    canvas2Code(imgData: ImageData) {
        let values = [];
        // assumption: image is already greyscale
        for (let i = 0; i < imgData.data.length; i += 8) {
            const value = (imgData.data[i] & 0b11110000) + ((imgData.data[i + 4]) >>> 4);
            values.push("0x" + (value).toString(16));
        }

        const code = "#ifndef IMG_H"
            + "\n#define IMG_H"
            + "\nconst uint8_t img PROGMEM[240000] = {"
            + "\n" + values.join(", \n")
            + "\n};"
            + "\n#endif";

        console.log("done");
        this.setState({ code });
    }

    render() {
        return (
            <Section>
                <Container>
                    <Panel>
                        <PanelHeading>4-bit Bitmap Builder</PanelHeading>
                        <PanelBlock>
                            <Columns>
                                <Column isSize="1/4">
                                    <Field>
                                        <Label>Open an image:</Label>
                                        <input type="file" accept="image/*" onChange={this.onChange} ref={c => {
                                            if (c) {
                                                this.fileInput = c;
                                            }
                                        }} />
                                    </Field>
                                    <img src="" width="240" height="180" ref={c => {
                                        if (c) {
                                            this.img = c;
                                        }
                                    }} />
                                </Column>
                                <Column isSize="2/3">
                                    <canvas width="800" height="600"
                                        style={{ border: "1px", borderColor: "black" }}
                                        ref={c => {
                                            if (c) {
                                                this.canvas = c;
                                                this.ctx = c.getContext("2d");
                                            }
                                        }}>
                                    </canvas>
                                </Column>
                            </Columns>
                        </PanelBlock>
                    </Panel>
                    <Panel>
                        <PanelHeading>Code Preview</PanelHeading>
                        <PanelBlock>
                            <MonacoEditor
                                width="800"
                                height="600"
                                language="javascript"
                                theme="vs-light"
                                value={this.state.code}
                                options={{}}
                                editorDidMount={this.editorDidMount}
                            /></PanelBlock>
                    </Panel>
                </Container>
            </Section >
        );
    }
}
