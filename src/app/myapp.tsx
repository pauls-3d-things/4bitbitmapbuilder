import * as React from "react";
import Panel from "bloomer/lib/components/Panel/Panel";
import PanelHeading from "bloomer/lib/components/Panel/PanelHeading";
import PanelBlock from "bloomer/lib/components/Panel/PanelBlock";
import Field from "bloomer/lib/elements/Form/Field/Field";
import Control from "bloomer/lib/elements/Form/Control";
import Checkbox from "bloomer/lib/elements/Form/Checkbox";
import Label from "bloomer/lib/elements/Form/Label";
import Section from "bloomer/lib/layout/Section";
import Container from "bloomer/lib/layout/Container";
import Column from "bloomer/lib/grid/Column";
import Columns from "bloomer/lib/grid/Columns";
import MonacoEditor, { EditorDidMount } from "react-monaco-editor";
import { toAvgGrayScale, invert } from "./util";

export interface Size {
    width: number;
    height: number;
}

export interface MyAppState {
    code: string;
    invert: boolean;
    dither: boolean;
    simulate3Bit: boolean;
    scaleDown: boolean;

    origSize?: Size;
    canvasSize?: Size;
    targetSize: Size;
}

export class MyApp extends React.Component<{}, MyAppState> {
    canvas?: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null = null;
    img?: HTMLImageElement;
    fileInput: HTMLInputElement | null = null;

    constructor(props: {}, state: MyAppState) {
        super(props, state);
        this.onChange = this.onChange.bind(this);
        this.preview = this.preview.bind(this);
        this.toggleInvert = this.toggleInvert.bind(this);
        this.toggleDither = this.toggleDither.bind(this);
        this.toggleScaleDown = this.toggleScaleDown.bind(this);
        this.toggleSimulate3Bit = this.toggleSimulate3Bit.bind(this);
        this.draw = this.draw.bind(this);

        this.state = {
            invert: false,
            dither: true,
            simulate3Bit: true,
            scaleDown: true,
            targetSize: { width: 800, height: 600 },
            code: "// Please load an image to see the code"
        };
    }

    toggleInvert() {
        this.setState((prev: MyAppState, props: {}) => ({ invert: !prev.invert }), this.draw);
    }

    toggleDither() {
        this.setState((prev: MyAppState, props: {}) => ({ dither: !prev.dither }), this.draw);
    }

    toggleSimulate3Bit() {
        this.setState((prev: MyAppState, props: {}) => ({ simulate3Bit: !prev.simulate3Bit }), this.draw);
    }

    toggleScaleDown() {
        this.setState((prev: MyAppState, props: {}) => ({ scaleDown: !prev.scaleDown }), this.draw);
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

                    // grab meta data
                    this.setState({
                        origSize: { width: this.img.width, height: this.img.height },
                        canvasSize: this.state.targetSize
                    });
                }
            }, false);

            if (file) {
                reader.readAsDataURL(file);
            }
        }
    }

    preview(imgData: ImageData) {
        if (imgData) {
            console.log("preview size:", imgData.width, imgData.height);

            if (this.state.invert) {
                invert(imgData);
            }
            toAvgGrayScale(imgData, 4);
            if (this.state.simulate3Bit) {
                toAvgGrayScale(imgData, 5);
            }
        }
        return imgData;
    }

    editorDidMount: EditorDidMount = (editor, monaco) => {
        console.log("editorDidMount", editor);
        editor.focus();
    }

    draw() {
        if (this.img && this.ctx) {

            console.log("drawing");
            if (this.state.scaleDown) {
                this.ctx.drawImage(this.img, 0, 0, this.state.targetSize.width, this.state.targetSize.height);
                const origImageData = this.ctx.getImageData(0, 0, this.img.width, this.img.height);

                this.ctx.putImageData(origImageData, this.state.targetSize.width, this.state.targetSize.height);
                const imgData = this.preview(this.ctx.getImageData(0, 0, this.state.targetSize.width, this.state.targetSize.height));
                this.ctx.putImageData(imgData, 0, 0);
            } else {
                this.ctx.drawImage(this.img, 0, 0);
                const origImageData = this.ctx.getImageData(0, 0, this.img.width, this.img.height);

                this.ctx.putImageData(origImageData, 0, 0); // no scale
                const imgData = this.preview(this.ctx.getImageData(0, 0, this.state.targetSize.width, this.state.targetSize.height));
                this.ctx.putImageData(imgData, 0, 0);
            }
        }
    }

    render() {
        if (this.ctx) {
            this.draw();
        }

        return (
            <Section>
                <Container>
                    <Panel>
                        <PanelHeading>4-bit Bitmap Builder</PanelHeading>
                        <PanelBlock>
                            <Columns>
                                <Column isSize="1/4">
                                    <Field>
                                        <Label>Open Image:</Label>
                                        <input type="file" accept="image/*" onChange={this.onChange} ref={c => {
                                            if (c) {
                                                this.fileInput = c;
                                            }
                                        }} />
                                    </Field>
                                    <Field>
                                        <Label>Image Data</Label>
                                        <ul>
                                            <li>Width: {this.state.origSize ? this.state.origSize.width : ""}</li>
                                            <li>Height: {this.state.origSize ? this.state.origSize.height : ""}</li>
                                        </ul>
                                    </Field>
                                    <Field>
                                        <Label>Output Options:</Label>
                                        <Control>
                                            <input style={{ width: "4em" }} type="number" value={this.state.targetSize.width}></input>x<input style={{ width: "4em" }} type="number" value={this.state.targetSize.height}></input><br />
                                            <br />
                                            <Checkbox onClick={this.toggleInvert} checked={this.state.invert}> Invert</Checkbox><br />
                                            <Checkbox onClick={this.toggleDither} checked={this.state.dither}> Dither</Checkbox><br />
                                            <Checkbox onClick={this.toggleScaleDown} checked={this.state.scaleDown}> Scale down</Checkbox> <br />
                                            <Checkbox onClick={this.toggleSimulate3Bit} checked={this.state.simulate3Bit}> Simulate 3-bit</Checkbox>
                                        </Control>
                                    </Field>
                                </Column>
                                <Column isSize="2/3">
                                    <canvas width={this.state.canvasSize ? this.state.canvasSize.width : ""}
                                        height={this.state.canvasSize ? this.state.canvasSize.height : ""}
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
                    <div style={{ width: "1em", height: "1em", overflow: "hidden" }}>

                        <img src="" style={{ maxWidth: "4096px", visibility: "hidden" }} ref={c => {
                            if (c) {
                                this.img = c;
                            }
                        }} />
                    </div>

                </Container>
            </Section >
        );
    }
}
