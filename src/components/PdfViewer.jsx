import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

function PdfViewer({ pdf, onClose }) {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    return (
        <div className="pdf-modal">

            <div className="pdf-box">

                <button className="close-btn" onClick={onClose}>
                    ✖
                </button>

                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <Viewer
                        fileUrl={pdf}
                        plugins={[defaultLayoutPluginInstance]}
                    />
                </Worker>

            </div>

        </div>
    );
}

export default PdfViewer;